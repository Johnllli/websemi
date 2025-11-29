const express = require('express');
const router = express.Router();
const db = require('../config/db');

/* GET database page. */
router.get('/', async (req, res, next) => {
  const limit = 10; // Items per page (reduced for easier testing)

  // Get current page for each table from query parameters, default to 1
  const novelsPage = parseInt(req.query.novelsPage) || 1;
  const animalsPage = parseInt(req.query.animalsPage) || 1;
  const usersPage = parseInt(req.query.usersPage) || 1;

  // Calculate offset for each table
  const novelsOffset = (novelsPage - 1) * limit;
  const animalsOffset = (animalsPage - 1) * limit;
  const usersOffset = (usersPage - 1) * limit;

  try {
    // Fetch novels with pagination and total count
    const [novels] = await db.query('SELECT * FROM novels LIMIT ? OFFSET ?', [limit, novelsOffset]);
    const [[{ count: totalNovels }]] = await db.query('SELECT COUNT(*) as count FROM novels');
    const totalNovelsPages = Math.ceil(totalNovels / limit);

    // Fetch animals with pagination and total count
    const [animals] = await db.query('SELECT * FROM animals LIMIT ? OFFSET ?', [limit, animalsOffset]);
    const [[{ count: totalAnimals }]] = await db.query('SELECT COUNT(*) as count FROM animals');
    const totalAnimalsPages = Math.ceil(totalAnimals / limit);

    // Fetch users with pagination and total count
    const [users] = await db.query('SELECT * FROM users LIMIT ? OFFSET ?', [limit, usersOffset]);
    const [[{ count: totalUsers }]] = await db.query('SELECT COUNT(*) as count FROM users');
    const totalUsersPages = Math.ceil(totalUsers / limit);

    res.render('database.html', {
      novels: novels,
      novelsPage: novelsPage,
      totalNovelsPages: totalNovelsPages,

      animals: animals,
      animalsPage: animalsPage,
      totalAnimalsPages: totalAnimalsPages,

      users: users,
      usersPage: usersPage,
      totalUsersPages: totalUsersPages,

      currentPage: 'database'
    });
  } catch (err) {
    console.error('Database query failed:', err);
    next(err);
  }
});

module.exports = router;
