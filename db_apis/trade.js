const moment = require('moment');
const database = require('../services/database');

const baseQuery = `
  select LOGID "logId",
    SOURCE_CD "sourceCd",
    CLD_REC_ID "cldRecId",
    LOGTS_FULL_IDX "logTsFullIdx",
    LOGTS_FULL "logTsFull",
    LOGTS "logTs",
    LOGOPERATION "logOperation",
    LOGCD "logCd",
    EXCHANGE "exchange",
    FX_INSTRUMENT "fxInstrument",
    MARKETOPERATION "marketOperation",
    PRICE "price",
    AMOUNT "amount",
    COMMISSION "commission",
    TRANSACTION_FLAG "transactionFlag",
    LOAD_TS "loadTs",
    CR_INSTRUMENT "crInstrument",
    DB_INSTRUMENT "dbInstrument"
  from LOG_HERMES_LDR_DATA
`;

const countQuery = `
  select COUNT(*) "count"
  from LOG_HERMES_LDR_DATA
`;

exports.fetchTrades = async (context) => {
  try {
    let query = baseQuery;
    const binds = {};

    if (context && context.source) {
      query = `${query} where SOURCE_CD = :source`;
      binds.source = context.source;
    }

    if (context && context.time) {
      binds.time = moment().add(-24, 'hours').toDate();
      if (context.source) query = `${query} AND LOGTS_FULL >= :time`;
      else query = `${query} WHERE LOGTS_FULL >= :time`;
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

    if (context && context.time) {
      binds.time = moment().add(-24, 'hours').toDate();
      if (context.source) query = `${query} AND LOGTS_FULL >= :time`;
      else query = `${query} WHERE LOGTS_FULL >= :time`;
    }
    const total = await database.execute(query, binds);
    return total.rows[0].count;
  } catch (err) {
    console.error(err);
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
    console.error(err);
  }
};

exports.getTotalData = async () => {
  const query = 'select AUM "aum", PNL "pnl", TOTAL_24H_TRADE "trade24h", TOTAL_VOLUME "totalVolume" from TOTAL_SCREEN_VW';
  try {
    const result = await database.execute(query);
    return result.rows[0];
  } catch (err) {
    console.error(err);
  }
};

exports.pnlChartData = async (context) => {
  try {
    const yearData = await database.execute('select * from HERMES_SRC_YEAR_PNL_VW where source_cd = :source', { source: context.source });
    const year = yearData.rows.length ? yearData.rows[0].PNL_R_TOTAL : 0;
    const monthData = await database.execute('select * from HERMES_SRC_MONTH_FULL_PNL_VW where source_cd = :source', { source: context.source });
    const month = monthData.rows.length ? monthData.rows[0].PNL_R_TOTAL : 0;
    const weekData = await database.execute('select * from HERMES_SRC_WEEK_FULL_PNL_VW where source_cd = :source', { source: context.source });
    const week = weekData.rows.length ? weekData.rows[0].PNL_R_TOTAL : 0;
    const dayData = await database.execute('select * from HERMES_SRC_24H_FULL_PNL_VW where source_cd = :source', { source: context.source });
    const day = dayData.rows.length ? dayData.rows[0].PNL_R_TOTAL : 0;
    return {
      year, month, week, day
    };
  } catch (err) {
    console.error(err);
  }
};

exports.getTotalBySource = async (context) => {
  try {
    const result = await database.execute('select AUM "aum", PNL "pnl" from TOTAL_SCREEN_BY_SOURCE_VW where source_cd = :source', { source: context.source });
    return result.rows[0] ? result.rows[0] : { aum: 0, pnl: 0 };
  } catch (err) {
    console.error(err);
  }
};
