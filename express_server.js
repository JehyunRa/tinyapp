// # ======= INITIALIZATION =========
// ------------- import -------------
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

const { generateRandomString, addURL, deleteURL, statusCheck, findParentObjectName } = require('./helpers');

// -------------- Data --------------
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

// # =========== GET ===============
// --- Register/Login/Error Page ---
app.get("/", (req, res) => {
  req.session.user_id ? res.redirect('/urls')
  : res.redirect('/login');
});

// -------- Register/ Page ---------
app.get("/register", (req, res) => {
  req.session.user_id ? res.redirect('/urls')
  : res.render("register", { user_id: undefined });
});

// ---------- Login Page ------------
app.get("/login", (req, res) => {
  req.session.user_id ? res.redirect('/urls')
  : res.render("login", { user_id: undefined });
});

// --- Register/Login/Error Page -----
app.get("/error/:num", (req, res) => {
  let templateVars = {
    error: req.params.num,
    user_id: undefined
  };
  if (req.session.user_id) templateVars.user_id = users[req.session.user_id];
  res.render("error", templateVars);
});

// ----------- Index Page ------------
app.get("/urls", (req, res) => {
  req.session.user_id ? res.render("urls_index",
    { urls: urlDatabase,
      user_id: users[req.session.user_id] })
  : res.redirect('/login');
});

// ------------ New Page -------------
app.get("/urls/new", (req, res) => {
  req.session.user_id ? res.render("urls_new", { user_id: users[req.session.user_id] })
  : res.redirect('/login');
});

// ----------- Edit Page ------------
app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) res.redirect('/login');
  else {
  !urlDatabase[req.params.shortURL] ? res.status(404).send("cannot find the website")
  : req.session.user_id ? res.render("urls_show",
    { shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user_id: users[req.session.user_id] })
  : res.redirect('/login');
  }
});

// -------------- Link ---------------
app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL].longURL);
});

// # =========== POST ==============
// --------- Login Process ---------
app.post("/login", (req, res) => {
  let parentObjectName = findParentObjectName(users, 'email', req.body.email);
  if (parentObjectName === undefined) res.redirect('/error/403');
  else if (!bcrypt.compareSync(req.body.password, users[parentObjectName].password)) res.redirect('/error/403');
  else if (req.session.user_id = parentObjectName) res.redirect('/urls');
});

// -------- Logout Process ---------
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// ----- Registration Process ------
app.post("/register", (req, res) => {
  let parentObjectName = findParentObjectName(users, 'email', req.body.email);
  if (parentObjectName !== undefined) res.redirect('/error/400');
  else if (req.body.email === '' || req.body.password === '') res.redirect('/error/400');
  else {
    let random = generateRandomString(10);
    users[random] =
    { id: random,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)};
    req.session.user_id = random;
    res.redirect('/urls');
  }
});

// ------- Add URL Process ---------
app.post("/urls", (req, res) => {
  if (!req.session.user_id) res.redirect('/login');
  else {
    let longURL = '';
    if (req.body.longURL.slice(0, 7) !== 'http://') longURL = `http://${req.body.longURL}`;
    else longURL = req.body.longURL;
    statusCheck(longURL, status => {
      if (status === 200) {
        if (req.session.user_id) res.redirect(addURL(urlDatabase, longURL, req.session.user_id));
        else res.redirect('/login');
      } else res.redirect(`/error/${status}`);
    });
  };
});

// ------ Delete URL Process -------

app.post("/urls/delete/:shortURL", (req, res) => {
  if (!req.session.user_id) res.redirect('/login');
  else deleteURL(urlDatabase[req.body.delete].userID, req.session.user_id);
  res.redirect('/urls');
});
// ------ Update URL Process -------

app.post("/u/change/:shortURL", (req, res) => {
  if (!req.session.user_id) res.redirect('/login');
  if (req.body.longURL.slice(0, 7) !== 'http://') req.body.longURL = 'http://' + req.body.longURL;
  statusCheck(req.body.longURL, status => {
    if (status === 200) {
      if (req.session.user_id) {
        deleteURL(urlDatabase[req.params.shortURL].userID, req.session.user_id);
        res.redirect(addURL(urlDatabase, req.body.longURL, req.session.user_id));
      } else res.redirect('/login');
    } else res.redirect(`/error/${status}`);
  });
});

// # =========== OTHER ==============
// ------- Admin Check Data ---------
app.post("/check", (req, res) => {
  console.log('--------------------');
  console.log(users);
  console.log(urlDatabase);
  console.log('--------------------');
  res.redirect('back');
});

// ---------- run server ------------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
