const { initDB } = require('./database');
const { initConfig } = require('./app');
const { initRoutes } = require('./routes');

exports.initApp = async (app) => {
  initDB().then();
  initConfig(app);
  initRoutes(app);
};
