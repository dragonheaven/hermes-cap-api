const Trade = require('../db_apis/trade');
const { serverError } = require('../helper/serverError');

exports.getFetchTrades = async (req, res) => {
  try {
    const trades = await Trade.fetchTrades(req.body);

    res.status(200).json({
      total: await Trade.count(req.body),
      valid: trades.length,
      trades
    });
  } catch (err) {
    return serverError(res);
  }
};

exports.fetchSpecialTrades = async (req, res) => {
  try {
    const trades = await Trade.fetchTrades(req.body);

    res.status(200).json({
      total: await Trade.count(req.body),
      valid: trades.length,
      trades
    });
  } catch (err) {
    return serverError(res);
  }
};

exports.fetchPnlSum = async (req, res) => {
  try {
    const pnlSum = await Trade.fetchPnlSum(req.body);
    res.status(200).json({
      source: req.body.source,
      pnlSum
    });
  } catch (err) {
    return serverError(res);
  }
};
