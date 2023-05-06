const express = require('express');
const router = express.Router();
const Book = require('../models/Book.model');
const Author = require('../models/Author.model');
const fileUpload = require('../config/cloudinary');

function requireLogin(req, res, next) {
  if (req.session.currentUser) {
    next();
  } else {
    res.redirect('/login');
  }
}

// GETS

router.get('/books', async (req, res) => {
  const booksFromDB = await Book.find().populate('author');
  try {
    res.render('books/books-list', { books: booksFromDB });
  } catch (e) {
    console.log(e);
  }
});

router.get('/books/create', requireLogin, async (req, res) => {
  const authors = await Author.find();
  res.render('books/book-create', { authors });
});

router.get('/books/:id/edit', async (req, res) => {
  const book = await Book.findById(req.params.id).populate('author');
  const authors = await Author.find();
  res.render('books/book-edit', { book, authors });
});

router.get('/books/:id', async (req, res) => {
  const books = await Book.findById(req.params.id).populate('author');

  res.render('books/book-details', books);
});

//POSTS

router.post('/books/edit', async (req, res) => {
  const { title, description, rating, author } = req.body;

  await Book.findByIdAndUpdate(req.query.id, {
    title,
    description,
    rating,
    author
  });
  res.redirect(`/books/${req.query.id}`);
});

router.post('/books/delete/:id', async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);

  res.redirect('/books');
});

router.post('/books/create', fileUpload.single('image'), async (req, res) => {
  let fileUrlOnCloudinary = '';
  req.file && (fileUrlOnCloudinary = req.file.path);

  const { title, description, rating, author } = req.body;
  await Book.create({
    title,
    description,
    rating,
    author,
    imageUrl: fileUrlOnCloudinary
  });
  res.redirect('/books');
});

router.post('/reviews/add/:id', async (req, res) => {
  const { user, comment } = req.body;
  await Book.findByIdAndUpdate(req.params.id, {
    $push: { reviews: { user, comment } }
  });
  res.redirect(`/books/${req.params.id}`);
});

module.exports = router;
