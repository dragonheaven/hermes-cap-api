const oracleDb = require('oracledb');
const Random = require('meteor-random');
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');

const database = require('../services/database');

const baseQuery = `
  select USER_ID "id",
    EMAIL "email",
    PASSWORD "password",
    FIRST_NAME "firstName",
    LAST_NAME "lastName",
    PASSWORDRESETTOKEN "passwordResetToken",
    PASSWORDRESETEXPIRES "passwordResetExpires",
    ROLE "role",
    PHONE "phone"
  from HERMES_USER
`;

const createQuery = `
  insert into HERMES_USER (
  USER_ID,
  EMAIL,
  PASSWORD,
  FIRST_NAME,
  LAST_NAME,
  PHONE,
  ROLE,
  PASSWORDRESETTOKEN,
  PASSWORDRESETEXPIRES
  ) values (
    :id,
    :email,
    :password,
    :firstName,
    :lastName,
    :phone,
    :role,
    :passwordResetToken,
    :passwordResetExpires
  ) returning USER_ID
  into :id
`;

const updateQuery = `
  update HERMES_USER
  set FIRST_NAME = :firstName,
    LAST_NAME = :lastName,
    EMAIL = :email,
    PASSWORD = :password,
    PASSWORDRESETTOKEN = :passwordResetToken,
    PASSWORDRESETEXPIRES = :passwordResetExpires,
    ROLE = :role,
    PHONE = :phone
  where USER_ID = :id
`;

const deleteQuery = `
  delete from HERMES_USER
`;

const delQuery = `
  begin
    delete from HERMES_USER
    where USER_ID = :id;
    :rowcount := sql%rowcount;
  end;
`;

const initUser = (data) => {
  const client = Object.assign({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordResetToken: '',
    passwordResetExpires: '',
    role: '',
    phone: ''
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
    binds.userId = context.id;
    query += '\nwhere USER_ID = :userId';
  }

  try {
    const result = await database.execute(query, binds);
    return result.rows;
  } catch (err) {
    console.error('User::find', err);
  }
};

const findOne = async (context) => {
  let query = baseQuery;
  let flag = false;
  const binds = {};

  if (context && context.id) {
    binds.id = context.id;
    query += '\nwhere USER_ID = :id';
    flag = true;
  }

  if (context && context.email) {
    binds.email = context.email;
    if (flag) query += 'AND EMAIL = :email';
    else query += '\nwhere EMAIL = :email';
  }

  if (context && context.passwordResetToken) {
    if (flag) query += 'AND PASSWORDRESETTOKEN = :passwordResetToken';
    else query += '\nwhere PASSWORDRESETTOKEN = :passwordResetToken';
    binds.passwordResetToken = context.passwordResetToken;
  }

  try {
    const result = await database.execute(query, binds);
    return result.rows[0];
  } catch (err) {
    console.error('User::findOne', err);
  }
};

const create = async (data) => {
  const exist = await findOne({ email: data.email });
  if (exist) return false;
  const user = Object.assign(initUser(data));
  user.id = Random.secret(20);

  try {
    const salt = await bcrypt.genSaltSync(10);
    if (user.password !== '') user.password = bcrypt.hashSync(user.password, salt, null);

    await database.execute(createQuery, user);
    return user;
  } catch (err) {
    console.error('User::create', err);
  }
};

const update = async (data) => {
  if (!data || !data.id) return null;

  const user = await findOne({ id: data.id });

  try {
    const binds = Object.assign({ ...user, ...data });
    const result = await database.execute(updateQuery, binds);

    if (result.rowsAffected && result.rowsAffected === 1) return user;
    return null;
  } catch (err) {
    console.error('User::update', err);
  }
};

const deleteAll = async () => {
  try {
    await database.execute(deleteQuery);
  } catch (err) {
    console.error(err);
  }
};

const del = async (context) => {
  if (!context.id) return;

  const binds = {
    id: context.id,
    rowcount: {
      dir: oracleDb.BIND_OUT,
      type: oracleDb.NUMBER
    }
  };
  try {
    const result = await database.execute(delQuery, binds);
    return result.outBinds.rowcount === 1;
  } catch (err) {
    console.error('User::del', err);
  }
};

const comparePassword = async (user, candidatePassword) => {
  try {
    return await bcrypt.compareSync(candidatePassword, user.password);
  } catch (err) {
    console.error(err);
  }
};

const passwordToken = () => crypto.randomBytes(40).toString('hex');

module.exports = {
  findOne, comparePassword, create, update, deleteAll, find, passwordToken, del
};
