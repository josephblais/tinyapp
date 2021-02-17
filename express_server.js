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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  abcde: {
    id: "abcde",
    email: "good@bye.com",
    password: "abcde"
  }
};

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get('/urls', (req, res) => {
  const templateVars = {
    userID: req.cookies.user_id,
    urls: urlDatabase,
    users: users
  };
  res.render('urls_index', templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
  const shortURL = randomStr();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const templateVars = {
    userID: req.cookies.user_id,
    users: users,
    shortURL: shortURL,
    longURL: urlDatabase[shortURL]
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
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.newurl;
  res.redirect('/urls');
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

// app.post('/login', (req, res) => {
  //   const username = req.body.username;
  //   res.cookie('username', username);
  //   res.redirect('/urls');
  // });
  
app.get('/login', (req, res) => {
  const templateVars = {
    userID: req.cookies.user_id,
  };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = emailLookup(email, users);
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
  };
  res.render('register', templateVars);
});

const emailExists = (email, userDB) => {
  for (let user in userDB) {
    if (userDB[user].email === email) {
      return true;
    }
  }
  return false;
};

const emailLookup = (email, userDB) => {
  for (let user in userDB) {
    if (userDB[user].email === email) {
      return user;
    }
  }
};

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (email === "" || password === "") {
    res.status(400).send('invalid email or password. Try again!');
  } else if (emailExists(email, users)) {
    res.status(400).send('email already exists. Try logging in.');
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