const fs = require('fs-extra')
const sanitizeHtml = require('sanitize-html')
const crypto = require('crypto')
const path = require('path')
// Плагины
let Plugin = function(config) {
	this.escapeRegExp = function(str) {
	    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1")
	}
	// Функция клинер
	this.clean = async function(value) {
	    if (value) return await sanitizeHtml(value.trim())
	}
	this.replaceAll = function(str, search, replace) {
	    return str.replace(new RegExp(search, 'g'), replace)
	}
	this.replaceSplitJoin = function(str, search, replace) {
	    return str.split(search).join(replace)
	}
	this.token = function() {
		return crypto.randomBytes(32).toString('hex')
	}
	// Генерируем и шифруем token
	this.encrypt = function(token) {
		const absolutePath = path.resolve(config.dir.key+'public.pem')
		const publicKey = fs.readFileSync(absolutePath, 'utf8')
		const buffer = Buffer.from(token, 'utf8')
		const encrypted = crypto.publicEncrypt(publicKey, buffer)
		return encrypted.toString('base64')
	}
	// Дешифруем token
	this.decrypt = async function(toDecrypt) {
	    let absolutePath = path.resolve(config.dir.key+'private.pem')
	    let privateKey = fs.readFileSync(absolutePath, 'utf8')
	    let buffer = Buffer.from(toDecrypt, 'base64')
	    let decrypted = crypto.privateDecrypt({key: privateKey.toString(), passphrase: '',}, buffer,)
	    return decrypted.toString('utf8')
	}
	// Маневры с ключевыми словами :) нужно оптимизировать
    this.AutoText = function(str) {
		let replacer = {}
		let run_replace = 0
		let new_str1 = ''
		let new_str2 = ''
		let new_str3 = ''
		let new_str4 = ''
		let new_str5 = ''
		// Соответствие на клавиатуре кириллицы латинским символам
		let replacerEnRu = {
			"q":"й", "w":"ц"  , "e":"у" , "r":"к" , "t":"е", "y":"н", "u":"г",
			"i":"ш", "o":"щ", "p":"з" , "[":"х" , "]":"ъ", "a":"ф", "s":"ы",
			"d":"в" , "f":"а"  , "g":"п" , "h":"р" , "j":"о", "k":"л", "l":"д",
			";":"ж" , "'":"э"  , "z":"я", "x":"ч", "c":"с", "v":"м", "b":"и",
			"n":"т" , "m":"ь"  , ",":"б" , ".":"ю" , "/":"."
		}
		// Соответствие на клавиатуре латинских символов кириллице
		let replacerRuEn = {
			"й":"q", "ц":"w"  , "у":"e" , "к":"r" , "е":"t", "н":"y", "г":"u",
			"ш":"i", "щ":"o", "з":"p" , "х":"[" , "ъ":"]", "ф":"a", "ы":"s",
			"в":"d" , "а":"f"  , "п":"g" , "р":"h" , "о":"j", "л":"k", "д":"l",
			"ж":";" , "э":"'"  , "я":"z", "ч":"x", "с":"c", "м":"v", "и":"b",
			"т":"n" , "ь":"m"  , "б":"," , "ю":"." , ".":"/"
		}
		// Определить кириллицу
		let isRu = function(str) {return /[а-яёА-ЯЁ]+$/i.test(str)}
		// Определить латиницу
		let isEn = function(str) {return /[a-zA-Z]+$/i.test(str)}
		
		if (isEn(str) == true) {replacer = replacerEnRu; run_replace = 1;}
		else if (isRu(str) == true) {replacer = replacerRuEn; run_replace = 1;}
		else {
			var example = str.split(' ')
			if (example[0]) new_str1 = AutoText(example[0])
			if (example[1]) new_str2 = ' '+AutoText(example[1])
			if (example[2]) new_str3 = ' '+AutoText(example[2])
			if (example[3]) new_str4 = ' '+AutoText(example[3])
			if (example[4]) new_str5 = ' '+AutoText(example[4])
		}
		
		if (run_replace == 1) {
			for(i=0; i < str.length; i++) {
				if( replacer[ str[i].toLowerCase() ] != undefined) {
					if(str[i] == str[i].toLowerCase()) replace = replacer[ str[i].toLowerCase() ]
					else if(str[i] == str[i].toUpperCase()) replace = replacer[ str[i].toLowerCase() ].toUpperCase()
					str = str.replace(str[i], replace)
				}
			}
		}
		else str = new_str1+new_str2+new_str3+new_str4+new_str5
		return str
	}
	// Проверка на ботов
	this.is_bot = function(userAgent) {
	    let bot = true
	    let botPattern = "(googlebot\/|bot|Googlebot-Mobile|Googlebot-Image|ZoominfoBot|YandexMetrika|Google favicon|Mediapartners-Google|bingbot|slurp|java|wget|curl|Commons-HttpClient|Python-urllib|libwww|httpunit|nutch|phpcrawl|msnbot|jyxobot|FAST-WebCrawler|FAST Enterprise Crawler|biglotron|teoma|convera|seekbot|gigablast|exabot|ngbot|ia_archiver|GingerCrawler|webmon |httrack|webcrawler|grub.org|UsineNouvelleCrawler|antibot|netresearchserver|speedy|fluffy|bibnum.bnf|findlink|msrbot|panscient|yacybot|AISearchBot|IOI|ips-agent|SurveyBot|tagoobot|Netcraft|MJ12bot|dotbot|woriobot|yanga|buzzbot|mlbot|yandexbot|purebot|Linguee Bot|Voyager|CyberPatrol|voilabot|baiduspider|citeseerxbot|spbot|twengabot|postrank|turnitinbot|scribdbot|page2rss|sitebot|linkdex|Adidxbot|blekkobot|ezooms|DuckDuckGo|Mail.RU_Bot|discobot|heritrix|findthatfile|europarchive.org|NerdByNature.Bot|sistrix crawler|ahrefsbot|Aboundex|domaincrawler|wbsearchbot|summify|ccbot|edisterbot|seznambot|ec2linkfinder|gslfbot|aihitbot|intelium_bot|facebookexternalhit|yeti|RetrevoPageAnalyzer|lb-spider|sogou|lssbot|careerbot|wotbox|wocbot|ichiro|DuckDuckBot|lssrocketcrawler|drupact|webcompanycrawler|acoonbot|openindexspider|gnam gnam spider|web-archive-net.com.bot|backlinkcrawler|coccoc|integromedb|content crawler spider|toplistbot|seokicks-robot|it2media-domain-crawler|ip-web-crawler.com|siteexplorer.info|elisabot|proximic|changedetection|blexbot|arabot|WeSEE:Search|niki-bot|CrystalSemanticsBot|rogerbot|360Spider|psbot|InterfaxScanBot|Lipperhey SEO Service|CC Metadata Scaper|g00g1e.net|GrapeshotCrawler|urlappendbot|brainobot|fr-crawler|binlar|SimpleCrawler|Livelapbot|Twitterbot|cXensebot|smtbot|bnf.fr_bot|A6-Indexer|ADmantX|Facebot|Twitterbot|OrangeBot|memorybot|AdvBot|MegaIndex|SemanticScholarBot|ltx71|nerdybot|xovibot|BUbiNG|Qwantify|archive.org_bot|Applebot|TweetmemeBot|crawler4j|findxbot|SemrushBot|yoozBot|lipperhey|y!j-asr|Domain Re-Animator Bot|AddThis)"
	    let re = new RegExp(botPattern, 'i')
	    // console.log(userAgent)
	    // let userAgent = 'Googlebot/2.1 (+http://www.googlebot.com/bot.html)'
	    if (!re.test(userAgent)) bot = false
	    // console.log('bot '+ bot)
	    return bot
	}
	return this
}

module.exports = Plugin