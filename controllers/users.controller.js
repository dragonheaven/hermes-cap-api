const crypto = require('crypto');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const bcrypt = require('bcrypt-nodejs');

const User = require('../db_apis/user');
const Client = require('../db_apis/client');
const Trade = require('../db_apis/trade');
const Token = require('../db_apis/token');
const Position = require('../db_apis/position');

const { serverError } = require('../helper/serverError');
const { sendPasswordResetEmail, sendConfirmationEmail } = require('../helper/sendgrid');

const returnToken = async (user, res) => {
  const token = jwt.sign({ userId: user.id, role: user.role }, 'Hermes Admin Login', { expiresIn: 60 * 60 });
  const refreshToken = jwt.sign({ userId: user._id }, 'Hermes Admin Login Refresh Token', { expiresIn: (60 + 5) * 60 });

  return res.status(200).json({
    token,
    refreshToken,
    user: {
      userId: user.id,
      userData: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    }
  });
};

exports.getUsers = async (req, res, next) => {
  try {
    const rows = await User.find();
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    const rows = await User.find();

    if (!user) return res.status(400).json({ error: { msg: 'The Account Email is already exists.' } });

    // Create a verification token, save it, and send email
    const token = await Token.create({
      userId: user.id,
      token: crypto.randomBytes(16).toString('hex')
    });

    const link = `${process.env.FRONTEND_URL}/admin/set-password/${token.token}`;

    await sendConfirmationEmail({
      to: user.email,
      from: 'no-reply@hermes.io',
      firstName: user.firstName,
      lastName: user.lastName,
      confirmUrl: link
    });

    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    await User.update(req.body);
    const rows = await User.find();
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    await User.del(req.body);
    const rows = await User.find();
    res.status(200).json(rows);
  } catch (err) {
    next(err);
  }
};

exports.postLogin = async (req, res, next) => {
  try {
    req.assert('email', 'Email cannot be blank').notEmpty();
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('password', 'Password cannot be blank').notEmpty();

    req.sanitize('email').normalizeEmail({ gmail_remove_dots: false });

    const errors = req.validationErrors();

    if (errors) {
      return res.status(400).json({ error: { msg: errors[0].msg } });
    }

    passport.authenticate('local', (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(400).json({ error: { msg: info.msg } });
      }

      req.logIn(user, (err) => {
        if (err) {
          return serverError(res);
        }
        return returnToken(user, res);
      });
    })(req, res, next);
  } catch (err) {
    return serverError(res);
  }
};

exports.requestForgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(400).json({ error: { msg: 'We were unable to find a user with the email' } });
    }

    const token = User.passwordToken();
    const expires = moment().add(1, 'hours').format('YYYY-MM-DD hh:mm:ss');

    await User.update({
      ...user,
      passwordResetToken: token,
      passwordResetExpires: expires
    });

    const link = `${process.env.FRONTEND_URL}/auth/reset-password/${token}`;

    await sendPasswordResetEmail({
      to: user.email,
      from: 'no-reply@hermes.io',
      firstName: user.firstName,
      lastName: user.lastName,
      confirmUrl: link
    });

    return res.status(200).json({ message: 'We have just sent instructions to your email' });
  } catch (err) {
    return next(err);
  }
};

/**
 *
 * @param req
 * @param res
 * @param next
 * @returns {Promise<*>}
 */
exports.resetPassword = async (req, res, next) => {
  try {
    req.assert('password', 'Password must be at least 8 characters long').len(8);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

    const errors = req.validationErrors();

    if (errors) {
      return res.status(400).json({ error: { msg: errors[0].msg } });
    }

    if (!req.body.token) {
      return res.status(400).json({ error: { msg: 'Password reset token is required' } });
    }

    const user = await User.findOne({ passwordResetToken: req.body.token });
    // .where('passwordResetExpires').gt(Date.now()).exec();
    if (!user || new Date(user.passwordResetExpires) < Date.now()) {
      return res.status(400).json({ error: { msg: 'Password reset token is invalid or has expired' } });
    }

    const salt = await bcrypt.genSaltSync(10);
    const newPassword = bcrypt.hashSync(req.body.password, salt, null);

    await User.update({
      ...user,
      password: newPassword,
      passwordResetToken: undefined,
      passwordResetExpires: undefined
    });

    return res.status(200).json({ message: 'Your password has been changed' });
  } catch (err) {
    return next(err);
  }
};

