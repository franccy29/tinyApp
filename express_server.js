const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const PORT = 8080; // default port 8080

const generateRandomString = () => {
  let result           = '';
  const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * 62));
  }
  return result;
};

const emailAlreadyExist = (email) => {
  for (const userID in users) {
    if (users[userID].email === email) {
      return userID;
    }
  }
};

const allShortUrlOfAnId = (id) => {
  const allURL = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      allURL[shortURL] = urlDatabase[shortURL];
    }
  }
  return allURL;
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "user2RandomID"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  const templateVars = { urls: allShortUrlOfAnId(req.cookies["user_id"]), user: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  if (req.cookies["user_id"]) {
    const tinyURL = generateRandomString();
    urlDatabase[tinyURL] = {longURL: req.body.longURL, userID: req.cookies["user_id"]};
    res.render("urls_show", { shortURL: tinyURL, longURL: req.body.longURL, user: users[req.cookies["user_id"]] });
  } else {
    res.redirect("/login");
  }
});

app.post("/urls/:shortURL/edit", (req, res) => {
  if (req.cookies["user_id"] && req.cookies["user_id"] === urlDatabase[req.params.shortURL].userID) {
    res.redirect(`/urls/${req.params.shortURL}`);
  } else {
    res.redirect("/login");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"]) {
    const templateVars = { user: users[req.cookies["user_id"]] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.post("/urls/:shortURL", (req, res) => {
  if (req.cookies["user_id"] && req.cookies["user_id"] === urlDatabase[req.params.shortURL].userID) {
    urlDatabase[req.params.shortURL].longURL = req.body.newURL;
    const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]], urls: allShortUrlOfAnId(req.cookies["user_id"]) };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (req.cookies["user_id"] && req.cookies["user_id"] === urlDatabase[req.params.shortURL].userID) {
    const templateVars = { user: users[req.cookies["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString();
  if (email !== "" && email.includes("@") && email.includes(".") && password !== "" && !emailAlreadyExist(email)) {
    users[id] = { id, email, password };
    res.cookie("user_id", id);
    res.redirect("/urls");
  } else {
    res.status(400).send("bad information form or email already exist.");
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (emailAlreadyExist(email)) {
    const id = emailAlreadyExist(email);
    if (users[id].password === password) {
      res.cookie("user_id", id);
      res.redirect("/urls");
    } else {
      res.status(403);
    }
  } else {
    res.status(403).redirect("/register");
  }
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("login", templateVars);
});

app.listen(PORT);
console.log('Server is listening on port 8080');