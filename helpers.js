const getUserByEmail = (email, userDB) => {
  for (let user in userDB) {
    if (userDB[user].email === email) {
      return user;
    }
  }
  return false;
};

const urlsForUser = (id, database) => {
  let userURLs = {};
  // console.log(database);
  for (let url in database) {
    if (database[url].userID === id) {
      userURLs[url] = database[url];
    }
  }
  return userURLs;
};

const randomStr = () => {
  // from https://attacomsian.com/blog/javascript-generate-random-string
  return Math.random().toString(16).substr(2, 6);
};

module.exports = { getUserByEmail, urlsForUser, randomStr };