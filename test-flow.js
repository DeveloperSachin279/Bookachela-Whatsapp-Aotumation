/**
 * Interactive Terminal Chat Simulator for BookAChela Bot
 * Run with: npm run test-flow
 */
const readline = require('readline');
const { handleIncomingMessage } = require('./src/bot');
const whatsapp = require('./src/whatsapp');

console.clear();
console.log('===========================================================');
console.log('🤖 BookAChela WhatsApp Bot - Local Interactive Simulator');
console.log('Simulating User Phone: +91 99999 88888');
console.log('Type your message below and press Enter (type "exit" to quit)');
console.log('===========================================================\n');

// Mock WhatsApp sender to print nicely in terminal instead of calling Meta API
whatsapp.sendTextMessage = async (to, text) => {
  console.log(`\n🤖 [BookAChela Bot to ${to}]:\n${text}\n`);
  return { success: true };
};

whatsapp.sendInteractiveButtons = async (to, bodyText, buttons) => {
  console.log(`\n🤖 [BookAChela Bot (Buttons) to ${to}]:\n${bodyText}`);
  console.log('👉 Buttons:');
  buttons.forEach((btn, idx) => {
    console.log(`   [Button ${idx + 1}]: "${btn.title}" (ID: ${btn.id})`);
  });
  console.log('');
  return { success: true };
};

whatsapp.markMessageAsRead = async () => {};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: '👤 You: '
});

// Trigger initial greeting simulation
(async () => {
  await handleIncomingMessage({
    from: '919999988888',
    id: 'test_msg_001',
    type: 'text',
    text: { body: 'Hi' }
  });
  rl.prompt();
})();

rl.on('line', async (line) => {
  const input = line.trim();
  if (input.toLowerCase() === 'exit') {
    console.log('\nExiting simulator. Have a great day!\n');
    process.exit(0);
  }

  await handleIncomingMessage({
    from: '919999988888',
    id: `test_msg_${Date.now()}`,
    type: 'text',
    text: { body: input }
  });

  rl.prompt();
});

