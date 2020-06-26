const database = require('../services/database');

exports.initDB = async () => {
  try {
    await database.initialize();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
