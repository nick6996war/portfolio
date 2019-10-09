let tress = require('tress')
let needle = require('needle')
let cheerio = require('cheerio')
let fs = require('fs')

let separator ='#|#'//that would definitely not be repeated in the link

let writeStream = fs.createWriteStream("log.txt")
for (let num = 2;num<500;num++){  //from the second page by the fact that on the first page you need to change the URL
let URL = 'https://www.olx.ua/uk/list/q-%D0%B7%D0%B5%D0%BC%D0%BB%D1%8F/?page='+num
let streamParse = 10

let q = tress(function (url, callback) {
    needle.get(url, function (err, res,) {
        if (err) throw err

        let $ = cheerio.load(res.body)
            res= $(".lheight22.margintop5")  
            //console.log(res[0].children[1].attribs.href) //debug
        callback();

        
        for (let i = 0; i < res.length; i++) {
            writeStream.write(res[i].children[1].attribs.href+separator) //html tag nesting
            //console.log(res[i].children[1].attribs.href) //debug
        }
    })
}, streamParse)
setTimeout(() => {}, 900) // need to prevent ban, disconnect
q.push(URL) //func start
}
