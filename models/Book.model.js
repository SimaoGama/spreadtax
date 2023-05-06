const { Schema, model } = require('mongoose');

const bookSchema = new Schema(
  {
    title: String,
    description: String,
    author: { type: Schema.Types.ObjectId, ref: 'Author' },
    rating: Number,
    reviews: [{ user: String, comment: String }],
    imageUrl: String
  },
  {
    timestamps: true
  }
);

const bookModel = model('Book', bookSchema);

module.exports = bookModel;
