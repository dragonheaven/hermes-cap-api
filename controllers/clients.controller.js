const Client = require('../db_apis/client');
const { serverError } = require('../helper/serverError');
const countries = require('../data/countries');

exports.getFetchClients = async (req, res) => {
  try {
    const clients = await Client.find();
    res.status(200).json({
      total: clients.length,
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
  } catch (error) {
    return serverError(res);
  }
};

exports.create = async (req, res) => {
  try {
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
