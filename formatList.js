'use strict';

const fs = require('fs');

let words = fs.readFileSync('source.txt', 'utf8');

let arr = words.split('\n');

arr = arr.filter(word => {
  return word.length >= 3 && !(/[^A-z]/.test(word));
}).map(word => {
  return word.toLowerCase();
});

let set = new Set(arr);

arr = [...set];

console.log(arr.slice(-10));

let out = "var dictionary = " + JSON.stringify(arr);

fs.writeFileSync('out.js', out);
