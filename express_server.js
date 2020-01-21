// ## intialization ##

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  let result = '';
  for (let i = 0; i < 6; i++) {
    let j = Math.floor(Math.random() * 3);
    if (j === 0) result += String.fromCharCode(Math.floor(Math.random() * Math.floor(26))+65);
    else if (j === 1) result += String.fromCharCode(Math.floor(Math.random() * Math.floor(26))+65).toLowerCase();
    else result += Math.floor(Math.random() * 9);
  }
  return result;
};

// ## testing pages ##

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

// ## CREATE ##

app.get("/u/new", (req, res) => {
  res.render("urls_new");
});

app.post("/u", (req, res) => {
  let random = generateRandomString();
  //req.body.longURL === input;
  urlDatabase[random] = req.body.longURL;
  res.redirect(`/u/${random}`);
});

// ## READ ##

app.get("/u", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  // /:shortURL => shortURL === req.params.shortURL
  if (!urlDatabase[req.params.shortURL]) res.status(404).send("cannot find the website");
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
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