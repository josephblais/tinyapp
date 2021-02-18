const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('view engine', 'ejs');

// eslint-disable-next-line func-names
const randomStr = function generateRandomString() {
  // from https://attacomsian.com/blog/javascript-generate-random-string
  return Math.random().toString(16).substr(2, 6);
};

const urlDatabase = {
  "b2xVn2": {longURL:"http://www.lighthouselabs.ca", userID: "abcde"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "v2rbv"}
};

const users = {
  abcde: {
    id: "abcde",
    email: "good@bye.com",
    password: "abcde"
  }
};

const emailLookup = (email, userDB) => {
  for (let user in userDB) {
    if (userDB[user].email === email) {
      return user;
    }
  }
  return false;
};

const urlsForUser = (id, database) => {
  let userURLs = {};
  for (let url in database) {
    // console.log(`🥵${database[url].userID}`);
    if (database[url].userID === id) {
      userURLs[url] = database[url];
    }
  }
  console.log(`🥶${userURLs}`);
  return userURLs;
};

app.get("/urls/new", (req, res) => {
  if (!req.cookies.user_id) {
    res.redirect('/login');
  }
  
  const templateVars = {
    userID: req.cookies.user_id,
    urls: urlDatabase,
    users: users
  };
  res.render("urls_new", templateVars);
});

app.get('/urls', (req, res) => {
  const userID = req.cookies.user_id;
  const validURLs = urlsForUser(userID, urlDatabase);
  console.log(`Valid URLS: ${validURLs}`);
  const templateVars = {
    userID: userID,
    urls: validURLs,
    users: users
  };
  console.log(urlDatabase);
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = randomStr();
  const longURL = req.body.longURL;
  const userID = req.cookies.user_id;
  urlDatabase[shortURL] = {
    longURL,
    userID
  };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:id", (req, res) => {
  const userID = req.cookies.user_id;
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;
  const validURLs = urlsForUser(userID, urlDatabase);
  const templateVars = {
    userID: userID,
    users: users,
    shortURL: shortURL,
    longURL: longURL,
    validURLs: validURLs
  };
  res.render("urls_show", templateVars);
});

app.get('/u/:id', (req, res) => {
  const shortURL = req.params.id;
  if (!(shortURL in urlDatabase)) {
    res.send('Invalid URL');
  } else {
    res.redirect(urlDatabase[shortURL]);
  }
});

app.post('/urls/:id/edit', (req, res) => {
  const userID = req.cookies.user_id;
  const shortURL = req.params.id;
  const validURLs = urlsForUser(userID, urlDatabase);

  if (validURLs[userID]) {
    urlDatabase[shortURL] = req.body.newurl;
    res.redirect('/urls');
  } else {
    res.status(403).send("You don't have permission to edit this URL!");
  }
});

app.post('/urls/:id/editpage', (req, res) => {
  const shortURL = req.params.id;
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:id/delete', (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});
  
app.get('/login', (req, res) => {
  const templateVars = {
    userID: req.cookies.user_id,
    users: users
  };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = emailLookup(email, users);
  if (userID === false) {
    res.status(403).send('Email not found! Try registering instead.');
  } else if (users[userID].password !== password) {
    res.status(403).send('Invalid password!');
  }
  res.cookie('user_id', userID);
  res.redirect('/urls');
});
  
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  const templateVars = {
    userID: req.cookies.user_id,
    users: users
  };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email === "") {
    res.status(400).send('Empty email. Try again!');
  } else if (password === "") {
    res.status(400).send('Invalid password. Try again!');
  } else if (emailLookup(email, users) !== false) {
    res.status(400).send('Email already exists. Try logging in.');
  } else {
    const userID = randomStr();
    users[userID] = {
      id: userID,
      email: email,
      password: password
    };
    console.log(users);
    res.cookie('user_id', userID);
    res.redirect('/urls');
  }
});


app.get('/', (req, res) => {
  res.send('Hello!!!!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});