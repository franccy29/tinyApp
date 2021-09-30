const emailAlreadyExist = (email, database) => {
  for (const userID in database) {
    if (database[userID].email === email) {
      return userID;
    }
  }
  return undefined;
};

module.exports = {emailAlreadyExist};