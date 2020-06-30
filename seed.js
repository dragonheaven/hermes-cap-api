const express = require('express');
const dotenv = require('dotenv');

/**
 * Load environment variables from .env file, where API keys and passwords are configured.
 */
dotenv.load({ path: '.env' });


/**
 * Create Express server.
 */
const app = express();

const { initDB } = require('./config/database');
const userSeed = require('./services/userSeed');
const clientSeed = require('./services/clientSeed');

initDB().then(() => {
  clientSeed();
  // userSeed();
});

module.exports = app;
