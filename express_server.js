const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const cookieSession = require('cookie-session');
const {emailAlreadyExist, allShortUrlOfAnId, generateRandomString} = require("./helper");
const methodOverride = require('method-override');

const PORT = 8080; // default port 8080
const app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ["Some way to encrypt the values", "$!~`yEs123bla!!%"]
}));
app.use(methodOverride('_method'));


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "user2RandomID",
    visited: 0,
    uniqueViewer: []
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID",
    visited: 0,
    uniqueViewer: []
  }
};

const hashedPassword1 = bcrypt.hashSync("purple-monkey-dinosaur", salt);
const hashedPassword2 = bcrypt.hashSync("dishwasher-funk", salt);

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: hashedPassword1
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: hashedPassword2
  }
};

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  urlDatabase[req.params.shortURL].visited += 1;
  if (!urlDatabase[req.params.shortURL].uniqueViewer.includes(req.session.userId)) {
    urlDatabase[req.params.shortURL].uniqueViewer.push(req.session.userId);
  }
  res.redirect(longURL);
});

app.delete("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  const templateVars = { urls: allShortUrlOfAnId(req.session.userId, urlDatabase), user: users[req.session.userId] };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  if (req.session.userId) {
    const tinyURL = generateRandomString();
    urlDatabase[tinyURL] = {longURL: req.body.longURL, userID: req.session.userId, visited: 0, uniqueViewer: []};
    res.render("urls_show", { shortURL: tinyURL, longURL: req.body.longURL, user: users[req.session.userId] });
  } else {
    res.redirect("/login");
  }
});

app.put("/urls/:shortURL/edit", (req, res) => {
  if (req.session.userId && req.session.userId === urlDatabase[req.params.shortURL].userID) {
    res.redirect(`/urls/${req.params.shortURL}`);
  } else {
    res.redirect("/login");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("session");
  res.clearCookie("session.sig");
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  if (req.session.userId) {
    const templateVars = { user: users[req.session.userId] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.post("/urls/:shortURL", (req, res) => {
  if (req.session.userId && req.session.userId === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL].longURL = req.body.newURL;
    const templateVars = { urls: allShortUrlOfAnId(req.session.userId, urlDatabase), user: users[req.session.userId] };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  const templateVars = { user: users[req.session.userId], urls: allShortUrlOfAnId(req.session.userId, urlDatabase) };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (req.session.userId && req.session.userId === urlDatabase[req.params.shortURL].userID) {
    const templateVars = { user: users[req.session.userId], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.userId] };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString();
  if (email !== "" && email.includes("@") && email.includes(".") && password !== "" && !emailAlreadyExist(email, users)) {
    const hashedPassword = bcrypt.hashSync(password, salt);
    users[id] = { id, email, password: hashedPassword };
    req.session.userId = id;
    res.redirect("/urls");
  } else {
    res.status(400).send("bad information form or email already exist.");
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (emailAlreadyExist(email, users)) {
    const id = emailAlreadyExist(email, users);
    if (bcrypt.compareSync(password, users[id].password)) {
      req.session.userId = id;
      res.redirect("/urls");
    } else {
      res.status(403);
    }
  } else {
    res.status(403).redirect("/register");
  }
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.userId] };
  res.render("login", templateVars);
});

app.listen(PORT);
console.log('Server is listening on port 8080');