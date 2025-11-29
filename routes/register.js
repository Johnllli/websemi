const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../config/db');

// GET registration page
router.get('/', (req, res) => {
  res.render('register.html', { error: null, success: null });
});

// POST registration data
router.post('/', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length > 0) {
      return res.render('register.html', { error: 'User with this email already exists.', success: null });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    await db.query('INSERT INTO users (name, email, password, is_admin) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, 0]);

    res.render('register.html', { error: null, success: 'Registration successful! You can now log in.' });
  } catch (err) {
    console.error('Registration failed:', err);
    res.status(500).render('register.html', { error: 'An error occurred during registration.', success: null });
  }
});

module.exports = router;
