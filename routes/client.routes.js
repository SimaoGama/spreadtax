const express = require('express');
const router = express.Router();
const Client = require('../models/Client.model');
const User = require('../models/User.model');
const bcrypt = require('bcryptjs');

router.get('/clients/new', async (req, res) => {
  const user = await User.findById(req.session.currentUser._id);
  console.log(user.userClients.length);
  console.log(user.accountType);
  if (!req.session.currentUser || !user) {
    res.redirect('/login');
  } else {
    if (user.accountType.isFree && user.userClients.length === 2) {
      console.log('error');
      res.redirect('/');
    } else {
      console.log('success');
      res.render('clients/new-client');
    }
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

  //update push client
  currentUser.userClients.push(newClient._id);

  await currentUser.save();

  res.redirect('/user/dashboard');
});

router.get('/clients/:id', async (req, res) => {
  const clientId = req.params.id;
  const client = await Client.findById(clientId);
  res.render('clients/client-details', client);
});

module.exports = router;
