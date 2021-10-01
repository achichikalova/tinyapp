const { findUserByEmail, createUser, authenticateUser, extractUrlsForUser } = require('./helpers');
const express = require('express');
const app = express(); // creating an Express app
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const PORT = 8080;

app.use(cookieSession({
  name: 'session',
  keys: ['hello from the other side', 'cool thing we are doing']
}));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs'); // Setting ejs as the template engine

const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};

// In memory database
const urlDatabase = {
  b6UTxQ: {
    longURL: 'https://www.tsn.ca',
    userID: 'fgdr5n'
  },
  i3BoGr: {
    longURL: 'https://www.google.ca',
    userID: 'fgdr5n'
  },
  hg6g4j: {
    longURL: 'https://getbootstrap.com/',
    userID: 'dhd5hg'
  },
  bhggh4: {
    longURL: 'http://expressjs.com/',
    userID: 'dhd5hg'
  }
};
//Hashed password for exist users
const hashedPassword1 = bcrypt.hashSync('purple-monkey-dinosaur', 10);
const hashedPassword2 = bcrypt.hashSync('dishwasher-funk', 10);

const users = {
  'fgdr5n': {
    id: 'fgdr5n',
    email: 'user@example.com',
    password: hashedPassword1
  },
  'dhd5hg': {
    id: 'dhd5hg',
    email: 'user2@example.com',
    password: hashedPassword2
  }
};

app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  const userId = req.session.userId;
  const loggedInUser = users[userId];
  const templateVars = { user: loggedInUser };
  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  const {email, password} = req.body;
  const userFound = findUserByEmail(email, users); //use helper function to check if user already exists
  if (email.length === 0 | password.length === 0) {
    res.status(400).send('Please enter your credentials.');
  }
  if (userFound) {
    res.status(401).send('Sorry, that user already exists!');
    return;
  }
  const userId = createUser(email, password, users); //use helper function to create a new user in usersDb and get the id
  req.session.userId = userId;
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const templateVars = { user: null };
  res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {
  const {email, password} = req.body;
  const user = authenticateUser(email, password, users); //use helper function to check users credentials
  if (!user) {
    return res.status(403).send('Wrong credentials!');
  }
  req.session.userId = user.id;
  return res.redirect('urls');
});

app.post('/logout', (req, res) => {
  req.session = null; //clear cookies
  res.redirect('/urls');
});

app.get('/urls', (req, res) => {
  const userId = req.session.userId;
  const loggedInUser = users[userId];
  const userUrls = extractUrlsForUser(urlDatabase, userId); //use helper function to retrieve data for current user
  const templateVars = { urls: userUrls, user: loggedInUser, id: userId };
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const userId = req.session.userId;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL: longURL, userID: userId };
  res.redirect('/urls');
});

app.get('/urls/new', (req, res) => {
  const userId = req.session.userId;
  const loggedInUser = users[userId];
  const templateVars = { user: loggedInUser };
  if (!loggedInUser) {
    return res.redirect('/login');
  }
  return res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const userId = req.session.userId;
  const loggedInUser = users[userId];
  const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], user: loggedInUser };
  if (!loggedInUser) {
    return res.redirect('/login');
  }
  return res.render('urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const urlContent = req.body.urlContent;
  urlDatabase[shortURL].longURL = urlContent;
  res.redirect('/urls');
});

app.get('/u/:id', (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.post('/urls/:id/delete', (req, res) => {
  const userId = req.session.userId;
  const loggedInUser = users[userId];
  const shortURL = req.params.id;
  if (!loggedInUser) {
    return res.redirect('/login');
  }
  delete urlDatabase[shortURL];
  return res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}!`);
});