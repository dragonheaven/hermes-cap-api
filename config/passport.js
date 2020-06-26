const passport = require('passport');
const { Strategy: LocalStrategy } = require('passport-local');

const User = require('../db_apis/user');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const users = await User.find({ id });
  done(null, users[0]);
});

/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return done(null, false, { msg: `Email ${email} not found.` });
  }
  try {
    const isMatch = await User.comparePassword(user, password);
    if (isMatch) {
      return done(null, user);
    }
    return done(null, false, { msg: 'Invalid email or password.' });
  } catch (err) {
    return done(err);
  }
}));


/**
 * Login Required middlewares.
 */
exports.isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  res.status(200).json({ redirect: 'login' });
};
