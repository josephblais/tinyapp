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

module.exports = { getUserByEmail, urlsForUser };