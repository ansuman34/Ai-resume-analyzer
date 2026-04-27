require('dotenv').config();
const { askAi } = require('./services/openRouter.service');

(async () => {
  try {
    const res = await askAi([{ role: 'user', content: 'Say hello' }]);
    console.log('Success:', res);
  } catch (error) {
    console.error('Failed:', error.message);
  }
})();
