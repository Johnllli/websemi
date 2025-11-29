const express = require('express');
const router = express.Router();
const db = require('../config/db');

/* GET database page. */
router.get('/', async (req, res, next) => {
  try {
    const [novels] = await db.query('SELECT * FROM novels');
    const [animals] = await db.query('SELECT * FROM animals');
    const [users] = await db.query('SELECT * FROM users');

    res.render('database.html', {
      novels: novels,
      animals: animals,
      users: users,
      currentPage: 'database' // Pass currentPage variable
    });
  } catch (err) {
    console.error('Database query failed:', err);
    next(err);
  }
});

module.exports = router;
