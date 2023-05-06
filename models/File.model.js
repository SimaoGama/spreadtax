const { Schema, model } = require('mongoose');

const fileSchema = new Schema(
  {
    name: String
  },
  {
    timestamps: true
  }
);

const File = model('File', fileSchema);

module.exports = File;
