/**
 * Permission middleware
 */
exports.onlyHermesCapital = async (req, res, next) => {
  try {
    if (req.user.role === 'hermes_capital') {
      next();
    } else {
      res.status(403).json({ error: { msg: 'Permission is invalid.' } });
    }
  } catch (error) {
    return next(error);
  }
};

exports.aboveFundSuperAdmin = async (req, res, next) => {
  try {
    if (req.user.role === 'hermes_capital' || req.user.role === 'fund_manager') {
      next();
    } else {
      res.status(403).json({ error: { msg: 'Permission is invalid.' } });
    }
  } catch (error) {
    return next(error);
  }
};

exports.aboveFundAdmin = async (req, res, next) => {
  try {
    if (req.user.role === 'hermes_capital' || req.user.role === 'fund_manager' || req.user.role === 'crm') {
      next();
    } else {
      res.status(403).json({ error: { msg: 'Permission is invalid.' } });
    }
  } catch (error) {
    return next(error);
  }
};
