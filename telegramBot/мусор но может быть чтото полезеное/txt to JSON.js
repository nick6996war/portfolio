let fs = require('fs')
let str = fs.readFileSync('123.txt', "utf-8")

// str = str.replace(/\r\n    /g,'')
// fs.writeFileSync('123.txt',str)

let lastObj={}
let array = str.split("|||")
let arrKey = []
let arrAnswer = []
let y = 0
let z = 0
for (let i = 0; i < array.length; i++) {
    if (i % 2 == 0) {
        arrKey.push(array[i])
    } else {
        arrAnswer.push(array[i])
    }
}


console.log(arrKey)
console.log(arrAnswer)
let arrToKey=[]
for (let i = 0; i < arrKey.length; i += 2) {
    if (!(arrKey[y] == arrKey[y - 1]) || y == 0) {
        console.log(arrKey[y])
        let key = arrKey[y-1]
        // console.log(key)
        // console.log(arrToKey)
        lastObj[key]=arrToKey
        arrToKey=[]
    } else {
        console.log("          " + arrAnswer[y])
        arrToKey.push(arrAnswer[y])
         
    }
    y++

}
console.log(lastObj)
let data = JSON.stringify(lastObj)
fs.writeFileSync("data123.json",data)