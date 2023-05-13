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
  '/clients/:id/hr/submit',
  fileUpload.single('file'),
  async (req, res) => {
    let fileUrlOnCloudinary = '';

    const clientId = req.params.id;
    const client = await Client.findById(clientId);

    if (!client) {
      return res.status(404).send('Client not found');
    }

    const { month } = req.body;

    const newFile = new File({
      name: req.file.originalname,
      month,
      fileUrl: fileUrlOnCloudinary
    });

    newFile.fileClient.push(clientId);
    await newFile.save();

    client.clientFiles.push(newFile._id);
    await client.save();

    res.send('File uploaded successfully!');
  }
);

module.exports = router;
