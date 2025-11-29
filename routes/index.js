const express = require('express');
const router = express.Router();
const db = require('../config/db');

/* GET home page. */
router.get('/', async (req, res, next) => {
  try {
    // Fetch the 6 most recently published novels
    const [novels] = await db.query('SELECT * FROM novels ORDER BY pyear DESC LIMIT 6');

    // Fetch 2 random animals
    const [animals] = await db.query('SELECT * FROM animals ORDER BY RAND() LIMIT 2');

    res.render('index.html', {
      novels: novels,
      animals: animals,
    });
  } catch (err) {
    console.error('Database query failed:', err);
    next(err);
  }
});

module.exports = router;
