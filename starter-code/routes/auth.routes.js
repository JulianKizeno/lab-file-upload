const express = require('express');
const passport = require('passport');
const router = express.Router();

// Reject structured query operators before authentication or database lookups.
router.use(['/login', '/signup'], (req, res, next) => {
    if (req.method !== 'POST') return next()
    const body = req.body || {}
    if (typeof body.username !== 'string' || !body.username.trim() ||
        body.username.length > 128 || typeof body.password !== 'string' ||
        !body.password || Buffer.byteLength(body.password, 'utf8') > 72) {
        return res.status(400).json({ message: 'Invalid credentials format' })
    }
    return next()
})

const { ensureLoggedIn, ensureLoggedOut } = require('connect-ensure-login');

router.get('/login', ensureLoggedOut(), (req, res) => {
  res.render('authentication/login', { message: req.flash('error') });
});

router.post(
  '/login',
  ensureLoggedOut(),
  passport.authenticate('local-login', {
    successRedirect: '/profile',
    failureRedirect: '/login',
    failureFlash: true
  })
);

router.get('/signup', ensureLoggedOut(), (req, res) => {
  res.render('authentication/signup', { message: req.flash('error') });
});

router.post(
  '/signup',
  ensureLoggedOut(),
  passport.authenticate('local-signup', {
    successRedirect: '/profile',
    failureRedirect: '/signup',
    failureFlash: true
  })
);

router.get('/profile', ensureLoggedIn('/login'), (req, res) => {
  res.render('authentication/profile', {
    user: req.user
  });
});

router.post('/logout', ensureLoggedIn('/login'), (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/');
  });
});

module.exports = router;
