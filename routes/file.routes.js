const express = require('express');
const router = express.Router();
const Client = require('../models/Client.model');
const User = require('../models/User.model');
const File = require('../models/File.model');
const Chat = require('../models/Chat.model');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const transporter = require('../config/transporter.config');
const fileUpload = require('../config/cloudinary');
const multer = require('multer');

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
    const client = await Client.findById(clientId).populate({
      path: 'chats',
      populate: { path: 'sender recipient' },
      options: { sort: { timestamp: 'desc' }, limit: 3 }
    });

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
        type,
        messages: client.chats
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
      <p>Please follow the link to download the files:</p>
      <a href="${fileUrlOnCloudinary.replace(
        'pdf',
        'png'
      )}" target="_blank" download>Click here to download</a>
      <object src="${fileUrlOnCloudinary} />"

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
      //res.send
      console.log('File uploaded successfully!');

      if (req.session.currentUser.isAdmin) {
        res.redirect(`/clients/${clientId}/#hr`);
      } else {
        return res.render(`clients/client-dashboard`, {
          client,
          months,
          type,
          messages: client.chats
        });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).send('Error saving file to database');
    }
  }
);

router.get('/clients/:id/:type/documents', async (req, res) => {
  const currentUser = req.session.currentUser;
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
    const client = await Client.findById(clientId)
      .populate('clientFiles')
      .populate({
        path: 'chats',
        populate: { path: 'sender recipient' },
        options: { sort: { timestamp: 'desc' }, limit: 3 }
      });

    if (!client) {
      return res.status(404).send('Client not found');
    }

    let query = { fileClient: clientId };

    if (month) {
      query.month = month;
    }

    if (currentUser.isAdmin) {
      if (type === 'hr') {
        query.tag = 'human resources';
        let hrFiles = await File.find(query).populate('fileClient');
        if (!hrFiles || hrFiles.length === 0) {
          const errorSearchMessage = 'No files found';
          console.log('No files');
          return res.render('clients/client-details', {
            client,
            months,
            errorSearchMessage
          });
        }
        res.render('clients/client-details', {
          client,
          hrFiles, // Use 'files' as the variable name
          months
        });
      } else if (type === 'mt') {
        query.tag = 'monthly taxes';
        let mtFiles = await File.find(query).populate('fileClient');
        if (!mtFiles || mtFiles.length === 0) {
          const errorSearchMessage = 'No files found';
          console.log('No files');
          return res.render('clients/client-details', {
            client,
            months,
            errorSearchMessage
          });
        }
        console.log(mtFiles);
        res.render('clients/client-details', {
          client,
          mtFiles, // Use 'files' as the variable name
          months
        });
      } else if (type === 'yt') {
        query.tag = 'yearly taxes';
        let ytFiles = await File.find(query).populate('fileClient');
        if (!ytFiles || ytFiles.length === 0) {
          const errorSearchMessage = 'No files found';
          console.log('No files');
          return res.render('clients/client-details', {
            client,
            months,
            errorSearchMessage
          });
        }
        res.render('clients/client-details', {
          client,
          files: ytFiles, // Use 'files' as the variable name
          months
        });
      }
      //code if user is Client
    } else {
      if (type === 'hr') {
        query.tag = 'human resources';
        let hrFiles = await File.find(query).populate('fileClient');
        if (!hrFiles || hrFiles.length === 0) {
          const errorSearchMessage = 'No files found';
          console.log('No files');
          return res.render('clients/client-dashboard', {
            client,
            months,
            errorSearchMessage,
            messages: client.chats
          });
        }
        res.render('clients/client-dashboard', {
          client,
          hrFiles, // Use 'files' as the variable name
          months,
          messages: client.chats
        });
      } else if (type === 'mt') {
        query.tag = 'monthly taxes';
        let mtFiles = await File.find(query).populate('fileClient');
        if (!mtFiles || mtFiles.length === 0) {
          const errorSearchMessage = 'No files found';
          console.log('No files');
          return res.render('clients/client-dashboard', {
            client,
            months,
            errorSearchMessage,
            messages: client.chats
          });
        }
        console.log(mtFiles);
        res.render('clients/client-dashboard', {
          client,
          mtFiles, // Use 'files' as the variable name
          months,
          messages: client.chats
        });
      } else if (type === 'yt') {
        query.tag = 'yearly taxes';
        let ytFiles = await File.find(query).populate('fileClient');
        if (!ytFiles || ytFiles.length === 0) {
          const errorSearchMessage = 'No files found';
          console.log('No files');
          return res.render('clients/client-dashboard', {
            client,
            months,
            errorSearchMessage,
            messages: client.chats
          });
        }
        res.render('clients/client-dashboard', {
          client,
          files: ytFiles, // Use 'files' as the variable name
          months,
          messages: client.chats
        });
      }
    }
    console.log(query);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

router.get('/clients/:id/file-alert', async (req, res) => {
  const user = req.session.currentUser;
  const clientId = req.params.id;
  const client = await Client.findById(clientId)
    .populate('clientFiles')
    .populate({
      path: 'chats',
      populate: { path: 'sender recipient' },
      options: { sort: { timestamp: 'desc' }, limit: 3 }
    });

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
    const emailTemplate = `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${user.username} sent you a reminder</title>
    </head>
    <body>
      <h1>Your accountant ${user.username} wants to remind you that some files are missing</h1>
      <p>Dear ${client.companyName},</p>
      <p>Please don't forget to add the necessary files on your portal.</p>

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
      res.render('clients/client-details', {
        client,
        months,
        messages: client.chats
      });
    } catch (error) {
      console.error('Error sending email:', error);
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error sending alert');
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
