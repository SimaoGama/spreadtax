const express = require('express');
const router = express.Router();
const User = require('../models/User.model');

// router.get('/user/dashboard', async (req, res) => {
//   try {
//     if (!req.session.currentUser || !req.session.currentUser._id) {
//       res.redirect('/login');
//     } else {
//       const userId = req.session.currentUser._id;
//       const user = await User.findById(userId).populate({
//         path: 'userClients',
//         options: { strictPopulate: false }
//       });
//       res.render('clients/client-list', { user });
//     }
//   } catch (e) {
//     console.log(e);
//     res.render('index');
//   }
// });

router.get('/user/dashboard', async (req, res) => {
  //   console.log(req.session.currentUser.userClients);
  try {
    if (!req.session.currentUser || !req.session.currentUser._id) {
      res.redirect('/login');
    } else {
      const userId = req.session.currentUser._id;
      const user = await User.findById(userId).populate({
        path: 'userClients',
        options: { strictPopulate: false }
      });
      res.render('users/user-dashboard', { user });
    }
  } catch (e) {
    console.log(e);
    res.render('index');
  }
});

router.get('/user/:id', async (req, res) => {
  const user = await User.findById(req.params.id);

  res.render('users/user-settings', user);
});

router.get('/user/:id/edit', async (req, res) => {
  const user = await User.findById(req.params.id);
  console.log(user);

  res.render('users/user-edit', { user });
});

module.exports = router;
