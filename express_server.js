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
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get("/u", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/u", (req, res) => {
  let random = generateRandomString();
  //req.body.longURL === input;
  urlDatabase[random] = req.body.longURL;
  // let templateVars = { shortURL: random, longURL: req.body.longURL };
  // res.render("urls_show", templateVars);
  res.redirect(`/u/${random}`);
});

app.get("/u/new", (req, res) => {
  res.render("urls_new");
});

app.get("/u/:shortURL", (req, res) => {
  // /:shortURL => shortURL === req.params.shortURL
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
  // urlDatabase[req.params.shortURL]
  // ? res.redirect(urlDatabase[req.params.shortURL])
  // : res.send(404);
});

app.get("/u.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});