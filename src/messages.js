const config = require('./config');

module.exports = {
  // Main Greeting & Menu
  MAIN_MENU: `Namaste! Welcome to CHELA. 👋

*CHELA – Your Extra Pair of Hands.*

Need an extra pair of hands for everyday tasks in Bhopal? You can explore services, check prices, and get assistance right here on WhatsApp.

How can we help you today?

1️⃣ *Book a CHELA* (Customer)
2️⃣ *Work with CHELA* (Worker Registration)
3️⃣ *Services & FAQs*

Reply with 1, 2, or 3. You can also type your question directly.`,

  INVALID_INPUT: `Sorry, I couldn't understand your selection.

Please choose one of the following:

1️⃣ Book a CHELA
2️⃣ Work with CHELA
3️⃣ Services & FAQs

You can also type *MENU* to return to the main menu.`,

  // ============================================================================
  // CUSTOMER MESSAGES — ENGLISH
  // ============================================================================
  CUSTOMER_ASK_NAME: `Certainly! Let's get your booking started.

May I have your *full name*, please?`,

  CUSTOMER_ASK_SERVICE: (name) => `Thank you, *${name}*.

What would you like help with?

For example:
- Home and room organisation
- Gardening assistance
- Carrying and lifting assistance
- Party and event assistance
- Shopping and daily errands
- Pickup and drop assistance
- Restaurant pickup and delivery
- Driving assistance
- Friendly, non-medical companionship

Please describe what you need. We will help you select the relevant service and available task from the CHELA catalogue.`,

  CUSTOMER_ASK_LOCATION: `Which area in *Bhopal* do you need the service in?

Please share your locality, complete address, or a nearby landmark. You can also share your WhatsApp live location.`,

  CUSTOMER_ASK_TIME: `When would you like the CHELA service?

CHELA's operating hours are *9:00 AM to 9:00 PM*.

Please share your preferred date and time. We will check availability before confirming the booking.`,

  CUSTOMER_ASK_DURATION: `For how many hours would you like to book a CHELA?

The minimum booking duration is *1 hour*.

Please share your preferred duration (e.g. 1 hour, 2 hours, 4 hours). The applicable price will be shown before payment.`,

  CUSTOMER_CLOSING: (name, data) => `Thank you, *${name}*!

We've received your service request:

Service: ${data.service || 'N/A'}
Location: ${data.location || 'N/A'}
Preferred date/time: ${data.urgency || 'N/A'}
Duration: ${data.duration || 'N/A'}

*Please note:* This is a booking request, not a confirmed booking. The final price and availability will be shared before payment. A booking is confirmed only after successful online payment.

Our team will follow up on this WhatsApp number if assistance is needed.

Thank you for choosing CHELA.
🌐 https://www.bookachela.com`,

  // ============================================================================
  // WORKER MESSAGES — HINGLISH
  // ============================================================================
  CHELA_ASK_NAME_AGE: `Namaste! CHELA ke saath judne mein interest dikhane ke liye dhanyavaad. 🤝

Sabse pehle apna *poora naam aur age* batayein.

Example: Rahul Kumar, 24

CHELA registration ke liye minimum age 18 years hai.`,

  CHELA_ASK_SKILLS: `Bahut badhiya! 👍

Aap kis tarah ke kaam kar sakte hain? Apne experience ke baare mein bhi batayein.

Example:
- Gardening assistance
- Carrying aur lifting assistance
- Shopping aur daily errands
- Home / room organisation
- Party aur event assistance
- Pickup aur drop assistance
- Driving assistance (valid driving licence zaroori hai)
- Friendly companionship

Jo kaam aap confidently kar sakte hain, wahi select karein.`,

  CHELA_ASK_LOCATION: `Aap Bhopal ke kis *area ya locality* mein kaam karne ke liye available hain?

Example: Kolar, Shahpura, Trilanga, Chunabhatti ya Gulmohar.

Apna area aur PIN code bhi bata sakte hain. Jobs aapke selected area aur customer bookings ke basis par offer hongi.`,

  CHELA_ASK_WORK_TYPE: `Aap CHELA ke saath kis tarah kaam karna chahenge?

1️⃣ Full-time availability
2️⃣ Part-time availability
3️⃣ Sirf weekends
4️⃣ Flexible timing

Bas 1, 2, 3 ya 4 reply karein.

Apni availability honestly select karein. Jobs actual customer bookings par depend karti hain; fixed work guaranteed nahi hai.`,

  CHELA_CLOSING: (name, data) => `Shukriya *${name}* ji! 🚀

Aapka CHELA application successfully receive ho gaya hai.

📋 *Skills / Work:* ${data.skills || 'N/A'}
📍 *Area:* ${data.location || 'N/A'}
⏱️ *Availability:* ${data.workType || 'N/A'}

Apna official worker registration complete karne aur aage apply karne ke liye hamari website visit karein:
🌐 https://www.bookachela.com

Next steps ke liye hamari onboarding team aapko isi number par update degi.

Dhyaan rahe: Paid jobs KYC approval aur profile activation ke baad hi milengi. Jobs actual customer demand aur availability par depend karti hain.`,

  // ============================================================================
  // ADMIN NOTIFICATIONS — ENGLISH
  // ============================================================================
  ADMIN_CUSTOMER_ALERT: (data) => `NEW CUSTOMER BOOKING REQUEST
━━━━━━━━━━━━━━━━━━━━
Customer: ${data.name || 'N/A'}
WhatsApp: +${data.phone || 'N/A'}
Service: ${data.service || 'N/A'}
Location: ${data.location || 'N/A'}
Preferred time: ${data.urgency || 'N/A'}
Duration: ${data.duration || 'N/A'}
Received (IST): ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
━━━━━━━━━━━━━━━━━━━━
Please review the booking in the admin panel / Google Sheet.`,

  ADMIN_CHELA_ALERT: (data) => `NEW CHELA WORKER REGISTRATION
━━━━━━━━━━━━━━━━━━━━
Applicant: ${data.nameAge || 'N/A'}
WhatsApp: +${data.phone || 'N/A'}
Skills / Work types: ${data.skills || 'N/A'}
Area: ${data.location || 'N/A'}
Availability: ${data.workType || 'N/A'}
Received (IST): ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
━━━━━━━━━━━━━━━━━━━━
Please review the application in the admin panel / Google Sheet.`,

  // ============================================================================
  // CUSTOMER FAQ — ENGLISH
  // ============================================================================
  FAQ_MENU: `What would you like to know about CHELA?

A️⃣ What is CHELA and how does it work?
B️⃣ Services and pricing
C️⃣ Trust and safety
D️⃣ Earnings for CHELA workers
E️⃣ Booking, cancellation and refunds
F️⃣ Speak to our support team
0️⃣ Return to Main Menu

Reply with A, B, C, D, E, F or 0.`,

  FAQ_A: `CHELA is a local, on-demand human-assistance service in Bhopal.

We connect customers with identity-verified local helpers for everyday, non-specialist tasks listed on the booking page.

You can book through our website or directly through WhatsApp.

Website: https://www.bookachela.com

👉 Reply *1* to Book a CHELA, or *0* for Main Menu.`,

  FAQ_B: `Each CHELA service has its own hourly rate, displayed before payment.

The first selected task is included in the hourly rate. Each additional task currently adds ₹30, up to a maximum of ₹90.

Applicable travel charges are calculated separately for relevant services and shown before payment.

The final price shown at checkout applies to your booking.

👉 Reply *1* to Book a CHELA, or *0* for Main Menu.`,

  FAQ_C: `Every CHELA is identity-verified before their first job.

Full background verification is launching soon and is not represented as completed until it is operational.

CHELAs perform only the booked tasks and may refuse unsafe, illegal or out-of-scope work.

For an emergency, call 112.

👉 Reply *1* to Book a CHELA, or *0* for Main Menu.`,

  FAQ_D: `CHELA workers receive *₹80 per approved paid hour*. Earnings are added after the customer confirms the work and the paid hours are approved.

Job offers depend on customer bookings, the worker's selected area, approved work types and availability. Jobs and fixed income are not guaranteed.

To apply as a worker, select option *2* from the main menu or visit https://www.bookachela.com

👉 Reply *2* to Work with CHELA, or *0* for Main Menu.`,

  FAQ_E: `CHELA's cancellation policy:

- Free cancellation up to 3 hours before the booking start.
- Later cancellations, or no access to the location when the CHELA arrives, may not be refunded.
- If CHELA cannot assign a helper, a full refund is issued to the original payment method.
- Approved refunds usually reach the original payment method within 5–7 working days.

Full Terms: https://www.bookachela.com/terms

👉 Reply *1* to Book a CHELA, or *0* for Main Menu.`,

  FAQ_F: `Our support team is available from 9:00 AM to 9:00 PM, Monday to Sunday.

Phone / WhatsApp: ${config.support.phoneNumber}
Email: info@bookachela.com

Please share your booking ID or enquiry details so we can assist you.

👉 Reply *0* for Main Menu.`
};
