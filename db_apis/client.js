const oracleDb = require('oracledb');
const database = require('../services/database');

const baseQuery = `
  select CLIENT_ID "id",
    FIST_NAME "firstName",
    LAST_NAME "lastName",
    MID_NAME "midName",
    NAME_PRIFIX "namePrifix",
    EMAIL "email",
    PHONE "phone",
    COUNTRY_3CD "country3cd",
    COUNTRY_2CD "country2cd",
    CURRENT_BALANCE "currentBalance",
    CREATE_TS "createAt",
    LAST_UPDATE_TS "updateAt"
  from HERMES_ACC_CLIENT
  `;

const countQuery = `
  select COUNT(*) "count"
  from HERMES_ACC_CLIENT
`;

const createQuery = `
  insert into HERMES_ACC_CLIENT (
  CLIENT_ID,
  FIST_NAME,
  LAST_NAME,
  MID_NAME,
  NAME_PRIFIX,
  EMAIL,
  PHONE,
  COUNTRY_3CD,
  COUNTRY_2CD,
  CURRENT_BALANCE,
  CREATE_TS,
  LAST_UPDATE_TS
  ) values (
    :id,
    :firstName,
    :lastName,
    :midName,
    :namePrifix,
    :email,
    :phone,
    :country3cd,
    :country2cd,
    :currentBalance,
    :createAt,
    :updateAt
  )
`;

const updateQuery = `
  update HERMES_ACC_CLIENT
  set FIST_NAME = :firstName,
    LAST_NAME = :lastName,
    MID_NAME = :midName,
    NAME_PRIFIX = :namePrifix,
    EMAIL = :email,
    PHONE = :phone,
    COUNTRY_3CD = :country3cd,
    COUNTRY_2CD = :country2cd,
    CURRENT_BALANCE = :currentBalance,
    CREATE_TS = :createAt,
    LAST_UPDATE_TS = :updateAt
  where CLIENT_ID = :id
`;

const deleteQuery = `
  begin
    delete from HERMES_ACC_CLIENT
    where CLIENT_ID = :id;
    :rowcount := sql%rowcount;
  end;
`;

const initClient = (data) => {
  const client = Object.assign({
    firstName: '',
    lastName: '',
    midName: '',
    namePrifix: '',
    email: '',
    phone: '',
    country3cd: '',
    country2cd: '',
    currentBalance: 0,
    createAt: new Date(),
    updateAt: new Date()
  });

  Object.keys(client).forEach((key) => {
    if (data[key]) client[key] = data[key];
  });
  return client;
};

const find = async (context) => {
  let query = baseQuery;
  const binds = {};

  if (context && context.id) {
    binds.clientId = context.id;
    query += '\nwhere CLIENT_ID = :clientId';
  }
  try {
    const result = await database.execute(query, binds);
    return result.rows;
  } catch (err) {
    console.error(err);
  }
};

const findOne = async (context) => {
  let query = baseQuery;
  let flag = false;
  const binds = {};

  if (context && context.id) {
    binds.id = context.id;
    query += '\nwhere CLIENT_ID = :id';
    flag = true;
  }

  if (context && context.email) {
    binds.email = context.email;
    if (flag) query += 'AND EMAIL = :email';
    else query += '\nwhere EMAIL = :email';
  }

  try {
    const result = await database.execute(query, binds);
    return result.rows[0];
  } catch (err) {
    console.error(err);
  }
};

const create = async (data) => {
  const client = initClient(data);
  client.id = Math.round(Math.random() * 10000);

  try {
    await database.execute(createQuery, client);
  } catch (err) {
    console.error(err);
  }
};

const update = async (data) => {
  const client = initClient(data);
  client.id = data.id;
  try {
    const result = await database.execute(updateQuery, client);

    if (result.rowsAffected && result.rowsAffected === 1) return client;
    return null;
  } catch (err) {
    console.error(err);
  }
};

const del = async (context) => {
  const binds = {
    id: context.id,
    rowcount: {
      dir: oracleDb.BIND_OUT,
      type: oracleDb.NUMBER
    }
  };

  try {
    const result = await database.execute(deleteQuery, binds);
    return result.outBinds.rowcount === 1;
  } catch (err) {
    console.error(err);
  }
};

const count = async () => {
  try {
    const result = await database.execute(countQuery);
    return result.rows[0].count;
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  count, find, findOne, create, update, del
};
