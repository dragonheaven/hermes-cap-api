const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  env: process.env.NODE_ENV,
  frontendUrl: process.env.FRONTEND_URL,

  cryptoCompareApiUrl: process.env.CRYPTO_COMPARE_URL,
  cryptoCompareApiKey: process.env.CRYPTO_COMPARE_KEY,

  sendgridApiUrl: process.env.SENDGRID_API_URL,
  sendgridApiKey: process.env.SENDGRID_API_KEY,
};
