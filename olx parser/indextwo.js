var tress = require('tress')
var needle = require('needle')
var cheerio = require('cheerio')
var fs = require('fs')

let separator = '#|#'
let regex = /\d{10}/gm
var URL = 'http://google.com'
let urlMas = fs.readFileSync('log.txt', 'utf8').split(separator)

// we get results if the code suddenly exited 
var results = []
var datamas = JSON.parse(fs.readFileSync('data.json', 'utf-8'))
results = datamas

//console.log(results,urlMas.length)//debug

// `tress` successively calls our handler for each link in the queue
var q = tress(function (url, callback) {

    //here we are processing the url page
    needle.get(url, function (err, res) {
        try {
            if (err) throw err
            var $ = cheerio.load(res.body)
            res = $('[class=value]')
            console.log(i + " " + url)
            i++
            // check for the presence of this tag
            if (res != undefined) {
                for (let i = 0; i < res.length; i++) {
                    if (res[i].children[1] != undefined) {
                        if (res[i].children[1].children[0] != undefined) {
                            if (regex.test(res[i].children[1].children[0].data.replace(/\s/g, ''))) {
                                console.log(res[i].children[1].children[0].data.replace(/\s/g, ''))
                                results.push({
                                    title: res[i].children[1].children[0].data.replace(/\s/g, ''),
                                    href: url
                                })
                                //console.log(results)
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.log(e)
        }

        // here we parsing the page from res.body
        // do results.push for news data
        // do q.push for processing links
        q.push(urlMas)

        callback()//callback at the end
    })
}, 10)//start 10 parallel flows

// this function is executed when links end in the queue
q.drain = function () {
    fs.writeFileSync('./data.json', JSON.stringify(results, null, 4))
}

// add to the queue a link to the first page of the list
q.push(URL)

//if all the same, the code finishes saving the results
setInterval(() => {
    fs.writeFileSync('data.json', JSON.stringify(results, null, 4))
}, 6000)
