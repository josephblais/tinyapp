const express = require('express');
const { getUserByEmail, urlsForUser } = require('./helpers');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const e = require('express');


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['1a2b3c']
}));

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
    password: bcrypt.hashSync("abcde", 10)
  }
};



app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  }
  
  const templateVars = {
    userID: req.session.user_id,
    urls: urlDatabase,
    users: users
  };
  res.render("urls_new", templateVars);
});

app.get('/urls', (req, res) => {
  const userID = req.session.user_id;
  const validURLs = urlsForUser(userID, urlDatabase);
  const templateVars = {
    userID: userID,
    urls: validURLs,
    users: users
  };
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  const shortURL = randomStr();
  const longURL = req.body.longURL;
  const userID = req.session.user_id;
  urlDatabase[shortURL] = {
    longURL,
    userID
  };
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.id;

  if (!urlDatabase[shortURL]) {
    res.status(404).redirect('url_error');
  } else {
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
  }
});

app.get('/urls/url_error', (req, res) => {
  // 👹👹👹👹👹👹👹👹👹👹
  const userID = req.session.user_id;
  res.render('url_error', userID);
});

app.get('/u/:id', (req, res) => {
  const shortURL = req.params.id;

  if (!(shortURL in urlDatabase)) {
    res.send('Invalid URL');
  } else {
    res.redirect(urlDatabase[shortURL].longURL);
  }
});

app.post('/urls/:id', (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.id;
  const validURLs = urlsForUser(userID, urlDatabase);
  console.log(req.body.newurl);

  if (validURLs[shortURL] && validURLs[shortURL].userID === userID) {
    urlDatabase[shortURL].longURL = req.body.newurl;
    res.redirect('/urls');
  } else {
    res.status(403).send("You don't have permission to edit this URL!");
  }
});

app.post('/urls/:id/editpage', (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.id;
  const validURLs = urlsForUser(userID, urlDatabase);

  if (validURLs[shortURL] && validURLs[shortURL].userID === userID) {
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(403).send("You don't have permission to edit this URL!");
  }
});

app.post('/urls/:id/delete', (req, res) => {
  const userID = req.session.user_id;
  const shortURL = req.params.id;
  const validURLs = urlsForUser(userID, urlDatabase);
  
  if (validURLs[shortURL] && validURLs[shortURL].userID === userID) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.status(403).send("You don't have permission to delete this URL!");
  }
});

  
app.get('/login', (req, res) => {
  const templateVars = {
    userID: req.session.user_id,
    users: users
  };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = getUserByEmail(email, users);
  if (!userID) {
    res.status(403).send('Email not found! Try registering instead.');
  } else if (!bcrypt.compareSync(password, users[userID].password)) {
    res.status(403).send('Invalid password!');
  }
  req.session['user_id'] = userID;
  res.redirect('/urls');
});
  
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  const templateVars = {
    userID: req.session.user_id,
    users: users
  };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (email === "") {
    res.status(400).send('Empty email. Try again!');
  } else if (password === "") {
    res.status(400).send('Invalid password. Try again!');
  } else if (getUserByEmail(email, users) !== false) {
    res.status(400).send('Email already exists. Try logging in.');
  } else {
    const userID = randomStr();
    users[userID] = {
      id: userID,
      email: email,
      password: hashedPassword
    };
    req.session['user_id'] = userID;
    res.redirect('/urls');
  }
});


app.get('/', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
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