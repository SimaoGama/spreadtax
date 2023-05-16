// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require('dotenv').config();

// ℹ️ Connects to the database
require('./db');

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require('express');

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require('hbs');

// Added helpers because I want to use
// the #eq helper
const helpers = require('handlebars-helpers');
hbs.registerHelper(helpers());

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require('./config')(app);

const session = require('express-session');
const mongoStore = require('connect-mongo');

app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET, // env secret
    cookie: {
      sameSite: true, // fe and be are running on localhosst:3000 on react its false
      httpOnly: true, //we are not using https
      maxAge: 600000 // in milliseconds = time of the session (60sec/1min)
    },
    rolling: true,
    store: new mongoStore({
      mongoUrl: process.env.MONGODB_URI,
      ttl: 60 * 60 * 24 // time to leave = 1 day
    })
  })
);

//middleware to get the current logged user
function getCurrentLoggedUser(req, res, next) {
  if (req.session && req.session.currentUser) {
    app.locals.currentUser = req.session.currentUser;
  } else {
    app.locals.currentUser = '';
  }
  next();
}

function loading(req, res, next) {
  res.render('transition');
  next();
}

const bodyParser = require('body-parser');
//use the middleware
app.use(getCurrentLoggedUser);
// parse form data
app.use(bodyParser.urlencoded({ extended: false }));

// default value for title local
const capitalize = require('./utils/capitalize');
const projectName = 'Spreadtax';

app.locals.appTitle = `${capitalize(projectName)}`;

// 👇 Start handling routes here
const indexRoutes = require('./routes/index.routes');
app.use('/', indexRoutes);

const booksRoutes = require('./routes/book.routes');
app.use('/', booksRoutes);

const authRoutes = require('./routes/auth.routes');
app.use('/', authRoutes);

const clientRoutes = require('./routes/client.routes');
app.use('/', clientRoutes);

const userRoutes = require('./routes/user.routes');
app.use('/', userRoutes);

const fileRoutes = require('./routes/file.routes');
app.use('/', fileRoutes);

hbs.registerPartials(__dirname + '/views/partials');

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require('./error-handling')(app);

module.exports = app;
