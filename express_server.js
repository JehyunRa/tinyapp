// ## intialization ##

const express = require("express");
const app = express();
const cookieSession = require('cookie-session')
app.use(cookieSession({ 
  name: 'session',
  keys: ['key1', 'key2']
}));
const bcrypt = require('bcrypt');
const PORT = 8080;

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
    password: bcrypt.hashSync('adminpass', 10)
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

let addURL = function(longURLinput, cookieVal) {
  let subObj = arrExtractSearch(urlDatabase, 'longURL', longURLinput).subObj;
  if (subObj === undefined) {
    subObj = generateRandomString(6);
    urlDatabase[subObj] = { longURL: longURLinput, userID: [] };
    urlDatabase[subObj].userID.push(cookieVal);
  } else if (!urlDatabase[subObj].userID.includes(cookieVal)) {
    urlDatabase[subObj].userID.push(cookieVal);
  }
  return `/urls/${subObj}`;
};

const deleteURL = function(arr, item) {
  for (let i = 0; i < arr.length; i++) if (arr[i] === item) arr.splice(i, 1);
};

// ## Register/Login/Error Page ##

app.get("/", (req, res) => {
  if (req.session.user_id) res.redirect('/urls');
  else res.redirect('/login');
});

app.get("/register", (req, res) => {
  console.log('register page: users global object:');
  console.log(users);
  if (req.session.user_id) res.redirect('/urls');
  else {
  let templateVars = { user_id: undefined };
  res.render("register", templateVars);
  }
});

app.get("/login", (req, res) => {
  console.log('login page: users global object:');
  console.log(users);
  if (req.session.user_id) res.redirect('/urls');
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
  if (arrExtractSearch(users, 'email', req.body.email).exist) {
    res.redirect('/error/400');
  }
  else if (req.body.email === '' || req.body.password === '') {
    res.redirect('/error/400');
  }
  else {
    let random = generateRandomString(10);
    users[random] = {
      id: random, 
      email: req.body.email, 
      password: bcrypt.hashSync(req.body.password, 10)
    }
    req.session.user_id = arrExtractSearch(users, 'email', req.body.email).subObj;
    res.redirect('/urls');
  }
});

// ## Login ##

app.post("/login", (req, res) => {
  if (!arrExtractSearch(users, 'email', req.body.email).exist) res.redirect('/error/403');
  else if (!bcrypt.compareSync(req.body.password, users[arrExtractSearch(users, 'email', req.body.email).subObj].password)) res.redirect('/error/403');
  else {
    req.session.user_id = arrExtractSearch(users, 'email', req.body.email).subObj;
    res.redirect('/urls');
  }
});

// ## Logout ##

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// ## CREATE ##

app.get("/urls/new", (req, res) => {
  let templateVars = { user_id: undefined };
  if (req.session.user_id) {
    templateVars.user_id = users[req.session.user_id];
    res.render("urls_new", templateVars);
} else res.redirect('/login');
});

app.post("/urls", (req, res) => {
  if (req.session.user_id) res.redirect(addURL(req.body.longURL, req.session.user_id));
  else res.redirect('/login');
});

// ## READ ##

app.get("/urls", (req, res) => {

  if (req.session.user_id) {
    let templateVars = {
      urls: urlDatabase,
      user_id: undefined,
    };
    templateVars.user_id = users[req.session.user_id];
    res.render("urls_index", templateVars);
  } else res.redirect('/login');
});

app.get("/urls/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) res.status(404).send("cannot find the website");
  else if (req.session.user_id) {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user_id: undefined
    };
    templateVars.user_id = users[req.session.user_id];
    res.render("urls_show", templateVars);
} else res.redirect('/login');
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

// ## UPDATE ##

app.post("/u/change/:shortURL", (req, res) => {
  if (req.session.user_id) {
    deleteURL(urlDatabase[req.body.shortURL].userID, req.session.user_id);
    res.redirect(addURL(req.body.longURL, req.session.user_id));
  } else res.redirect('/login');
});

// ## DELETE ##

app.post("/urls/delete/:shortURL", (req, res) => {
  deleteURL(urlDatabase[req.body.delete].userID, req.session.user_id);
  res.redirect('/urls');
});

// ## run server ##

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});