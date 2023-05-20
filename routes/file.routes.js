const express = require('express');
const router = express.Router();

const Client = require('../models/Client.model');
const User = require('../models/User.model');
const File = require('../models/File.model');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const transporter = require('../config/transporter.config');

const fileUpload = require('../config/cloudinary');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// router.post('/clients/hr/submit', async (req, res) => {
//   res.render('clients/client-details');
// });

router.post(
  '/clients/:id/:type/submit',
  fileUpload.single('file'),
  async (req, res) => {
    let type = req.params.type;
    const user = req.session.currentUser;
    const clientId = req.params.id;
    const client = await Client.findById(clientId);
    const { month } = req.body;
    let newFile;

    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December'
    ];

    if (!client) {
      return res.status(404).send('Client not found');
    }

    if (!month) {
      let errorMessage = (res.locals.errorMessage = 'Please select a month');

      return res.render('clients/client-details', {
        client,
        months,
        errorMessage,
        type
      });
    }

    if (!req.file) {
      let errorMessage = (res.locals.errorMessage =
        'Please select a file to upload');

      return res.render('clients/client-details', {
        client,
        months,
        errorMessage,
        type
      });
    }

    let fileUrlOnCloudinary = req.file.path;

    if (type === 'hr') {
      newFile = new File({
        name: req.file.originalname,
        tag: 'human resources',
        month,
        fileUrl: fileUrlOnCloudinary
      });
    } else if (type === 'mt') {
      newFile = new File({
        name: req.file.originalname,
        tag: 'monthly taxes',
        month,
        fileUrl: fileUrlOnCloudinary
      });
    } else if (type === 'yt') {
      newFile = new File({
        name: req.file.originalname,
        tag: 'yearly taxes',
        month,
        fileUrl: fileUrlOnCloudinary
      });
    }

    try {
      newFile.fileClient.push(clientId);
      await newFile.save();

      client.clientFiles.push(newFile._id);
      await client.save();

      const emailTemplate = `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${user.username} has just uploaded some files</title>
    </head>
    <body>
      <h1>${user.username} has just uploaded some files</h1>
      <p>Dear ${client.companyName},</p>
      <p>Please follow the link to download the files</p>
      <p>${fileUrlOnCloudinary}</p>
      <p>Here are your account details:</p>
      <ul>
        <li><strong>Email:</strong> ${client.email}</li>
        <li><strong>Username:</strong> ${client.companyName}</li>
      </ul>
      <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
      <p>Best regards,</p>
      <p>Spreadtax team</p>
    </body>
    </html>`;

      //send confirmation email
      const mailOptions = {
        from: `"Spreadtax" <${process.env.EMAIL_ADDRESS}>`,
        to: client.email,
        subject: 'Welcome to Spreadtax',
        html: emailTemplate
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
      } catch (error) {
        console.error('Error sending email:', error);
      }

      res.send('File uploaded successfully!');
    } catch (error) {
      console.error(error);
      return res.status(500).send('Error saving file to database');
    }
  }
);

router.get('/clients/:id/:type/documents', async (req, res) => {
  const clientId = req.params.id;
  const type = req.params.type;
  const { month } = req.query;

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];
  try {
    const client = await Client.findById(clientId).populate('clientFiles');
    if (!client) {
      return res.status(404).send('Client not found');
    }

    let query = { fileClient: clientId };

    if (type === 'hr') {
      query.tag = 'human resources';
    } else if (type === 'mt') {
      query.tag = 'monthly taxes';
    } else if (type === 'yt') {
      query.tag = 'yearly taxes';
    }

    //   let files = [...client.clientFiles];

    if (month && query.tag) {
      query.month = month;
    }

    let files = await File.find({
      ...query,
      month: month
    }).populate('fileClient');

    if (!files || files.length === 0) {
      const errorSearchMessage = 'No files found';
      console.log('no files');
      return res.render('clients/client-details', {
        client,
        months,
        errorSearchMessage
      });
    }

    res.render('clients/client-details', {
      client,
      files,
      months
    });
  } catch (e) {
    console.log(e);
    res.status(500).send('Server error');
  }
});

router.get('/clients/:id/hr/documents', async (req, res) => {
  const clientId = req.params.id;

  try {
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).send('Client not found');
    }

    // Get the documents/files for the client
    const files = await File.find({ clientId });

    res.render('clients/client-details', { client, files });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.post('/clients/:id/:type/documents/:fileId/delete', async (req, res) => {
  const clientId = req.params.id;
  const type = req.params.type;
  const fileId = req.params.fileId;

  try {
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).send('Client not found');
    }

    const deletedFile = await File.findByIdAndDelete(fileId);
    if (!deletedFile) {
      return res.status(404).send('File not found');
    }

    const index = client.clientFiles.indexOf(deletedFile._id);
    if (index > -1) {
      client.clientFiles.splice(index, 1);
    }

    await client.save();

    res.redirect(`/clients/${clientId}/${type}/documents`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
