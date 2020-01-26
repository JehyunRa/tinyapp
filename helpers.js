// # ========= Initialization =============
const request = require('request');

// # ======== Helper Functions ============
// Creates random string with length of 'n'
const generateRandomString = function(n) {
  let result = '';
  for (let i = 0; i < n; i++) {
    let j = Math.floor(Math.random() * 3);
    if (j === 0) result += String.fromCharCode(Math.floor(Math.random() * Math.floor(26))+65);
    else if (j === 1) result += String.fromCharCode(Math.floor(Math.random() * Math.floor(26))+65).toLowerCase();
    else result += Math.floor(Math.random() * 9);
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

//Used to add new URL to list for given user; makes use of arrExtractSearch and generateRandomString function above;
let addURL = function(urlDb, longURLinput, cookieVal) {
  let subObj = findParentObjectName(urlDb, 'longURL', longURLinput);
  if (subObj === undefined) {
    subObj = generateRandomString(6);
    urlDb[subObj] = { longURL: longURLinput, userID: [] };
    urlDb[subObj].userID.push(cookieVal);
  } else if (!urlDb[subObj].userID.includes(cookieVal)) {
    urlDb[subObj].userID.push(cookieVal);
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

module.exports = { generateRandomString, addURL, deleteURL, statusCheck, findParentObjectName };
