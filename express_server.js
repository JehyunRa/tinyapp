// ## intialization ##

const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
app.use(cookieParser());
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

// ## Data ##

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: ['AAAAAAAAAA'] },
  "9sm5xK": { longURL: "http://www.google.com", userID: ['AAAAAAAAAA'] }
};

const users = {
  'AAAAAAAAAA': {
    id: 'AAAAAAAAAA', 
    email: 'admin', 
    password: 'adminpass'
  }
};

// ## Function ##

const generateRandomString = function(n) {
  let result = '';
  for (let i = 0; i < n; i++) {
    let j = Math.floor(Math.random() * 3);
    if (j === 0) result += String.fromCharCode(Math.floor(Math.random() * Math.floor(26))+65);
    else if (j === 1) result += String.fromCharCode(Math.floor(Math.random() * Math.floor(26))+65).toLowerCase();
    else result += Math.floor(Math.random() * 9);
  }
  return result;
};

const arrExtractSearch = function(container, extract, searchItem) {
  arr = [];
  exist = false;
  subObj = undefined;
  for (const content of Object.keys(container)) {
    if (searchItem !== undefined) {
      if (container[content][extract] === searchItem) {
        subObj = content;
        exist = true;
      }
    }
    arr.push(container[content][extract]);
  }
  return {arr, exist, subObj};
};

// ## Register/Login/Error Page ##

app.get("/register", (req, res) => {
  console.log('register page: users global object:');
  console.log(users);
  if (req.cookies['user_id']) res.redirect('/urls');
  else {
  let templateVars = { user_id: undefined };
  res.render("register", templateVars);
  }
});

app.get("/login", (req, res) => {
  console.log('login page: users global object:');
  console.log(users);
  if (req.cookies['user_id']) res.redirect('/urls');
  else {
  let templateVars = { user_id: undefined };
  res.render("login", templateVars);
  }
});

app.get("/error/:num", (req, res) => {
  let templateVars = {
    error: req.params.num,
    user_id: undefined
  }
  res.render("error", templateVars);
});

// ## Register ##

app.post("/register", (req, res) => {
  // if the ID already exist in the server to prevent register
  if (arrExtractSearch(users, 'email', req.body.email).exist) {
    res.redirect('/error/400');
  }
  // if email or password is empty string
  else if (req.body.email === '' || req.body.password === '') {
    res.redirect('/error/400');
  }
  else {
    let random = generateRandomString(10);
    users[random] = {
      id: random, 
      email: req.body.email, 
      password: req.body.password
    }
    res.cookie("user_id", arrExtractSearch(users, 'email', req.body.email).subObj);
    res.redirect('/urls');
  }
});

// ## Login ##

app.post("/login", (req, res) => {
  // if the ID does not exist in the server to log into
  if (!arrExtractSearch(users, 'email', req.body.email).exist) res.redirect('/error/403');
  else if (users[arrExtractSearch(users, 'email', req.body.email).subObj].password !== req.body.password) res.redirect('/error/403');
  else {
    res.cookie("user_id", arrExtractSearch(users, 'email', req.body.email).subObj);
    res.redirect('/urls');
  }
});

// ## Logout ##

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

// ## CREATE ##

app.get("/urls/new", (req, res) => {
  let templateVars = { user_id: undefined };
  if (req.cookies['user_id']) {
    templateVars.user_id = users[req.cookies['user_id']];
    res.render("urls_new", templateVars);
} else res.redirect('/login');
});

app.post("/urls", (req, res) => {
  if (req.cookies['user_id']) {
    let subObj = arrExtractSearch(urlDatabase, 'longURL', req.body.longURL).subObj;
    if (subObj === undefined) {
      let random = generateRandomString(6);
      urlDatabase[random] = { longURL: req.body.longURL, userID: [] };
      urlDatabase[random].userID.push(req.cookies['user_id']);
      res.redirect(`/urls/${random}`);
    } else if (urlDatabase[subObj].userID.includes(req.cookies['user_id'])) {
      res.redirect(`/urls/${subObj}`);
    } else {
      urlDatabase[subObj].userID.push(req.cookies['user_id']);
      res.redirect(`/urls/${subObj}`);
    }
  } else res.redirect('/login');
});

// ## READ ##

app.get("/urls", (req, res) => {
  if (req.cookies['user_id']) {
    let templateVars = {
      urls: urlDatabase,
      user_id: undefined,
    };
    templateVars.user_id = users[req.cookies['user_id']];
    res.render("urls_index", templateVars);
  } else res.redirect('/login');
});

app.get("/urls/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) res.status(404).send("cannot find the website");
  else if (req.cookies['user_id']) {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user_id: undefined
    };
    templateVars.user_id = users[req.cookies['user_id']];
    res.render("urls_show", templateVars);
} else res.redirect('/login');
});

// ## UPDATE ##

app.post("/u/change/:shortURL", (req, res) => {
  urlDatabase[req.body.shortURL].longURL = req.body.newLongURL;
  res.redirect(`/urls/${req.body.shortURL}`);
});

// ## DELETE ##

app.post("/urls/delete/:shortURL", (req, res) => {
  delete urlDatabase[req.body.delete];
  console.log('testing delete');
  console.log(urlDatabase);
  console.log(req.params.shortURL);
  res.redirect('/urls');
});

// ## run server ##

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});