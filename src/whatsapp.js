const axios = require('axios');
const config = require('./config');

/**
 * Helper to call Meta WhatsApp Graph API
 */
async function callWhatsAppApi(payload) {
  if (!config.meta.accessToken || !config.meta.phoneNumberId) {
    console.warn('[WhatsApp API] Missing META_ACCESS_TOKEN or META_PHONE_NUMBER_ID in config.');
    return null;
  }

  const url = `https://graph.facebook.com/${config.meta.apiVersion}/${config.meta.phoneNumberId}/messages`;

  try {
    const response = await axios.post(url, payload, {
      headers: {
        'Authorization': `Bearer ${config.meta.accessToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    const errData = error.response ? error.response.data : error.message;
    console.error('[WhatsApp API Error]:', JSON.stringify(errData, null, 2));
    throw error;
  }
}

/**
 * Send standard text message
 */
async function sendTextMessage(to, text) {
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: to,
    type: 'text',
    text: {
      preview_url: false,
      body: text
    }
  };
  return callWhatsAppApi(payload);
}

/**
 * Send Interactive Quick Reply Buttons (Up to 3 buttons)
 * @param {string} to - Recipient phone number
 * @param {string} bodyText - Main message body
 * @param {Array<{id: string, title: string}>} buttons - Array of button objects (max 3, title max 20 chars)
 */
async function sendInteractiveButtons(to, bodyText, buttons) {
  const formattedButtons = buttons.slice(0, 3).map((b) => ({
    type: 'reply',
    reply: {
      id: b.id,
      title: b.title.slice(0, 20) // WhatsApp limit
    }
  }));

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: {
        text: bodyText
      },
      action: {
        buttons: formattedButtons
      }
    }
  };

  return callWhatsAppApi(payload);
}

/**
 * Mark an incoming message as read
 */
async function markMessageAsRead(messageId) {
  if (!config.meta.accessToken || !config.meta.phoneNumberId || !messageId) {
    return;
  }

  const url = `https://graph.facebook.com/${config.meta.apiVersion}/${config.meta.phoneNumberId}/messages`;
  try {
    await axios.post(url, {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId
    }, {
      headers: {
        'Authorization': `Bearer ${config.meta.accessToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 5000
    });
  } catch (err) {
    // Non-critical, ignore error
  }
}

/**
 * Download media from Meta WhatsApp Cloud API by media ID
 * @param {string} mediaId - Meta media ID
 * @returns {Promise<{ buffer: Buffer, mimeType: string }>}
 */
async function downloadMedia(mediaId) {
  if (!config.meta.accessToken || !mediaId) {
    throw new Error('Missing accessToken or mediaId');
  }

  // 1. Get media URL
  const metaUrl = `https://graph.facebook.com/${config.meta.apiVersion}/${mediaId}`;
  const resMeta = await axios.get(metaUrl, {
    headers: { Authorization: `Bearer ${config.meta.accessToken}` }
  });

  const downloadUrl = resMeta.data.url;
  const mimeType = resMeta.data.mime_type || 'application/octet-stream';

  // 2. Download binary buffer using Bearer token
  const resBinary = await axios.get(downloadUrl, {
    headers: {
      Authorization: `Bearer ${config.meta.accessToken}`,
      'User-Agent': 'BookAChelaBot/1.0'
    },
    responseType: 'arraybuffer'
  });

  return {
    buffer: Buffer.from(resBinary.data),
    mimeType
  };
}

module.exports = {
  sendTextMessage,
  sendInteractiveButtons,
  markMessageAsRead,
  downloadMedia
};

