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

// For each sub-object of object 'container', look for its key named 'extract' and get value from it:
// 1. push these values in an array
// 2. if 'searchItem' optional input exist, check if any of the values match the searchItem and return true if match exists;
// 3. if match exists from above, return name of the sub-object where 'extract: searchItem' key-value pair was found
// return 1, 2, 3 in an object as following: {arr: 1, exist: 2, subObj: 3}
const arrExtractSearch = function(container, extract, searchItem) {
  let arr = [];
  let exist = false;
  let subObj = undefined;
  for (const content of Object.keys(container)) {
    if (searchItem !== undefined) {
      if (container[content][extract] === searchItem) {
        subObj = content;
        exist = true;
      }
    }
    arr.push(container[content][extract]);
  }
  return {arr, exist, subObj};
};

//Used to add new URL to list for given user; makes use of arrExtractSearch and generateRandomString function above;
let addURL = function(urlDb, longURLinput, cookieVal) {
  let subObj = arrExtractSearch(urlDb, 'longURL', longURLinput).subObj;
  if (subObj === undefined) {
    subObj = generateRandomString(6);
    urlDb[subObj] = { longURL: longURLinput, userID: [] };
    urlDb[subObj].userID.push(cookieVal);
  } else if (!urlDb[subObj].userID.includes(cookieVal)) {
    urlDb[subObj].userID.push(cookieVal);
  }
  return `/urls/${subObj}`;
};

//Used to delete URL from list of given user;
const deleteURL = function(arr, item) {
  for (let i = 0; i < arr.length; i++) if (arr[i] === item) arr.splice(i, 1);
};

const statusCheck = function(url, callback) {
  console.log('entering fetch ip');
  request(url, (error, response, body) => {
    callback(response ? response.statusCode : 0);
  });
};

module.exports = { generateRandomString, arrExtractSearch, addURL, deleteURL, statusCheck };
