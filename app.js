const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const ejs = require('ejs');
const session = require('express-session');
const db = require('./config/db');

// Define the route prefix
const routePrefix = '/app205';

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const databaseRouter = require('./routes/database');
const loginRouter = require('./routes/login');
const logoutRouter = require('./routes/logout');
const registerRouter = require('./routes/register');
const contactRouter = require('./routes/contact');
const messagesRouter = require('./routes/messages');
const animalsCrudRouter = require('./routes/animals');
const adminRouter = require('./routes/admin');

const app = express();

// Session setup
app.use(session({
  secret: 'your-secret-key', // Replace with a real secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', ejs.renderFile);
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Make user info and routePrefix available in all templates
app.use(async (req, res, next) => {
  res.locals.userId = req.session.userId;
  res.locals.userName = req.session.userName;
  res.locals.isAdmin = req.session.isAdmin;
  res.locals.routePrefix = routePrefix; // Make routePrefix available

  if (req.session.userId) {
    try {
      const [users] = await db.query('SELECT email FROM users WHERE id = ?', [req.session.userId]);
      if (users.length > 0) {
        res.locals.userEmail = users[0].email;
      }
    } catch (err) {
      console.error('Error fetching user email for res.locals:', err);
      res.locals.userEmail = '';
    }
  } else {
    res.locals.userEmail = '';
  }
  next();
});

// Mount all routers under the routePrefix
app.use(routePrefix + '/', indexRouter);
app.use(routePrefix + '/users', usersRouter);
app.use(routePrefix + '/database', databaseRouter);
app.use(routePrefix + '/login', loginRouter);
app.use(routePrefix + '/logout', logoutRouter);
app.use(routePrefix + '/register', registerRouter);
app.use(routePrefix + '/contact', contactRouter);
app.use(routePrefix + '/messages', messagesRouter);
app.use(routePrefix + '/animals-crud', animalsCrudRouter);
app.use(routePrefix + '/admin', adminRouter);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
