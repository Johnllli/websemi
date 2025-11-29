const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');

// GET login page
router.get('/', (req, res) => {
  res.render('login.html', { error: null, currentPage: 'login' });
});

// POST login credentials
router.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      // Email does not exist
      return res.render('login.html', { error: 'Account does not exist.', currentPage: 'login' });
    }

    const user = users[0];
    const match = await bcrypt.compare(password, user.password);

    if (match) {
      req.session.userId = user.id;
      req.session.userName = user.name;
      req.session.isAdmin = user.is_admin;
      return res.redirect('/');
    } else {
      // Email exists, but password is wrong
      return res.render('login.html', { error: 'Invalid password.', currentPage: 'login' });
    }
  } catch (err) {
    console.error('Login failed:', err);
    res.status(500).render('login.html', { error: 'An unexpected server error occurred.', currentPage: 'login' });
  }
});

module.exports = router;
