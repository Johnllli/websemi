const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET contact page
router.get('/', async (req, res) => {
  res.render('contact.html', {
    error: null,
    success: null,
    currentPage: 'contact' // Pass currentPage variable
  });
});

// POST contact form submission
router.post('/', async (req, res) => {
  const { message } = req.body;
  let name;
  let email;
  let role = 'visitor';

  // Determine name, email, and role based on login status
  if (req.session.userId) {
    name = req.session.userName;
    email = res.locals.userEmail; // userEmail is already fetched and available in res.locals
    if (req.session.isAdmin) {
      role = 'admin';
    } else {
      role = 'normal user';
    }
  } else {
    name = 'None';
    email = 'None';
    role = 'visitor';
  }

  try {
    await db.query('INSERT INTO message (name, email, role, message) VALUES (?, ?, ?, ?)', [name, email, role, message]);
    res.render('contact.html', {
      error: null,
      success: 'Your message has been sent successfully!',
      currentPage: 'contact' // Pass currentPage variable
    });
  } catch (err) {
    console.error('Error saving message to database:', err);
    res.status(500).render('contact.html', {
      error: 'Failed to send message. Please try again later.',
      success: null,
      currentPage: 'contact' // Pass currentPage variable
    });
  }
});

module.exports = router;
