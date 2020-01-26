// # ========= Initialization =============
const request = require('request');

// # ======== Helper Functions ============
// Creates random string with length of 'n'
const generateRandomString = function(n) {
  let result = '';
  for (let i = 0; i < n; i++) {
    switch(Math.floor(Math.random() * 3)) {
      case 0: result += String.fromCharCode(Math.floor(Math.random() * 26) + 97); break;
      case 1: result += String.fromCharCode(Math.floor(Math.random() * 26) + 65); break;
      default: result += String.fromCharCode(Math.floor(Math.random() * 10) + 48);
    }
  }
  return result;
};

// Inside each sub-object of object 'searchIn', look for its key named 'dataType' and compare its value to 'searchItem';
// If value matching 'searchItem' exist, return the name of sub-object, else return undefined;
const findParentObjectName = function(searchIn, dataType, searchItem) {
  for (const content of Object.keys(searchIn)) {
    if (searchItem !== undefined) {
      if (searchIn[content][dataType] === searchItem) {
        return content;
      }
    }
  }
  return undefined;
};

//Modify URL input to all have http:// at the beginning;
let URLcleanse = function(url) {
  let longURL = '';
  if (url.slice(0, 8) === 'https://') longURL = `http${url.slice(5)}`;
  else if (url.slice(0, 7) !== 'http://') longURL = `http://${url}`;
  else longURL = url;
  return longURL;
}

//Used to add new URL to list for given user; makes use of findParentObjectName and generateRandomString function above;
let addURL = function(urlDb, longURLinput, cookieValue) {
  let shortURL = findParentObjectName(urlDb, 'longURL', longURLinput);
  if (shortURL === undefined) {
    shortURL = generateRandomString(6);
    urlDb[shortURL] = { longURL: longURLinput, userID: [] };
    urlDb[shortURL].userID.push(cookieValue);
  } else if (!urlDb[shortURL].userID.includes(cookieValue)) {
    urlDb[shortURL].userID.push(cookieValue);
  }
  return `/urls`;
};

//Used to delete URL from list of given user;
const deleteURL = function(arr, item) {
  for (let i = 0; i < arr.length; i++) if (arr[i] === item) arr.splice(i, 1);
};

const statusCheck = function(url, callback) {
  request(url, (error, response, body) => {
    callback(response ? response.statusCode : 0);
  });
};

module.exports = { generateRandomString, addURL, deleteURL, statusCheck, findParentObjectName, URLcleanse };
