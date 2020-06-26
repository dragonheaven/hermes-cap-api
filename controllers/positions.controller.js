const Position = require('../db_apis/position');
const { serverError } = require('../helper/serverError');

exports.getFetchPositions = async (req, res) => {
  try {
    const positions = await Position.fetchPositions(req.body);

    res.status(200).json({
      total: await Position.count(req.body),
      valid: positions.length,
      positions
    });
  } catch (err) {
    return serverError(res);
  }
};

exports.fetchSpecialPositions = async (req, res) => {
  try {
    const positions = await Position.fetchPositions(req.body);

    res.status(200).json({
      total: await Position.count(req.body),
      valid: positions.length,
      positions
    });
  } catch (err) {
    return serverError(res);
  }
};
