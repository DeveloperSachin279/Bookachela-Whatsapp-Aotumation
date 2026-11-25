const config = require('./config');
const messages = require('./messages');
const sessionManager = require('./session');
const sheetsService = require('./sheets');
const { sendTextMessage, sendInteractiveButtons, markMessageAsRead } = require('./whatsapp');

/**
 * Main Message Router and State Machine
 */
async function handleIncomingMessage(webhookMessage) {
  const from = webhookMessage.from; // User's WhatsApp phone number (e.g. "919876543210")
  const messageId = webhookMessage.id;

  // Mark message as read
  if (messageId) {
    markMessageAsRead(messageId).catch(() => {});
  }

  const session = sessionManager.getSession(from);

  // Extract text or button payload
  let userText = '';
  if (webhookMessage.type === 'text' && webhookMessage.text) {
    userText = webhookMessage.text.body.trim();
  } else if (webhookMessage.type === 'interactive' && webhookMessage.interactive) {
    if (webhookMessage.interactive.type === 'button_reply') {
      userText = webhookMessage.interactive.button_reply.id || webhookMessage.interactive.button_reply.title;
    } else if (webhookMessage.interactive.type === 'list_reply') {
      userText = webhookMessage.interactive.list_reply.id || webhookMessage.interactive.list_reply.title;
    }
  }

  if (!userText) {
    // Non-text message (e.g. audio, sticker)
    await sendTextMessage(from, "Namaste! Kripya text message ya buttons ka use karke reply karein. 🙏\n\n'menu' type karein Main Menu dekhne ke liye.");
    return;
  }

  console.log(`[Bot Inbound] From: ${from} | Message: "${userText}"`);

  const lower = userText.toLowerCase().trim();

  // Global Navigation: Reset / Main Menu
  const globalResetWords = ['hi', 'hello', 'hey', 'start', 'restart', 'menu', 'main menu', 'reset', '0'];
  if (globalResetWords.includes(lower) && session.state !== 'CUSTOMER_NAME' && session.state !== 'CHELA_NAME_AGE') {
    sessionManager.resetSession(from);
    await sendMainMenu(from);
    return;
  }

  // State Machine Routing
  switch (session.state) {
    case 'WAITING_ROLE':
      await handleWaitingRole(from, userText, session);
      break;

    // --- CUSTOMER PATH ---
    case 'CUSTOMER_NAME':
      session.data.name = userText;
      sessionManager.updateSession(from, { state: 'CUSTOMER_SERVICE', data: session.data });
      await sendTextMessage(from, messages.CUSTOMER_ASK_SERVICE(session.data.name));
      break;

    case 'CUSTOMER_SERVICE':
      session.data.service = userText;
      sessionManager.updateSession(from, { state: 'CUSTOMER_LOCATION', data: session.data });
      await sendTextMessage(from, messages.CUSTOMER_ASK_LOCATION);
      break;

    case 'CUSTOMER_LOCATION':
      session.data.location = userText;
      sessionManager.updateSession(from, { state: 'CUSTOMER_TIME', data: session.data });
      await sendTextMessage(from, messages.CUSTOMER_ASK_TIME);
      break;

    case 'CUSTOMER_TIME':
      session.data.urgency = userText;
      sessionManager.updateSession(from, { state: 'CUSTOMER_DURATION', data: session.data });
      await sendTextMessage(from, messages.CUSTOMER_ASK_DURATION);
      break;

    case 'CUSTOMER_DURATION': {
      session.data.duration = userText;

      // 1. Send closing message immediately (fast response)
      await sendTextMessage(from, messages.CUSTOMER_CLOSING(session.data.name, session.data));

      // 2. Append to Google Sheets asynchronously (non-blocking)
      sheetsService.saveCustomerLead({
        phone: from,
        name: session.data.name,
        service: session.data.service,
        location: session.data.location,
        urgency: `${session.data.urgency} (${session.data.duration})`
      }).catch(err => console.error('[Lead Save Error]:', err));

      // 3. Send WhatsApp Alert to Client / Admin
      if (config.admin && config.admin.notificationPhone) {
        sendTextMessage(config.admin.notificationPhone, messages.ADMIN_CUSTOMER_ALERT({
          phone: from,
          name: session.data.name,
          service: session.data.service,
          location: session.data.location,
          urgency: session.data.urgency,
          duration: session.data.duration
        })).catch(err => console.error('[Admin Customer Alert Error]:', err.message));
      }

      // 4. Reset session
      sessionManager.resetSession(from);
      break;
    }

    // --- CHELA APPLICANT PATH ---
    case 'CHELA_NAME_AGE':
      session.data.nameAge = userText;
      sessionManager.updateSession(from, { state: 'CHELA_SKILLS', data: session.data });
      await sendTextMessage(from, messages.CHELA_ASK_SKILLS);
      break;

    case 'CHELA_SKILLS':
      session.data.skills = userText;
      sessionManager.updateSession(from, { state: 'CHELA_LOCATION', data: session.data });
      await sendTextMessage(from, messages.CHELA_ASK_LOCATION);
      break;

    case 'CHELA_LOCATION':
      session.data.location = userText;
      sessionManager.updateSession(from, { state: 'CHELA_WORK_TYPE', data: session.data });
      await sendTextMessage(from, messages.CHELA_ASK_WORK_TYPE);
      break;

    case 'CHELA_WORK_TYPE': {
      let workTypeText = userText;
      if (lower === '1' || lower.includes('full')) {
        workTypeText = 'Full-time availability';
      } else if (lower === '2' || lower.includes('part')) {
        workTypeText = 'Part-time availability';
      } else if (lower === '3' || lower.includes('weekend')) {
        workTypeText = 'Sirf weekends';
      } else if (lower === '4' || lower.includes('flex')) {
        workTypeText = 'Flexible timing';
      }
      session.data.workType = workTypeText;

      await completeChelaApplication(from, session);
      break;
    }

    // --- FAQ MENU PATH ---
    case 'FAQ_MENU':
      await handleFaqSelection(from, userText, session);
      break;

    default:
      sessionManager.resetSession(from);
      await sendMainMenu(from);
      break;
  }
}

