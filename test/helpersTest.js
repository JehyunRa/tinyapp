const { assert } = require('chai');

const { arrExtractSearch } = require('../helpers.js');

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
    const user = arrExtractSearch(testUsers, 'email', "user@example.com").subObj;
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });
});
