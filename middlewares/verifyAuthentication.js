const jwt = require('jsonwebtoken');
const User = require('../db_apis/user');
/**
 * Auth middleware
 */
exports.verifyAuth = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      console.log('auth: No Authorization Header.');
      return res.status(401).json({ error: { msg: 'No Authorization Header.' } });
    }

    const tokenStr = req.headers.authorization.split(' ');

    if (tokenStr.length !== 2 || tokenStr[0] !== 'Bearer') {
      // Return error if Bearer token does not exist
      console.log('auth: No Bearer Token.');
      return res.status(401).json({ error: { msg: 'No Bearer Token.' } });
    }

    // JWT token verify
    jwt.verify(tokenStr[1], 'Hermes Admin Login', async (err, decoded) => {
      if (err) {
        res.status(401).json({ error: { msg: 'Token expired.' } });
        return;
      }

      try {
        const users = await User.find({ id: decoded.userId });
        if (users.length === 0) res.status(401).json({ error: { msg: 'Token expired.' } });

        req.user = users[0];
        next();
      } catch (err) {
        if (err) return res.status(500).json({ error: { msg: 'Internal server error. Please try again later.' } });
      }
    });
  } catch (error) {
    return next(error);
  }
};
