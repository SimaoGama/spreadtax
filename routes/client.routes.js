const express = require('express');
const router = express.Router();
const Client = require('../models/Client.model');
const User = require('../models/User.model');
const bcrypt = require('bcryptjs');

router.get('/clients/new', (req, res) => {
  if (!req.session.currentUser || !req.session.currentUser._id) {
    res.redirect('/login');
  } else {
    res.render('clients/new-client');
  }
});

router.post('/clients/new', async (req, res) => {
  //current logged User landfinance2
  const { companyName, email, password, nipc, niss, address } = req.body;

  //   if (!companyName || !email || !password || !nipc || !niss) {
  //     res.render('clients/new-client', {
  //       errorMessage: 'Fill in all mandatory fields'
  //     });
  //     return;
  //   }

  const regex = /(?=.*d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;

  if (regex.test(password) === false) {
    res.render('clients/new-client', { errorMessage: 'Password is too weak' });
    return;
  }

  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  const hashedPassword = bcrypt.hashSync('1234', salt);

  //   const client = await Client.findOne({ companyName });
  //   if (client !== null) {
  //     res.render('clients/new-client', {
  //       errorMessage: 'Username already exists'
  //     });
  //     return;
  //   }

  const newClient = await Client.create({
    companyName,
    email,
    password: hashedPassword,
    nipc,
    niss,
    address
  });

  //Find current user
  const currentUser = await User.findById(req.session.currentUser._id);
  console.log(currentUser);

  //update push client
  currentUser.userClients.push(newClient._id);

  await currentUser.save();

  res.redirect('/');
});

module.exports = router;
