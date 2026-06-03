try {
  console.log('Checking order.controller.js...');
  const orderController = require('../src/controllers/order.controller');
  console.log('✅ order.controller.js loaded successfully.');

  console.log('Checking chat.repository.js...');
  const chatRepository = require('../src/repositories/chat/chat.repository');
  console.log('✅ chat.repository.js loaded successfully.');

  console.log('Checking file.utils.js...');
  const fileUtils = require('../src/utils/file.utils');
  console.log('✅ file.utils.js loaded successfully.');

  console.log('All files verified successfully!');
} catch (error) {
  console.error('❌ Verification failed:', error);
  process.exit(1);
}
