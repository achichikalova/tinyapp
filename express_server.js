const express = require("express");
const app = express(); // creating an Express app
const cookieParser = require('cookie-parser');
app.use(cookieParser()); // activate cookieParser
const PORT = 8080;
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs"); // Setting ejs as the template engine

const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};

// In memory database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "fgdr5n": {
    id: "fgdr5n",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "dhd5hg": {
    id: "dhd5hg",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

//Helper Functions
const findUserByEmail = (email, usersDb) => { //Check if user already exists
  for (let userId in usersDb) {
    const user = usersDb[userId];
    if (email === user.email) {
      return user;
    }
  }
  return false;
};

const createUser = (email, password, usersDb) => {  // Create a new user
  const userId = generateRandomString();
  usersDb[userId] = {
    id: userId,
    email,
    password
  };
  return userId;
};

const authenticateUser = (email, password, usersDb) => { // Check and retrieve the user from the userDb
  const userFound = findUserByEmail(email, usersDb);
  
  if (userFound && userFound.password === password) { // Check if password is correct
    return userFound; // Return user if password is correct
  }
  return false; // Return false if password is not correct
};

app.get("/", (req, res) => {
  res.redirect('/urls');
});


app.get('/register', (req, res) => {
  const userId = req.cookies['user_id'];
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
  res.cookie('user_id', userId);
  res.redirect('/urls');
});

app.get('/login', (req, res) => {
  const templateVars = { user: null };
  res.render('/urls_login', templateVars);
});

app.post('/login', (req, res) => {
  const {email, password} = req.body;
  const user = authenticateUser(email, password, users);
  if (user) {
    res.cookie('user_id', user.id);
    res.redirect('/urls');
  }
  res.status(403).send('Wrong credentials!');
});

app.post('/logout', (req, res) => {
  const userId = req.cookies['user_id'];
  res.clearCookie('user_id', userId);
  res.redirect('/urls');
});

app.get("/urls.json", (req, res) => {
  res.render(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
  const templateVars = { urls: urlDatabase, user: loggedInUser };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: loggedInUser };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
  const templateVars = { user: loggedInUser };
  res.render("urls_new", templateVars);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const editedURL = req.body.editedURL;
  urlDatabase[shortURL] = editedURL;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Tinyapp listening on port ${PORT}!`);
});