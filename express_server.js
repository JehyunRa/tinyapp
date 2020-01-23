// ## intialization ##

const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({ 
  name: 'session',
  keys: ['key1', 'key2']
}));
app.set("view engine", "ejs");
const PORT = 8080;

const { generateRandomString, arrExtractSearch, addURL, deleteURL, fetchIP } = require('./helpers');

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
  },
  'BBBBBBBBBB': {
    id: 'BBBBBBBBBB', 
    email: 'user1@gmail.com', 
    password: bcrypt.hashSync('user1pass', 10)
  }
};

// ## Register/Login/Error Page ##

app.get("/", (req, res) => {
  if (req.session.user_id) res.redirect('/urls');
  else res.redirect('/login');
});

app.get("/register", (req, res) => {
  if (req.session.user_id) res.redirect('/urls');
  let templateVars = { user_id: undefined };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  if (req.session.user_id) res.redirect('/urls');
  let templateVars = { user_id: undefined };
  res.render("login", templateVars);
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
  if (req.body.longURL.slice(0, 7) !== 'http://') req.body.longURL = 'http://' + req.body.longURL;
  fetchIP(req.body.longURL, status => {
    if (status === 200) {
      if (req.session.user_id) res.redirect(addURL(urlDatabase, req.body.longURL, req.session.user_id));
      else res.redirect('/login');
    } else res.redirect(`/error/${status}`);
  })
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
  if (req.body.longURL.slice(0, 7) !== 'http://') req.body.longURL = 'http://' + req.body.longURL;
  fetchIP(req.body.longURL, status => {
    if (status === 200) {
      if (req.session.user_id) {
        deleteURL(urlDatabase[req.params.shortURL].userID, req.session.user_id);
        res.redirect(addURL(urlDatabase, req.body.longURL, req.session.user_id));
      } else res.redirect('/login');
    } else res.redirect(`/error/${status}`);
  })
});

// ## DELETE ##

app.post("/urls/delete/:shortURL", (req, res) => {
  deleteURL(urlDatabase[req.body.delete].userID, req.session.user_id);
  res.redirect('/urls');
});

// ## other ##

app.post("/check", (req, res) => {
  console.log('--------------------');
  console.log(users);
  console.log(urlDatabase);
  console.log('--------------------');
  res.redirect('back');
});

// ## run server ##

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
