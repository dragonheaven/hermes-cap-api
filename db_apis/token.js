const oracleDb = require('oracledb');
const database = require('../services/database');

const baseQuery = `
  select USER_ID "userId",
    TOKEN "token"
  from HERMES_TOKEN
`;

const createQuery = `
  insert into HERMES_TOKEN (
  USER_ID,
  TOKEN
  ) values (
    :userId,
    :token
  ) returning USER_ID
  into :userId
`;

const delQuery = `
  begin
    delete from HERMES_USER
    where USER_ID = :userId;
    :rowcount := sql%rowcount;
  end;
`;

const initToken = (data) => {
  const token = Object.assign({
    userId: '',
    token: ''
  });

  Object.keys(token).forEach((key) => {
    if (data[key]) token[key] = data[key];
  });
  return token;
};

const create = async (data) => {
  if (!data.userId || !data.token) return;

  const token = Object.assign(initToken(data));

  try {
    await database.execute(createQuery, token);
    return token;
  } catch (err) {
    console.error(err);
  }
};

const findOne = async (context) => {
  let query = baseQuery;
  const binds = {};

  if (context && context.token) {
    binds.token = context.token;
    query += '\nwhere TOKEN = :token';
  }

  try {
    const result = await database.execute(query, binds);
    return result.rows[0];
  } catch (err) {
    console.error(err);
  }
};

const del = async (context) => {
  if (!context.userId) return;

  const binds = {
    userId: context.userId,
    rowcount: {
      dir: oracleDb.BIND_OUT,
      type: oracleDb.NUMBER
    }
  };
  try {
    const result = await database.execute(delQuery, binds);
    return result.outBinds.rowcount === 1;
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  findOne, create, del
};
