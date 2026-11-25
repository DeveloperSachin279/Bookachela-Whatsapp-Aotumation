const axios = require('axios');
require('dotenv').config();

const token = process.env.META_ACCESS_TOKEN;
const appId = '1692297832399666';
const newUrl = 'https://blocking-perl-polyester-alabama.trycloudflare.com/webhook';
const verifyToken = process.env.META_VERIFY_TOKEN;

async function updateWebhook() {
  console.log('--- Testing updating app subscriptions via Graph API ---');
  try {
    const res = await axios.post(`https://graph.facebook.com/v21.0/${appId}/subscriptions`, {
      object: 'whatsapp_business_account',
      callback_url: newUrl,
      fields: ['messages'],
      verify_token: verifyToken
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Update result:', res.data);
  } catch (e) {
    console.error('Error updating app subscriptions:', e.response ? e.response.data : e.message);
  }
}

updateWebhook();

