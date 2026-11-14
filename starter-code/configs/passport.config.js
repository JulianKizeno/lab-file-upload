const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User.model');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');

passport.serializeUser((user, callback) => callback(null, user._id));

passport.deserializeUser((id, callback) => {
  User.findById(id)
    .then(user => callback(null, user))
    .catch(error => callback(error));
});

passport.use(
  'local-login',
  new LocalStrategy((username, password, next) => {
    if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
      return next(null, false, { message: 'Invalid credentials' });
    }
    User.findOne({ username })
      .then(async user => {
        if (!user) return next(null, false, { message: 'Invalid credentials' });
        if (!await bcrypt.compare(password, user.password)) {
          return next(null, false, { message: 'Invalid credentials' });
        }
        return next(null, user);
      })
      .catch(error => next(error));
  })
);

passport.use(
  'local-signup',
  new LocalStrategy({ passReqToCallback: true }, (req, username, password, next) => {
    const { email } = req.body;
    if (typeof username !== 'string' || typeof password !== 'string' || typeof email !== 'string' || !username || !password || !email) {
      return next(null, false, { message: 'Invalid signup fields' });
    }

    bcrypt
      .hash(password, 10)
      .then(hash => {
        return User.create({
          username,
          email,
          password: hash
        });
      })
      .then(user => next(null, user))
      .catch(err => next(err));
  })
);

module.exports = app => {
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    throw new Error('SESSION_SECRET must contain at least 32 characters');
  }
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: { httpOnly: true, sameSite: 'lax', secure: app.get('env') === 'production' },
      store: new MongoStore({ mongooseConnection: mongoose.connection })
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());
};
