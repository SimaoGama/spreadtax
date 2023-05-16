const express = require('express');
const router = express.Router();

const Client = require('../models/Client.model');
const User = require('../models/User.model');
const File = require('../models/File.model');

const bcrypt = require('bcryptjs');

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
    let fileUrlOnCloudinary = req.file.path;
    let type = req.params.type;
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
      console.log(type);

      return res.render('clients/client-details', {
        client,
        months,
        errorMessage,
        type
      });
    } else if (!req.file) {
      let errorMessage = (res.locals.errorMessage =
        'Please select a file to upload');

      return res.render('clients/client-details', {
        client,
        months,
        errorMessage,
        type
      });
    }

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

  console.log(query.tag);
  console.log(month);
  console.log(files);

  res.render('clients/client-details', { client, files, months });
});

module.exports = router;
