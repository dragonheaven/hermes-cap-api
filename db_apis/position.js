const database = require('../services/database');

const baseQuery = `
  select STRATEGY "strategy",
    BALANCE_DATE "balanceDate",
    INSTRUMENT "instrument",
    USD_RATE "usdRate",
    HOLDINGS "holdings",
    USD_EQV "usdEQV"
  from HERMES_WEEK_SRC_EOH_BALANCE_VW
`;

const countQuery = `
  select COUNT(*) "count"
  from HERMES_WEEK_SRC_EOH_BALANCE_VW
`;

exports.fetchPositions = async (context) => {
  try {
    let query = baseQuery;
    const binds = {};
    if (context && context.source) {
      query = `${query} where STRATEGY = :source`;
      binds.source = context.source;
    }

    const result = await database.execute(query, binds);
    return result.rows;
  } catch (err) {
    console.error('position::fetchPositions', err);
  }
};

exports.count = async (context) => {
  try {
    let query = countQuery;
    const binds = {};
    if (context && context.source) {
      query = `${query} where STRATEGY = :source`;
      binds.source = context.source;
    }

    const result = await database.execute(query, binds);
    return result.rows[0].count;
  } catch (err) {
    console.error('position::count', err);
  }
};

const calcChartData = (data) => {
  const chart = {};
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    chart[item.INSTRUMENT] = chart[item.INSTRUMENT]
      ? chart[item.INSTRUMENT] + item.USD_EQV : item.USD_EQV;
  }
  return chart;
};

exports.aumChartData = async (context) => {
  try {
    const dayData = await database.execute('select * from HERMES_24H_SRC_EOH_BALANCE_VW where strategy = :source', { source: context.source });
    // const dayChart = calcChartData(dayData.rows);

    const weekData = await database.execute('select * from HERMES_WEEK_SRC_EOH_BALANCE_VW where strategy = :source', { source: context.source });
    // const weekChart = calcChartData(weekData.rows);

    const monthData = await database.execute('select * from HERMES_MON_SRC_EOH_BALANCE_VW where strategy = :source', { source: context.source });
    // const monthChart = calcChartData(monthData.rows);
    console.log(monthData);

    const yearData = await database.execute('select * from HERMES_YEAR_SRC_EOM_BALANCE_VW where strategy = :source', { source: context.source });
    // const yearChart = calcChartData(yearData.rows);

    return {
      day: dayData, week: weekData, month: monthData, year: yearData
    };
  } catch (err) {
    console.error('position::aumChartData', err);
  }
};

exports.getCurrentPositions = async () => {
  try {
    const query = 'select INSTRUMENT "instrument", LAST_USD_RATE "lastUSDRate", LAST_BTC_RATE "lastBTCRate", BALANCE "balance", USD_EQV "usdEqv", BTC_EQV "btcEqv" from HERMES_CURRENT_BALANCE_VW';
    const result = await database.execute(query);
    return result.rows;
  } catch (err) {
    console.error('position::getCurrentPositions', err);
  }
};
