const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');

// GET login page
router.get('/', (req, res) => {
  res.render('login.html', { error: null });
});

// POST login credentials
router.post('/', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length > 0) {
      const user = users[0];
      const match = await bcrypt.compare(password, user.password);

      if (match) {
        req.session.userId = user.id;
        req.session.userName = user.name; // Add user's name to the session
        req.session.isAdmin = user.is_admin;
        return res.redirect('/');
      }
    }

    res.render('login.html', { error: 'Invalid email or password' });
  } catch (err) {
    console.error('Login failed:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
