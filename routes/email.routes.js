const express = require('express');
const router = express.Router();
const User = require('../models/User.model');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const transporter = require('../config/transporter.config');

router.post('/send-email', (req, res, next) => {
  const { email, subject, message } = req.body;

  res.render('message', { email, subject, message });
});

// Send an email with the information we got from the form
transporter
  .sendMail({
    from: `"Spreadtax" <${process.env.EMAIL_ADDRESS}>`,
    to: User.findById(req.params.id).email,
    subject: subject,
    text: message,
    html: `<b>${message}</b>`
  })
  .then(info => res.render('message', { email, subject, message, info }))
  .catch(error => console.log(error));

module.exports = router;
