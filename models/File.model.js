const { Schema, model } = require('mongoose');

const fileSchema = new Schema({
  name: String,
  tag: [String],
  month: String,
  fileClient: [{ type: Schema.Types.ObjectId, ref: 'Client' }],
  fileUrl: String
});

const File = model('File', fileSchema);

module.exports = File;
