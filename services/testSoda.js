const oracleDb = require('oracledb');

const dbPool = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECTIONS,
  poolMin: 10,
  poolMax: 10,
  poolIncrement: 0
};

exports.initialize = async () => {
  await oracleDb.createPool(dbPool);
};

exports.test = async (statement, binds = [], opts = {}) =>
  new Promise(async (resolve, reject) => {
    let conn;
    opts.autoCommit = true;
    opts.outFormat = oracleDb.OBJECT;

    try {
      conn = await oracleDb.getConnection();
      const soda = conn.getSodaDatabase();

    } catch (err) {
      reject(err);
    } finally {
      if (conn) {
        try {
          await conn.close();
        } catch (err) {
          console.error(err);
        }
      }
    }
  });

exports.close = async () => {
  await oracleDb.getPool().close();
};
