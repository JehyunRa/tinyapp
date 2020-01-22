// ## intialization ##

const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
app.use(cookieParser());
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {};

function generateRandomString(n) {
  let result = '';
  for (let i = 0; i < n; i++) {
    let j = Math.floor(Math.random() * 3);
    if (j === 0) result += String.fromCharCode(Math.floor(Math.random() * Math.floor(26))+65);
    else if (j === 1) result += String.fromCharCode(Math.floor(Math.random() * Math.floor(26))+65).toLowerCase();
    else result += Math.floor(Math.random() * 9);
  }
  return result;
};

// ## Register/Login Page ##

app.get("/register", (req, res) => {
  let templateVars = {
    email: undefined
  };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = {
    email: undefined
  };
  if (req.cookies['email']) templateVars.email = req.cookies['email'];
  res.render("urls_login", templateVars);
});

// ## Register ##

app.post("/register", (req, res) => {
  let duplicate = false;
  for (const userID in users) {
    if (users[userID].email === req.body.email) duplicate = true;
  };
  // if the ID already exist in the server to prevent register
  if (duplicate === true) res.redirect('/register');
  // if email or password is empty string
  else if (req.body.email === '' || req.body.password === '') res.redirection('/register');
  else {
    let random = generateRandomString(10);
    users[random] = {
      id: random, 
      email: req.body.email, 
      password: req.body.password
    }
    console.log(users);
  
    res.cookie("email", req.body.email);
    res.redirect('/u');
  }
});

// ## Login ##

app.post("/login", (req, res) => {
  let duplicate = false;
  for (const userID in users) {
    if (users[userID].email === req.body.email) duplicate = true;
  };
  // if the ID does not exist in the server to log into
  if (duplicate === false) {
    res.redirect('/login');
  } else {

    console.log(users);
  
    res.cookie("email", req.body.email);
    res.redirect('/u');
  }
});

// ## Logout ##

app.post("/logout", (req, res) => {
  res.clearCookie('email');
  res.redirect('/login');
});

// ## CREATE ##

app.get("/u/new", (req, res) => {
  let templateVars = {
    email: undefined
  };
  if (req.cookies['email']) templateVars.email = req.cookies['email'];
  res.render("urls_new", templateVars);
});

app.post("/u", (req, res) => {
  let random = generateRandomString(6);
  //req.body.longURL === input;
  urlDatabase[random] = req.body.longURL;
  res.redirect(`/u/${random}`);
});

// ## READ ##

app.get("/u", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    email: undefined
  };
  if (req.cookies['email']) templateVars.email = req.cookies['email'];
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  // /:shortURL => shortURL === req.params.shortURL
  if (!urlDatabase[req.params.shortURL]) res.status(404).send("cannot find the website");
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    email: undefined
  };
  if (req.cookies['email']) templateVars.email = req.cookies['email'];
  res.render("urls_show", templateVars);
});

// ## UPDATE ##

app.post("/u/change/:shortURL", (req, res) => {
  urlDatabase[req.body.shortURL] = req.body.newLongURL;
  res.redirect(`/u/${req.body.shortURL}`);
});

// ## DELETE ##

app.post("/urls/delete/:shortURL", (req, res) => {
  delete urlDatabase[req.body.delete];
  res.redirect('/u');
});

// ## run server ##

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});