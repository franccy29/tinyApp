const emailAlreadyExist = (email, database) => {
  for (const userID in database) {
    if (database[userID].email === email) {
      return userID;
    }
  }
  return undefined;
};

const allShortUrlOfAnId = (id, database) => {
  const allURL = {};
  for (const shortURL in database) {
    if (database[shortURL].userID === id) {
      allURL[shortURL] = database[shortURL];
    }
  }
  return allURL;
};

const generateRandomString = () => {
  let result           = '';
  const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 5; i++) {
    result += characters.charAt(Math.floor(Math.random() * 62));
  }
  return result;
};

const getDate = () => {
  const today = new Date();
  const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  const dateTime = date + ' ' + time;
  return dateTime;
};

module.exports = {
  emailAlreadyExist,
  allShortUrlOfAnId,
  generateRandomString,
  getDate};