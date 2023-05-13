const express = require('express');
const router = express.Router();
const Client = require('../models/Client.model');
const User = require('../models/User.model');
const bcrypt = require('bcryptjs');
const fileUpload = require('../config/cloudinary');

router.get('/clients/new', async (req, res) => {
  const user = await User.findById(req.session.currentUser._id);
  console.log(user.userClients);
  // check for account type
  if (!req.session.currentUser || !user) {
    res.redirect('/login');
  } else {
    if (user.accountType.isFree && user.userClients.length >= 2) {
      res.redirect('/');
    } else if (user.accountType.isPremium && user.userClients.length >= 4) {
      res.redirect('/');
    } else {
      res.render('clients/new-client');
    }
  }
});

router.post('/clients/new', fileUpload.single('image'), async (req, res) => {
  let fileUrlOnCloudinary = '';
  if (req.file) {
    fileUrlOnCloudinary = req.file.path;
  }
  //current logged User landfinance2
  const { companyName, email, password, nipc, niss, address } = req.body;

  if (!companyName || !email || !password || !nipc || !niss || !address) {
    res.render('auth/signup', { errorMessage: 'Fill in all fields' });
    return;
  }

  const regex = /(?=.*d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;

  if (regex.test(password) === false) {
    res.render('clients/new-client', { errorMessage: 'Password is too weak' });
    return;
  }

  const user = await User.findById(req.session.currentUser._id).populate(
    'userClients'
  );

  const desiredUsername = req.body.companyName;
  if (user.userClients.some(client => client.companyName === desiredUsername)) {
    res.render('clients/new-client', {
      errorMessage: 'Username already registered'
    });
    return;
  }

  const clientNipc = await Client.findOne(user.userClients.nipc);
  if (user.userClients.includes(clientNipc)) {
    res.render('clients/new-client', {
      errorMessage: 'NIPC already registered'
    });
    return;
  }

  const clientNiss = await Client.findOne(user.userClients.niss);
  if (user.userClients.includes(clientNiss)) {
    res.render('clients/new-client', {
      errorMessage: 'NISS already registered'
    });
    return;
  }

  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  const hashedPassword = bcrypt.hashSync('1234', salt);

  const newClient = await Client.create({
    companyName,
    email,
    password: hashedPassword,
    nipc,
    niss,
    address,
    imageUrl: fileUrlOnCloudinary
  });
  console.log(fileUrlOnCloudinary);
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

router.post('/clients/edit', async (req, res) => {
  const { companyName, email, nipc, niss, address } = req.body;

  await Client.findByIdAndUpdate(req.query.id, {
    companyName,
    email,
    nipc,
    niss,
    address
  });

  res.redirect(`/clients/${req.query.id}`);
});

router.get('/clients/:id/edit', async (req, res) => {
  const client = await Client.findById(req.params.id);

  res.render('clients/client-edit', { client });
});

router.post('/clients/:id/delete', async (req, res) => {
  const currentUser = await User.findById(req.session.currentUser._id);
  const deletedClient = await Client.findByIdAndDelete(req.params.id);

  try {
    const index = currentUser.userClients.indexOf(deletedClient._id);
    if (index > -1) {
      currentUser.userClients.splice(index, 1);
    }

    await currentUser.save();
    console.log(`Client with ID ${req.params.id} deleted successfully`);

    res.redirect(`/user/dashboard`);
  } catch (err) {
    console.error(err);
  }
});

module.exports = router;
