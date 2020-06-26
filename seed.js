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
const { initConfig } = require('./config/app');
const userSeed = require('./services/userSeed');

initDB().then(() => {
  userSeed();
});

module.exports = app;
