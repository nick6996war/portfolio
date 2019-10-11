
let fs = require('fs')
let str = fs.readFileSync('1234.txt', "utf-8")
str = str.replace(/\r\n    /g,'')
fs.writeFileSync('1234.txt',str)