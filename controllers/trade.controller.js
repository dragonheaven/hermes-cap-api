const moment = require('moment');
const Trade = require('../db_apis/trade');
const { serverError } = require('../helper/serverError');

exports.getFetchTrades = async (req, res) => {
  try {
    const trades = await Trade.fetchTrades(req.body);
    const data = req.body.time
      ? trades.filter((item) => {
        const start = moment().add(-24, 'hours').toDate();
        const end = moment().toDate();
        return item.transactionDate >= start && item.transactionDate < end;
      }) : trades;

    res.status(200).json({
      total: data.length,
      valid: data.length,
      trades: data
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
