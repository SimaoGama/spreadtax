const { Schema, model } = require('mongoose');

const authorScheema = new Schema({
  name: String,
  bio: String,
  picture: String
});

const Author = model('Author', authorScheema);

module.exports = Author;
