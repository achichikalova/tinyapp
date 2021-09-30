const express = require("express");
const app = express(); // creating an Express app
const path = require("path");
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const PORT = 8080;

app.use(cookieParser()); // activate cookieParser
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs"); // Setting ejs as the template engine

app.get('/',(req, res) => {
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
	const allowedPaths = ["/", "/login"];

	if (!loggedInUser && allowedPaths.includes(path)) {
		res.redirect("/login");
	}
});

const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};

// In memory database
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "fgdr5n"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "fgdr5n"
  },
  hg6g4j: {
    longURL: "https://getbootstrap.com/",
    userID: "dhd5hg"
  },
  bhggh4: {
    longURL: "http://expressjs.com/",
    userID: "dhd5hg"
  }
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

const createUser = (email, password, usersDb, urlsDb) => {  // Create a new user
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
  res.render('urls_login', templateVars);
});

app.post('/login', (req, res) => {
  const {email, password} = req.body;
  const user = authenticateUser(email, password, users);
  if (user) {
    res.cookie('user_id', user.id);
    res.redirect('urls');
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
  const templateVars = { urls: urlDatabase, users: users, user: loggedInUser, id: userId };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
  const templateVars = { user: loggedInUser };
  if (loggedInUser) {
    res.render("urls_new", templateVars);
  }
  res.redirect("/login");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.get("/urls/:id", (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
  const templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], user: loggedInUser };
  if (loggedInUser) {
    res.render("urls_show", templateVars);
  }
  res.redirect("/login");
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  res.redirect(`/urls/${shortURL}`); //PROBLEM HERE: not redirect from edit page when submit edited url
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;
  console.log(longURL)
  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  const userId = req.cookies['user_id'];
  const loggedInUser = users[userId];
  const shortURL = req.params.id;
  if (loggedInUser) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
  res.redirect("/login");
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