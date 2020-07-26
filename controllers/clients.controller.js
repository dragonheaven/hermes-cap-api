const Client = require('../db_apis/client');
const { serverError } = require('../helper/serverError');

const validateEmail = email => /^(([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+)?$/.test(email);

exports.getFetchClients = async (req, res) => {
  try {
    const clients = await Client.find(req.query);
    res.status(200).json({
      total: await Client.count(req.query),
      clients
    });
  } catch (err) {
    return serverError(res);
  }
};

exports.getFetchSpecialClient = async (req, res) => {
  try {
    const client = await Client.findOne(req.query.clientId);

    return res.status(200).json({
      currentClient: client
    });
  } catch (err) {
    return serverError(res);
  }
};

exports.create = async (req, res) => {
  try {
    if (!req.body.email || !req.body.firstName) return res.status(400).json({ error: { msg: 'Invalid arguments.' } });
    if (!validateEmail(req.body.email)) return res.status(400).json({ error: { msg: 'Invalid email.' } });

    const { rowsPerPage, ...data } = req.body;
    await Client.create(data);

    const clients = await Client.find();
    res.status(200).json({
      total: clients.length,
      clients
    });
  } catch (err) {
    return serverError(res);
  }
};

exports.update = async (req, res) => {
  try {
    if (!req.body.email || !req.body.firstName) return res.status(400).json({ error: { msg: 'Invalid arguments.' } });
    if (!validateEmail(req.body.email)) return res.status(400).json({ error: { msg: 'Invalid email.' } });

    const { rowsPerPage, country, ...data } = req.body;
    const client = await Client.update(data);
    if (!client) return res.status(400).json({ error: { msg: 'Invalid arguments' } });

    const clients = await Client.find();
    res.status(200).json({
      total: clients.length,
      clients
    });
  } catch (err) {
    return serverError(res);
  }
};

exports.delete = async (req, res) => {
  try {
    const result = await Client.del(req.body);
    if (!result) return res.status(400).json({ error: { msg: 'Invalid arguments' } });

    const clients = await Client.find();
    res.status(200).json({
      total: clients.length,
      clients
    });
  } catch (err) {
    console.error(err);
  }
};
