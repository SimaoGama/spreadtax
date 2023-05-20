const express = require('express');
const router = express.Router();
const User = require('../models/User.model');
const Client = require('../models/Client.model');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const transporter = require('../config/transporter.config');

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

  const existingUser = await User.findOne({ email });
  if (existingUser !== null) {
    res.render('auth/signup', { errorMessage: 'Email already exists' });
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

  const emailTemplate = `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to Spreadtax!</title>
    </head>
    <body>
      <h1>Welcome to Spreadtax!</h1>
      <p>Dear ${username},</p>
      <p>Thank you for signing up for our app. We're excited to have you on board!</p>
      <p>Here are your account details:</p>
      <ul>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Username:</strong> ${username}</li>
      </ul>
      <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
      <p>Best regards,</p>
      <p>Spreadtax team</p>
    </body>
    </html>`;

  //send confirmation email
  const mailOptions = {
    from: `"Spreadtax" <${process.env.EMAIL_ADDRESS}>`,
    to: email,
    subject: 'Welcome to Spreadtax',
    html: emailTemplate
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
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

router.post('/user/change-password', async (req, res) => {
  const currentPassword = req.body.password; // Retrieve the current password from the form input

  // Retrieve the stored password from the database based on the user's ID
  const userId = req.session.currentUser._id;
  const user = await User.findById(userId);

  if (!user) {
    // Handle the case when the user is not found
    return res.redirect('/user/:id/edit', { errorMessage: 'User not found' });
  }

  // Compare the current password with the stored password
  bcrypt.compare(currentPassword, user.password, async (err, isMatch) => {
    if (err) {
      // Handle the comparison error
      return res.status(500).send('Internal Server Error');
    }

    if (isMatch) {
      // The current password matches the stored password

      const newPassword = req.body.newPassword; // Retrieve the new password from the form input
      const confirmedPassword = req.body.confirmedPassword; // Retrieve the confirmed password from the form input

      if (newPassword === confirmedPassword) {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Store the hashed password back in the database
        user.password = hashedPassword;
        try {
          await user.save();
          // Redirect the user or provide a success message
          return res.redirect('/user/dashboard'); // Replace with the appropriate redirect URL
        } catch (error) {
          // Handle the database update error
          return res.status(500).send('Internal Server Error');
        }
      } else {
        // Passwords do not match
        // Handle the error or inform the user about password mismatch
        return res.redirect('/user/:id/edit', {
          errorMessage: 'Passwords do not match'
        });
      }
    } else {
      // Current password does not match the stored password
      // Handle the error or inform the user about incorrect current password
      return res.redirect('/user/:id/edit', {
        errorMessage: 'Incorrect current password'
      });
    }
  });
});

router.post('/logout', async (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
