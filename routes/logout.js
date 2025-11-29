const express = require('express');
const router = express.Router();

// GET logout
router.get('/', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      // Handle error, maybe log it and redirect
      console.error('Session destruction failed:', err);
      return res.redirect('/');
    }
    
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

module.exports = router;
