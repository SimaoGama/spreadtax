const { Schema, model } = require('mongoose');

const fileSchema = new Schema({
  name: String,
  file: {
    data: Buffer,
    contentType: String
  }
});

const File = model('File', fileSchema);

module.exports = File;
