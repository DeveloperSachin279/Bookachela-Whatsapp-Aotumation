const express = require('express');
const config = require('./config');
const { handleIncomingMessage } = require('./bot');

const app = express();
app.use(express.json());

// Basic Health Check Endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'BookAChela WhatsApp Automation Webhook Server',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

/**
 * GET /webhook - Meta Webhook Verification
 * Meta sends a GET request when you configure the Callback URL in Developer Portal.
 */
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === config.meta.verifyToken) {
      console.log('[Webhook Verification] Verified successfully with Meta!');
      return res.status(200).send(challenge);
    } else {
      console.warn('[Webhook Verification Failed] Tokens do not match.');
      return res.sendStatus(403);
    }
  }

  res.sendStatus(400);
});

/**
 * POST /webhook - Inbound WhatsApp Events
 * Handles messages, button clicks, status updates.
 */
app.post('/webhook', (req, res) => {
  const body = req.body;

  // 1. Immediately acknowledge Meta with 200 OK (< 50ms) to ensure high concurrency & no retries
  res.status(200).send('EVENT_RECEIVED');

  // 2. Validate object type
  if (body.object !== 'whatsapp_business_account') {
    return;
  }

  // 3. Process entries asynchronously
  if (body.entry && Array.isArray(body.entry)) {
    for (const entry of body.entry) {
      const changes = entry.changes;
      if (!changes || !Array.isArray(changes)) continue;

      for (const change of changes) {
        const value = change.value;
        if (!value) continue;

        // Ignore status receipts (sent, delivered, read) to avoid duplicate bot runs
        if (value.statuses && !value.messages) {
          continue;
        }

        // Process incoming user messages
        if (value.messages && Array.isArray(value.messages)) {
          for (const message of value.messages) {
            handleIncomingMessage(message).catch(err => {
              console.error('[Bot Error]:', err.message);
            });
          }
        }
      }
    }
  }
});

// Start Express Server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 BookAChela WhatsApp Automation is running!`);
  console.log(`📡 Local Port: http://localhost:${PORT}`);
  console.log(`🔗 Webhook Path: http://localhost:${PORT}/webhook`);
  console.log(`🔑 Verify Token: ${config.meta.verifyToken}`);
  console.log(`====================================================`);
});

