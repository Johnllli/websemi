const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/login'); // Redirect to login page if not logged in
  }
}

// Apply authentication middleware to all routes in this router
router.use(isAuthenticated);

/* GET messages page. */
router.get('/', async (req, res, next) => {
  try {
    const [messages] = await db.query('SELECT * FROM message ORDER BY sent_at DESC');
    res.render('messages.html', {
      messages: messages,
      currentPage: 'messages' // Pass currentPage variable
    });
  } catch (err) {
    console.error('Error fetching messages:', err);
    next(err); // Pass error to the error handler
  }
});

module.exports = router;
