const express = require('express');
const router = express.Router();
const User = require('../models/User.model');
const Client = require('../models/Client.model');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: false }));

router.get('/signup', (req, res) => {
  res.render('auth/signup');
});

router.get('/auth/signup', (req, res) => {
  let accountType = req.query.value;
  // Render the form with the preselected radio button based on the accountType value
  res.render('auth/signup', { accountType });
});

router.post('/signup', async (req, res) => {
  const { username, email, password, accountType } = req.body;

  if (username === '' || email === '' || password === '') {
    res.render('auth/signup', { errorMessage: 'Fill in all fields' });
    return;
  }

  const regex = /(?=.*d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;

  if (regex.test(password) === false) {
    res.render('auth/signup', { errorMessage: 'Password is too weak' });
    return;
  }

  const user = await User.findOne({ username });
  if (user !== null) {
    res.render('auth/signup', { errorMessage: 'Username already exists' });
    return;
  }

  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  const hashedPassword = bcrypt.hashSync(password, salt);

  if (accountType === 'isFree') {
    // handle free account
    await User.create({
      username,
      email,
      password: hashedPassword,
      accountType: {
        isFree: true,
        isPremium: false,
        isUnlimited: false
      }
    });
    console.log('Free');
  } else if (accountType === 'isPremium') {
    // handle premium account
    await User.create({
      username,
      email,
      password: hashedPassword,
      accountType: {
        isFree: false,
        isPremium: true,
        isUnlimited: false
      }
    });
    console.log('Premium');
  } else if (accountType === 'isUnlimited') {
    // handle unlimited account
    await User.create({
      username,
      email,
      password: hashedPassword,
      accountType: {
        isFree: false,
        isPremium: false,
        isUnlimited: true
      }
    });
    console.log('Unlimited');
  }

  res.redirect('/login');
});

router.get('/login', (req, res) => {
  res.render('auth/login');
});

router.post('/login', async (req, res) => {
  const { username, password, loginType } = req.body;

  console.log(loginType);
  console.log(password);

  if (loginType === 'isUser') {
    try {
      if (!username || !password) {
        return res.render('auth/login', { errorMessage: 'Invalid login' });
      }

      const user = await User.findOne({ username });

      if (!user) {
        return res.render('auth/login', {
          errorMessage: 'User does not exist'
        });
      }

      // Check if password matches
      if (bcrypt.compareSync(password, user.password)) {
        req.session.currentUser = user;
        return res.redirect('/user/dashboard');
      } else {
        return res.render('auth/login', { errorMessage: 'Invalid login' });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).send('Server error');
    }
  } else if (loginType === 'isClient') {
    try {
      if (!username || !password) {
        return res.render('auth/login', { errorMessage: 'Invalid username' });
      }

      const client = await Client.findOne({ companyName: username });

      console.log('client is:', client);

      if (!client) {
        return res.render('auth/login', {
          errorMessage: 'Client does not exist'
        });
      }

      const comparePassword = await bcrypt.compare(password, client.password);
      if (comparePassword) {
        console.log(client.password);
        req.session.currentUser = client;
        /* return */ res.redirect('/client/dashboard');
      } else {
        console.log(client.password);
        console.log(password);
        /* return */ res.render('auth/login', {
          errorMessage: 'Invalid password'
        });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: 'Server error', err: err });
    }
  } else {
    // Invalid login type
    return res.render('auth/login', { errorMessage: 'Invalid login type' });
  }
});

router.post('/logout', async (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