/**
 * GET /logout
 * Log out.
 */
exports.logout = async (req, res, next) => {
  try {
    await req.logout();
    await req.session.destroy();
    req.user = null;
    return res.status(200).json({ message: 'Logout successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /account/profile
 * Get profile information.
 */
exports.getProfile = async (req, res) => {
  try {
    const users = await User.find({ id: req.user.id });
    return returnToken(users[0], res);
  } catch (error) {
    return serverError(res);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const errors = await req.validationErrors();
    if (errors) {
      return res.status(400).json({ error: { msg: errors[0].msg } });
    }
    const user = await User.findOne({ id: req.body.id });

    if (!user) return res.status(400).json({ error: { msg: 'Invalid arguments' } });

    const result = await User.update(req.body);
    return returnToken(result, res);
  } catch (error) {
    return serverError(res);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    req.assert('password', 'Password must be at least 8 characters long').len(8);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

    const errors = req.validationErrors();

    if (errors) {
      return res.status(400).json({ error: { msg: errors[0].msg } });
    }

    const user = await User.findOne({ id: req.user.id });
    const match = await User.comparePassword(user, req.body.oldPassword);

    if (!match) return res.status(400).json({ error: { msg: 'Current Password does not match' } });

    const salt = await bcrypt.genSaltSync(10);
    const newPassword = bcrypt.hashSync(req.body.password, salt, null);

    await User.update({ ...user, password: newPassword });

    return res.status(201).json({ message: 'Successfully changed password' });
  } catch (error) {
    return next(error);
  }
};


exports.getTotalData = async (req, res) => {
  try {
    const totalData = await Trade.getTotalData();
    const pnlTradeData = await Trade.pnlChartData({ source: 'TRADE' });
    const pnlBaxterData = await Trade.pnlChartData({ source: 'BAXTER' });
    const pnlGoldData = await Trade.pnlChartData({ source: 'GOLD-I' });
    const totalTrade = await Trade.getTotalBySource({ source: 'TRADE' });
    const totalBaxter = await Trade.getTotalBySource({ source: 'BAXTER' });
    const totalGold = await Trade.getTotalBySource({ source: 'GOLD-I' });

    const aumTradeData = await Position.aumChartData({ source: 'TRADE' });
    const aumBaxterData = await Position.aumChartData({ source: 'BAXTER' });
    const aumGoldData = await Position.aumChartData({ source: 'GOLD-I' });

    const positions = await Position.getCurrentPositions();
    return res.status(200).json({
      clientsCount: await Client.count(),
      tradesCount: await Trade.count(),
      positions,
      charts: {
        baxter: {
          total: totalBaxter,
          pnl: pnlBaxterData,
          aum: aumBaxterData
        },
        trade: {
          total: totalTrade,
          pnl: pnlTradeData,
          aum: aumTradeData
        },
        gold: {
          total: totalGold,
          pnl: pnlGoldData,
          aum: aumGoldData
        }
      },
      totalData
    });
  } catch (err) {
    return serverError(res);
  }
};

exports.setAdminPassword = async (req, res, next) => {
  try {
    req.assert('password', 'Password must be at least 8 characters long').len(6);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

    const errors = req.validationErrors();

    if (errors) {
      return res.status(400).json({ error: { msg: errors[0].msg } });
    }

    if (!req.body.token) {
      return res.status(400).json({ error: { msg: 'Password reset token is required' } });
    }

    const token = await Token.findOne({ token: req.body.token });

    if (!token) {
      return res.status(400).json({ error: { msg: 'Token is invalid or has expired' } });
    }

    const account = await User.findOne({ id: token.userId });

    if (!account) {
      return res.status(400).json({ error: { msg: 'Account is invalid or has expired' } });
    }

    const salt = await bcrypt.genSaltSync(10);
    const newPassword = bcrypt.hashSync(req.body.password, salt, null);

    await User.update({ ...account, password: newPassword });

    return res.status(200).json({ message: 'Your password has been created successfully!' });
  } catch (error) {
    return next(error);
  }
};
