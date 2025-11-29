const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middleware/auth');

// Apply isAdmin middleware to all routes in this router
router.use(isAdmin);

/* GET admin page. */
router.get('/', (req, res, next) => {
  res.render('admin.html', {
    currentPage: 'admin'
  });
});

module.exports = router;
