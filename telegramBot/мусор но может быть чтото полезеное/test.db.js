const fs = require('fs')
let arr = {}
arr = JSON.parse(fs.readFileSync('dataClean.json', "utf-8"))

let arrKey=Object.keys(arr)
let arrAnswer = Object.values(arr)
let uploadObj={}
z=1000
for(let i = 0;i<5227;i++){
    let key = arrKey[i]
    key =""+ key
    key = key.toLowerCase()
    uploadObj[z]=arrAnswer[i]
    z++
}
//console.log(uploadObj)
let a  = JSON.stringify(uploadObj)
fs.writeFileSync('dataCleanAnswer.json',a)









// setTimeout(Art, 223222)
// function Art(art, i) {
//     console.log("g")
// }





















































// let strText = fs.readFileSync('text.txt','utf-8')
// let arrText = strText.split('#')
// //let arrKey = []
// let BreakException = {}
// try {
// arrText.forEach(function(item, is, arrText) {
// 	console.log(is)
// 	let question
// 	let answer
// 	let tttt
// 	//let arrItem = {}
// 	let arrItem = item.split('#')
// 	if (arrItem[0] && arrItem[0] != '') question = arrItem[0]
// 	if (arrItem[1] && arrItem[1] != '') answer = arrItem[1]
// 	//if (arrItem[2] && arrItem[2] != '') tttt = arrItem[2]
// 	let mat = ["сучара","хуйня","блят","бляд","пидарас","ипись","изъеб","еблан","ебеный","ебущий","ебанашка","ебырь","хуище","гребан","уебище","уебан","феееб","6ляд","сцука","ебали","пестато","ебало","ебли","ебло","ебанут","ебут","заебу","выебу","хуйло","нехе","неху","ниху","нихе","ибанут","fuck","хули","хуля","хуе","хуё","мудл","хер","пидар","наху","педер","пидер","пидир","ёбну","ебну","ебыр","заеб","заёб","ебен","блятc","аебли","заебло","переебло","отебло","отъебло","отьебло","ебеш","выеб","отъеб","отьеб","перееб","хуйла","хую","иннах","6ля","бля","хуило","хуюше","сука","ъеб","ъёб","блябу","бля бу","залупа","хера","пизжен","ёпта","епта","пистапол","пизда","залупить","ебать","мудо","манда","мандавошка","мокрощелка","муда","муде","муди","мудн","пизд","похую","похуй","охуи","ебля","пидорас","пидор","херн","щлюха","хуй","писдеш","писдит","писдиш","нехуй","ниибаца"]

// 	mat.forEach(function(it, ii, mat) {
// 	    if (answer.indexOf(it) + 1) {
// 	        console.log('в слове: '+answer+' найден мат: '+it)
// 	    }
// 	})
// 	 if (is > 500 && is < 1000) {
// 		throw BreakException
// 	} 
// })
// } catch (e) {
//   if (e !== BreakException) throw e
// }
// variant 2 