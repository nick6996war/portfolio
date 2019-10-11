const fs = require('fs')
let arr = {}
arr = JSON.parse(fs.readFileSync('data.json', "utf-8"))
//let arrKey = Object.keys(str)
for (var key in arr) {
	//console.log(arr[key])
	if (!arr[key] || arr[key] == '') {
        delete arr[key]
        //console.log(key)
	}
}
let upload = JSON.stringify(arr)
fs.writeFileSync('dataClean.json',upload)