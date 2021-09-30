const { assert } = require('chai');

const { emailAlreadyExist } = require('../helper.js');

const testUsers = {
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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = emailAlreadyExist("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert(expectedOutput === user, "the test pass");
  });
  it('should return undefined if user email doesnt exist', function() {
    const user1 = emailAlreadyExist("fasdf@example.com", testUsers);
    const expectedOutput1 = undefined;
    assert(user1 === expectedOutput1, "the test pass");
  });
});