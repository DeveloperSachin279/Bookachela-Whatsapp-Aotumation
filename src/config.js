require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  meta: {
    verifyToken: process.env.META_VERIFY_TOKEN || 'bookachela_secure_verify_token_2026',
    accessToken: process.env.META_ACCESS_TOKEN || '',
    phoneNumberId: process.env.META_PHONE_NUMBER_ID || '',
    apiVersion: process.env.META_GRAPH_API_VERSION || 'v21.0',
  },
  google: {
    spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID || '',
    serviceAccountKeyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE || './service-account.json',
  },
  admin: {
    notificationPhone: process.env.ADMIN_NOTIFICATION_PHONE || '917477013131',
  },
  support: {
    phoneNumber: process.env.SUPPORT_PHONE_NUMBER || '+91-XXXXXXXXXX',
    email: process.env.SUPPORT_EMAIL || 'support@bookachela.com',
  }
};

