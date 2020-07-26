const database = require('../services/database');

const baseQuery = `
  select TRANSACTION_ID "transactionId",
    TRANSACTION_DATE "transactionDate",
    SOURCE_CD "source",
    EXCHANGE "exchange",
    FX_INSTRUMENT "fxInstrument",
    DIRECTION "direction",
    ASSET_PRICE "assetPrice",
    ASSET_AMOUNT "assetAmount",
    COMMISSION "commission",
    USD_EQU_AMOUNT "usdEquAmount",
    USD_EQU_COMMISSION "usdEquCommission",
    BTC_EQU_AMOUNT "btcEquAmount",
    BTC_EQU_COMMISSION "btcEquCommission"
  from HERMES_TRANSACTIONS_VW
  `;

const countQuery = `
  select COUNT(*) "count"
  from HERMES_TRANSACTIONS_VW
`;

exports.fetchTrades = async (context) => {
  let query = baseQuery;
  const binds = {};

  if (context && context.source) {
    query = `${query} where SOURCE_CD = :source`;
    binds.source = context.source;
  }

  try {
    const result = await database.execute(query, binds);
    return result.rows;
  } catch (err) {
    console.error('Trade::fetchTrades', err);
  }
};

exports.count = async (context) => {
  try {
    let query = countQuery;
    const binds = {};

    if (context && context.source) {
      query = `${query} where SOURCE_CD = :source`;
      binds.source = context.source;
    }

    const total = await database.execute(query, binds);
    return total.rows[0].count;
  } catch (err) {
    console.error('Trade::count', err);
  }
};

exports.fetchPnlSum = async (context) => {
  const query = 'select SOURCE_CD "source", PNL_USD_AMOUNT "pnlUsdAmount" from HERMES_SRC_FULL_PNL_VW where SOURCE_CD = :source';
  const binds = { source: context.source };
  try {
    const result = await database.execute(query, binds);
    let sum = 0;
    for (let i = 0; i < result.rows.length; i++) {
      sum += result.rows[i].pnlUsdAmount;
    }
    return sum;
  } catch (err) {
    console.error('Trade::fetchPnlSum', err);
  }
};

exports.getTotalData = async () => {
  const query = 'select AUM "aum", PNL "pnl", TOTAL_24H_TRADE "trade24h", TOTAL_VOLUME "totalVolume" from TOTAL_SCREEN_VW';
  try {
    const result = await database.execute(query);
    return result.rows[0];
  } catch (err) {
    console.error('Trade::getTotalData', err);
  }
};

exports.pnlChartData = async (context) => {
  try {
    const yearData = await database.execute('select * from HERMES_SRC_YEAR_PNL_VW where source_cd = :source order by idx asc',
      { source: context.source });

    const monthData = await database.execute('select * from HERMES_SRC_MONTH_FULL_PNL_VW where source_cd = :source order by pnl_date asc',
      { source: context.source });
    const weekData = await database.execute('select * from HERMES_SRC_WEEK_FULL_PNL_VW where source_cd = :source order by pnl_date asc',
      { source: context.source });
    const dayData = await database.execute('select * from HERMES_SRC_24H_FULL_PNL_VW where source_cd = :source order by pnl_date asc',
      { source: context.source });
    return {
      year: yearData, month: monthData, week: weekData, day: dayData
    };
  } catch (err) {
    console.error('Trade::pnlChartData', err);
  }
};

exports.getTotalBySource = async (context) => {
  try {
    const result = await database.execute('select AUM "aum", PNL "pnl" from TOTAL_SCREEN_BY_SOURCE_VW where source_cd = :source', { source: context.source });
    return result.rows[0] ? result.rows[0] : { aum: 0, pnl: 0 };
  } catch (err) {
    console.error('Trade::getTotalBySource', err);
  }
};
