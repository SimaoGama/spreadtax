const express = require('express');
const router = express.Router();

/* GET home page */
router.get('/', (req, res, next) => {
  const currentUser = req.session.currentUser;
  res.render('index', { currentUser });
});

router.get('/#plans', (req, res, next) => {
  const currentUser = req.session.currentUser;
  res.render('index', { currentUser });
});

router.get('/#about', (req, res, next) => {
  const currentUser = req.session.currentUser;
  res.render('index', { currentUser });
});

router.get('/loading', function (req, res) {
  // Set a flag to keep track of whether the response has already been sent
  let responseSent = false;

  // Render the transition view
  res.render('transition');

  // Wait for 3 seconds before redirecting to the login view
  setTimeout(function () {
    // Check if the response has already been sent before sending it again
    if (!responseSent) {
      responseSent = true;
      res.redirect('/login');
    }
  }, 3000);
});

module.exports = router;
