const database = require('../services/database');

const baseQuery = `
  select SOURCE_CD "source",
    BALANCE_ID "balanceId",
    BALANCE_DT "balanceDt",
    CLD_REC_ID "cldRecId",
    INSTRUMENT "instrument",
    EXCHANGE "exchange",
    BALANCE "balance",
    USD_RATE "usdRate",
    BTC_RATE "btcRate",
    TRANSACTION_FLAG "transactionFlag",
    LOAD_TS "loadTs"
  from HERMES_STG_BALANCE
`;

const countQuery = `
  select COUNT(*) "count"
  from HERMES_STG_BALANCE
`;

exports.fetchPositions = async (context) => {
  try {
    let query = baseQuery;
    const binds = {};
    if (context && context.source) {
      query = `${query} where SOURCE_CD = :source`;
      binds.source = context.source;
    }

    if (context && context.page !== undefined && context.rowsPerPage) {
      query = `${query} OFFSET :offset ROWS FETCH NEXT :maxRows ROWS ONLY`;
      binds.offset = parseInt(context.page, 10) * parseInt(context.rowsPerPage, 10);
      binds.maxRows = parseInt(context.rowsPerPage, 10);
    }

    const result = await database.execute(query, binds);
    return result.rows;
  } catch (err) {
    console.error(err);
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

    const result = await database.execute(query, binds);
    return result.rows[0].count;
  } catch (err) {
    console.error(err);
  }
};

exports.aumChartData = async (context) => {
  try {
    const dayData = await database.execute('select * from HERMES_24H_SRC_EOH_BALANCE_VW where strategy = :source', { source: context.source });
    let day = 0;
    for (let i = 0; i < dayData.rows.length; i++) {
      day += dayData.rows[i].USD_EQV;
    }

    const weekData = await database.execute('select * from HERMES_WEEK_SRC_EOH_BALANCE_VW where strategy = :source', { source: context.source });
    let week = 0;
    for (let i = 0; i < weekData.rows.length; i++) {
      week += weekData.rows[i].USD_EQV;
    }

    const monthData = await database.execute('select * from HERMES_MON_SRC_EOH_BALANCE_VW where strategy = :source', { source: context.source });
    let month = 0;
    for (let i = 0; i < monthData.rows.length; i++) {
      month += monthData.rows[i].USD_EQV;
    }

    const yearData = await database.execute('select * from HERMES_YEAR_SRC_EOM_BALANCE_VW where strategy = :source', { source: context.source });
    let year = 0;
    for (let i = 0; i < yearData.rows.length; i++) {
      year += yearData.rows[i].USD_EQV;
    }
    return {
      day, week, month, year
    };
  } catch (err) {
    console.error(err);
  }
};

exports.getCurrentPositions = async () => {
  try {
    const query = 'select INSTRUMENT "instrument", LAST_USD_RATE "lastUSDRate", LAST_BTC_RATE "lastBTCRate", BALANCE "balance", USD_EQV "usdEqv", BTC_EQV "btcEqv" from HERMES_CURRENT_BALANCE_VW';
    const result = await database.execute(query);
    return result.rows;
  } catch (err) {
    console.error(err);
  }
};