/**
 * Handle initial role choice (Customer vs Chela vs FAQs)
 */
async function handleWaitingRole(from, input, session) {
  const lower = input.toLowerCase().trim();

  // Option 1: Customer
  if (lower === '1' || lower.includes('customer') || lower.includes('book') || lower === 'btn_customer') {
    sessionManager.updateSession(from, { state: 'CUSTOMER_NAME' });
    await sendTextMessage(from, messages.CUSTOMER_ASK_NAME);
    return;
  }

  // Option 2: Chela Applicant
  if (lower === '2' || lower.includes('chela') || lower.includes('apply') || lower.includes('job') || lower === 'btn_chela') {
    sessionManager.updateSession(from, { state: 'CHELA_NAME_AGE' });
    await sendTextMessage(from, messages.CHELA_ASK_NAME_AGE);
    return;
  }

  // Option 3: FAQs
  if (lower === '3' || lower.includes('faq') || lower.includes('sawal') || lower.includes('jankari') || lower === 'btn_faq') {
    sessionManager.updateSession(from, { state: 'FAQ_MENU' });
    await sendTextMessage(from, messages.FAQ_MENU);
    return;
  }

  // Default: Show Main Menu
  await sendMainMenu(from);
}

/**
 * Handle FAQ Question Selection
 */
async function handleFaqSelection(from, input, session) {
  const lower = input.toLowerCase().trim();

  if (lower === 'a' || lower.includes('kya hai')) {
    await sendTextMessage(from, messages.FAQ_A);
    return;
  }
  if (lower === 'b' || lower.includes('price') || lower.includes('charge')) {
    await sendTextMessage(from, messages.FAQ_B);
    return;
  }
  if (lower === 'c' || lower.includes('safe') || lower.includes('verify')) {
    await sendTextMessage(from, messages.FAQ_C);
    return;
  }
  if (lower === 'd' || lower.includes('earn') || lower.includes('kamai')) {
    await sendTextMessage(from, messages.FAQ_D);
    return;
  }
  if (lower === 'e' || lower.includes('cancel') || lower.includes('refund')) {
    await sendTextMessage(from, messages.FAQ_E);
    return;
  }
  if (lower === 'f' || lower.includes('support') || lower.includes('help') || lower.includes('call') || lower.includes('speak')) {
    await sendTextMessage(from, messages.FAQ_F);
    return;
  }

  // Quick Switch from FAQ to Customer or Chela
  if (lower === '1') {
    sessionManager.updateSession(from, { state: 'CUSTOMER_NAME' });
    await sendTextMessage(from, messages.CUSTOMER_ASK_NAME);
    return;
  }
  if (lower === '2') {
    sessionManager.updateSession(from, { state: 'CHELA_NAME_AGE' });
    await sendTextMessage(from, messages.CHELA_ASK_NAME_AGE);
    return;
  }

  // Return to Main Menu
  if (lower === '0' || lower === 'menu') {
    sessionManager.resetSession(from);
    await sendMainMenu(from);
    return;
  }

  // Repeat FAQ menu if unrecognized
  await sendTextMessage(from, messages.FAQ_MENU);
}

/**
 * Send Main Menu with Interactive Buttons (fallback to text)
 */
async function sendMainMenu(from) {
  try {
    await sendInteractiveButtons(
      from,
      messages.MAIN_MENU,
      [
        { id: 'btn_customer', title: '🛒 Book a CHELA' },
        { id: 'btn_chela', title: '💼 Work with CHELA' },
        { id: 'btn_faq', title: '❓ Services & FAQs' }
      ]
    );
  } catch (err) {
    // If interactive buttons fail (e.g. window or format restrictions), fallback to standard text
    await sendTextMessage(from, messages.MAIN_MENU);
  }
}

/**
 * Complete Chela Application: Send Closing + Save Sheets + Notify Client
 */
async function completeChelaApplication(from, session) {
  const friendlyName = (session.data.nameAge || '').split(/[, ]+/)[0] || 'Dost';

  // 1. Send closing message to applicant
  await sendTextMessage(from, messages.CHELA_CLOSING(friendlyName, session.data));

  // 2. Append to Google Sheets asynchronously
  sheetsService.saveChelaApplicant({
    phone: from,
    nameAge: session.data.nameAge,
    skills: session.data.skills,
    location: session.data.location,
    workType: session.data.workType
  }).catch(err => console.error('[Applicant Save Error]:', err));

  // 3. Send WhatsApp Alert to Client / Admin
  if (config.admin && config.admin.notificationPhone) {
    sendTextMessage(config.admin.notificationPhone, messages.ADMIN_CHELA_ALERT({
      phone: from,
      nameAge: session.data.nameAge,
      skills: session.data.skills,
      location: session.data.location,
      workType: session.data.workType
    })).catch(err => console.error('[Admin Chela Alert Error]:', err.message));
  }

  // 4. Reset session
  sessionManager.resetSession(from);
}

module.exports = {
  handleIncomingMessage
};

