const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Import the database connection

/* GET home page. */
router.get('/', async (req, res, next) => {
  try {
    // Example query: selecting all users from a 'users' table
    const [users] = await db.query('SELECT * FROM users');

    // Pass the retrieved users to the template
    res.render('index.html', {
      title: 'Express',
      users: users, // 'users' will be available as a variable in your EJS template
    });
  } catch (err) {
    // If there's an error, pass it to the error handler
    console.error('Database query failed:', err);
    next(err);
  }
});

module.exports = router;
