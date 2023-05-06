const express = require('express');
const router = express.Router();
const User = require('../models/User.model');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');

router.use(bodyParser.urlencoded({ extended: false }));

router.get('/signup', (req, res) => {
  res.render('auth/signup');
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

  res.redirect('/');
});

router.get('/login', (req, res) => {
  res.render('auth/login');
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  try {
    if (!username || !password) {
      res.render('auth/login', { errorMessage: 'Invalid login' });
      return;
    }

    if (!user) {
      res.render('auth/login', { errorMessage: 'User does not exist' });
      return;
    }

    //check if password matches
    if (bcrypt.compareSync(password, user.password)) {
      req.session.currentUser = user;
      res.redirect('/user/dashboard');
    } else {
      res.render('auth/login', { errorMessage: 'Invalid login' });
      return;
    }
  } catch (err) {
    console.log(err);
  }
});

router.post('/logout', async (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
