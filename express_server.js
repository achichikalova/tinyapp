const { findUserByEmail, createUser, authenticateUser } = require('./helpers');
const express = require('express');
const app = express(); // creating an Express app
const path = require('path');
const cookieParser = require("cookie-parser");
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const PORT = 8080;

app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['hello from the other side', 'cool thing we are doing']
}));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs'); // Setting ejs as the template engine

app.get('/', (req, res) => {
  const userId = req.session.user_id;
  const loggedInUser = users[userId];
	const allowedPaths = ['/', '/login'];

	if (!loggedInUser && allowedPaths.includes(path)) {
		res.redirect('/login');
	} else {
    res.redirect('/urls');
  }
});

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

// app.get('/register', (req, res) => {
//   const userId = req.session.user_id;
//   const loggedInUser = users[userId];
//   const templateVars = { user: loggedInUser };
//   res.render('urls_register', templateVars);
// });

// app.post('/register', (req, res) => {
//   const {email, password} = req.body;
//   const userFound = findUserByEmail(email, users); //use helper function to check if user already exists
//   if (email.length === 0 | password.length === 0) {
//     res.status(400).send('Please enter your credentials.');
//   }
//   if (userFound) {
//     res.status(401).send('Sorry, that user already exists!');
//     return;
//   }
//   const userId = createUser(email, password, users); //use helper function to create a new user in usersDb and get the id
//   req.session.user_id = user.id;
//   res.redirect('/urls');

// });

app.get('/login', (req, res) => {
  const templateVars = { user: null };
  res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {
  const {email, password} = req.body;
  const user = authenticateUser(email, password, users);
  if (!user) {
    return res.status(403).send('Wrong credentials!');
  }
  req.session.user_id = user.id;
  return res.redirect('urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

const extractUrlsForUser = (db, id) => {
  let new_db = {};
  // console.log(db)
  for (let key in db) {
    if (db[key].userID === id) {
      new_db[key] = {
        longURL: db[key].longURL
      };
    }
  }
  return new_db;
}

app.get('/urls', (req, res) => {
  const userId = req.session.user_id;
  const loggedInUser = users[userId];
  // console.log(urlDatabase)
  const user_urls = extractUrlsForUser(urlDatabase, userId);
  const templateVars = { urls: user_urls, user: loggedInUser, id: userId };
  res.render('urls_index', templateVars);
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const userId = req.session.user_id; 
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL: longURL, userID: userId };
  res.redirect('/urls');
});

// app.get('/urls/new', (req, res) => {
//   const userId = req.session.user_id;
//   const loggedInUser = users[userId];
//   const templateVars = { user: loggedInUser };
//   if (!loggedInUser) {
//     res.redirect('/login');
//     return;
//   }  
//   res.render('urls_new', templateVars);
// });

app.get('/urls/:id', (req, res) => {
  const userId = req.session.user_id;
  const loggedInUser = users[userId];
  const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], user: loggedInUser };
  if (!loggedInUser) {
    res.redirect('/login');
    return;
  }
  return res.render('urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
  console.log("edit")
  const shortURL = req.params.id;
  const urlContent = req.body.urlContent;
  console.log(shortURL, urlContent);
  urlDatabase[shortURL].longURL = urlContent;
  res.redirect('/urls');
});

// app.get('/u/:id', (req, res) => {
//   const shortURL = req.params.id;
//   const longURL = urlDatabase[shortURL].longURL;
//   console.log(longURL)
//   res.redirect(longURL);
// });

app.post('/urls/:id/delete', (req, res) => {
  const userId = req.session.user_id;
  const loggedInUser = users[userId];
  const shortURL = req.params.id;
  if (loggedInUser) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  }
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});