let fs = require('fs-extra') // Файловый менеджер // const fs = require('fs')
//const app = require(fs.readFileSync(__dirname + '/app.js'))
// https://catalog-api.rozetka.com.ua/v2/fats/getFullMenu?lang=ua
// Конфигурация
let TelegramBotToken = '689957809:AAEro1IpdojropqvfbIH2RwHUcvsV6pGEfc'
let console_log = 1 // Выводим лог в console: 1 да, 0 нет
let file_log = 0 // Пишем лог в файл: 1 да, 0 нет
let file_cache_update = 1 // Обновить кеш 1 или нет 0
let request_number = 0 // Количество запросов к App
let config = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf8'))
let site = config['site']
let template = config['config']['template']
//let pllanoApp = config['pllano_app']
let pllanoApp = 'https://app.pllano.com'
let lang = new Set(['en', 'ru', 'ua', 'pl', 'de'])
let language_id = 'en' // id языка по умолчанию
let lang_id = 'name_en'
let lat = 49 // Координаты
let lon = 32 // Координаты
let timezone = 'Europe/Kiev'
let cur_code = 'UAH' // Код валюты
let iso = 'UA' // Код iso
let continent = 'EU'
let country_id = 222 // Украина - id страны
let region_id = 703447 // Киев - id региона (области)
let city_id = 703448 // Киев - id города
let country
let city
let region
let filedir = __dirname + config['filedir']
if (!fs.existsSync(filedir)) fs.mkdirSync(filedir)
let dirkey = __dirname + config['dirkey']
if (!fs.existsSync(dirkey)) fs.mkdirSync(dirkey)
let geodir = filedir+'/geo'
if (!fs.existsSync(geodir)) fs.mkdirSync(geodir)
let geoipdir = geodir+'/ip'
if (!fs.existsSync(geoipdir)) fs.mkdirSync(geoipdir)
let dirlanguage = filedir+'/language'
if (!fs.existsSync(dirlanguage)) fs.mkdirSync(dirlanguage)
let logdir = filedir+'/log'
if (!fs.existsSync(logdir)) fs.mkdirSync(logdir)
let geo_api = 'http://de.sxgeo.city/json/'
let geo_ipinfo = 'https://ipinfo.io/json'
// Подключаем пакеты
let express = require('express') // https://www.npmjs.com/package/express
let router = express() // https://expressjs.com/ru/starter/hello-world.html
let Twig = require('twig'), twig = Twig.twig
let http = require('http') // https://www.npmjs.com/package/http
let promise = require('promise') // https://www.npmjs.com/package/promise
let requestPromise = require('request-promise') // https://www.npmjs.com/package/request-promise
let request = require('request')
let crypto = require('crypto')
let hash = require('hash.js')
let bcrypt = require('bcrypt')
let TokenGenerator = require('uuid-token-generator')
let session = require('express-session')
let FileStore = require('session-file-store')(session)
let jsParser = require('ua-parser-js')
let bodyParser = require('body-parser')
let helmet = require('helmet')
let path = require('path')
let url = require('url')
let httpBuildQuery = require('http-build-query') // $ npm install http-build-query // https://www.npmjs.com/package/http-build-query
let sanitizeHtml = require('sanitize-html') // https://www.npmjs.com/package/sanitize-html
let striptags = require('striptags') // https://www.npmjs.com/package/striptags
let uuid = require('uuid/v4')
let dateFormat = require('dateformat')
let serialize = require('dom-serialize')
let Cookies = require('cookies')
let nodemailer = require("nodemailer")
//cookies.set('LastVisit', new Date().toISOString(), {signed: true})
//let lastVisit = cookies.get('LastVisit', {signed: true})
//cookies.set('test_js', 'test', {signed: false, httpOnly: false})
//let test_js = cookies.get('test_js')
let cookieParser = require('cookie-parser')
router.use(cookieParser())
//let cookieSession = require('cookie-session')
let lookup = require('binlookup')()

// Создаем и проверяем хеш
// let password = '4149605006216923' // Исходная строка
// let hashs = bcrypt.hashSync(password, bcrypt.genSaltSync(10)) // Создаем хеш
// let testHash = bcrypt.compareSync(password, hashs) // Проверка хеша true если ок
// console.log(testHash) // true если ок

/*
	//const request = require('request') // https://www.npmjs.com/package/request
	//const compression = require('compression')
	// fs.writeFile(filedir+'/message.txt', 'Hello Node.js', 'utf8', callback) // Записать файл
	// Allow only a super restricted set of tags and attributes
	clean = sanitizeHtml(html, {
	allowedTags: [ 'b', 'i', 'em', 'strong', 'a' ],
	allowedAttributes: {
    'a': [ 'href' ]
	},
	allowedIframeHostnames: ['www.youtube.com']
	})
	//striptags(html)
	//striptags(html, '<strong>') // Разрешить strong
	//striptags(html, ['a']) // Разрешить a
	
	// Всякие шифрровалки
	//let uuidv1 = require('uuid/v1')
	//let uuidv3 = require('uuid/v3')
	
	//const nodemailer = require("nodemailer")
	//const Email = require('email-templates')
	//const redis = require("redis"),client = redis.createClient()
	
	//var cookies = require('cookies')
	//const cookieParser = require('cookie-parser')
	//const cookieSession = require('cookie-session')
	//router.use(cookieParser())
	
	// https://medium.com/@evangow/server-authentication-basics-express-sessions-passport-and-curl-359b7456003d
	//let TelegramBot = require('node-telegram-bot-api')
	//let TelegramToken = '689957809:AAEro1IpdojropqvfbIH2RwHUcvsV6pGEfc' // Устанавливаем токен TelegramBot
	//let botTelegram = new TelegramBot(TelegramToken, {polling: true}) // Подключаемся к боту
	//let ig = require('instagram-node').instagram()
	//let TelegramBot = require('node-telegram-bot-api')
	
	//let tokgen = new TokenGenerator(512, TokenGenerator.BASE62)
	//let tokgen = new TokenGenerator(256, TokenGenerator.BASE62)
	//let token = encrypt(tokgen.generate(), dirkey+'public.pem')
	//let tokenDecrypt = decrypt(token, dirkey+'private.pem')
	
	// Сгенерировать новые ключи для шифрования
	const { writeFileSync } = require('fs')
	const { generateKeyPairSync } = require('crypto')
	function generateKeys() {
	const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicKeyEncoding: {
	type: 'pkcs1',
	format: 'pem',
    },
    privateKeyEncoding: {
	type: 'pkcs1',
	format: 'pem',
	cipher: 'aes-256-cbc',
	passphrase: '',
    },
	})
	
	writeFileSync(dirkey+'private.pem', privateKey)
	writeFileSync(dirkey+'public.pem', publicKey)
	}
	// Запускает генерацию ключей
	generateKeys()
	
	// const tokgen = new TokenGenerator() // Default is a 128-bit token encoded in base58
	// tokgen.generate()
	// -> '4QhmRwHwwrgFqXULXNtx4d'
	// const tokgen2 = new TokenGenerator(256, TokenGenerator.BASE62)
	// tokgen2.generate()
	// -> 'x6GCX3aq9hIT8gjhvO96ObYj0W5HBVTsj64eqCuVc5X'
	//let expiryDate = new Date( Date.now() + 3600 * 24 * 31 ) // 1 hour
	//let expiryDate = new Date( Date.now() + hour ) // 1 hour
	// forEach
	arr.forEach(function (item) {
	someFn(item);
	})
	// for
	for (var i = 0, len = arr.length; i < len; i++) {
	someFn(arr[i]);
	}
	
	router.configure(function(){
	router.use(express.static(__dirname+'/public')); // Catch static files
	router.use(router.routes);
	})
	
	// router.set('view engine', 'ejs')
	//router.use(compression())
*/
router.use(express.static(__dirname + '/../club.pllano.com'))
router.set('views', __dirname + '/views')
router.set('view engine', 'twig')
router.set('twig options', {allow_async: true, strict_variables: false})
router.set('trust proxy', true)

try {
	router.use(session({
		name: 'session',
		genid: function(req) {
			return uuid() // use UUIDs for session IDs
		},
		store: new FileStore(),
		secret: fs.readFileSync(dirkey + '/session.txt', 'utf8'),
		proxy: true,
		resave: false,
		saveUninitialized: true,
		cookie: { domain: '.pllano.com', maxAge: 365 * 24 * 60 * 60 * 1000, secure: true }
	}))
}
catch (err) {console.log(err)}

router.use(helmet())
router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())
// Ресурсы
let resourceGetJson = new Set(['cart', 'country','city','region'])
// Храним в сессии
let resourceSession = new Set(['cart','wishlist','collection'])
// Храним в json
let resourceJson = new Set(['country','city','region'])
// Все GET ресурсы
let pathGet = new Set([
    'contact',
    'about-us',
    'terms-of-use',
    'privacy-policy',
    'for-partners',
    'for-banks',
    'marketplace',
    'club',
	'language', // Мультиязычность
    'sign-in', // Авторизация
    'sign-up', // Регистрация
    'order-card', // Оформить заказ
	'check-card', // Проверка карты
	'card-activation', // Активация карты
	'order', // Заказы
	'cart', // Корзина
	'wishlist', // Отложенное
	'collection', // Избранное
    //'suggestions',
    //'landings',
    //'referral',
    //'balance',
	'get', // Получить данные
	'club-state', // Проверить карту храмим первіх 6 цифр и md5
])
// Все POST ресурсы
let pathPost = new Set([
    'language', // Мультиязычность
    'logout', // Выход
	'login', // Вход
	'cart', // Корзина
	'wishlist', // Отложенное
	'collection', // Избранное
	'order', // Заказы
    //'landings',
	//'suggestions',
	'post', // Другие POST запросы
	'order-card', // Заказ карты
	'check-card', // Проверка карты
	'card-activation', // Активация карты
])
// Список ресурсов для которых генерируем token, для того что бы не генерить токен картинкам
let pathToken = new Set([
    'index',
    'language',
    'sign-up',
    'sign-in',
    'marketplace',
    'club',
    'order-card', // Заказ карты
	'check-card', // Проверка карты
	'card-activation', // Активация карты
    'contact',
    'about-us',
    'terms-of-use',
    'privacy-policy',
    'for-partners',
    'for-banks',
])
// Список ресурсов статей, не запрашиваем API
let pathStatic = new Set([
	'club',
	'contact',
	'about-us', 
	'terms-of-use', 
	'privacy-policy', 
	'for-partners', 
	'for-banks',
])
// Список ресурсов которые запрашиваем через API
let pathApp = new Set([
    'index',
    'marketplace',
])
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
// Функция клинер
async function clean(value) {
    if (value) return await sanitizeHtml(value.trim())
}

function encrypt(toEncrypt, relativeOrAbsolutePathToPublicKey) {
	const absolutePath = path.resolve(relativeOrAbsolutePathToPublicKey)
	const publicKey = fs.readFileSync(absolutePath, 'utf8')
	const buffer = Buffer.from(toEncrypt, 'utf8')
	const encrypted = crypto.publicEncrypt(publicKey, buffer)
	return encrypted.toString('base64')
}

function decrypt(toDecrypt, relativeOrAbsolutePathtoPrivateKey) {
	let absolutePath = path.resolve(relativeOrAbsolutePathtoPrivateKey)
	let privateKey = fs.readFileSync(absolutePath, 'utf8')
	let buffer = Buffer.from(toDecrypt, 'base64')
	let decrypted = crypto.privateDecrypt({key: privateKey.toString(), passphrase: '',}, buffer,)
	return decrypted.toString('utf8')
}

// Шифруем token
async function tokenEncrypt(req, res) {
	let tokgen = await new TokenGenerator(512, TokenGenerator.BASE62)
	let token = await tokgen.generate()
	req.session.token = token
	return await encrypt(token, dirkey+'public.pem')
}

// Дешифруем token
async function tokenDecrypt(t) {
	return await decrypt(t, dirkey+'private.pem')
}

// Маневры с ключевыми словами :) нужно оптимизировать
function AutoText(str) {
	let replacer = {}
	let run_replace = 0
	let new_str1 = ''
	let new_str2 = ''
	let new_str3 = ''
	let new_str4 = ''
	let new_str5 = ''
	
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

// Рабочий метод
const promiseRequest = function(options) {
	return new Promise((resolve, reject) => {
		request(options, (error, response, body) => {
			if (response) return resolve(response)
			if (error) return reject(error)
		})
	})
}

// Универсальная функия обращения к Pllano App
async function getApp(req, method, source, id, param, access_token) {
	let resp = {}
	let param_get = ''
	let source_id = ''
	let options = {}
	if (id) source_id = id
	let data
	
    /*
		const optionss = {
        url: 'https://www.google.com',
        method: 'GET',
        gzip: true,
        headers: {
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.96 Safari/537.36'
        }
		}
		let response = await promiseRequest(optionss) // Рабочий метод
		console.log(response.headers)
		console.log(response.body)
	*/
	
	if (access_token) options.headers = {'Auth': 'Bearer', 'Token': 'Bearer '+access_token+'', 'Content-Type': 'application/json'}
	
	// options.headers = {}
	// options.headers['Content-Type'] = 'application/json'
	// options.headers['Token'] = access_token
	// options.headers['Auth'] = 'Bearer'
	
	if (method == 'GET' && source && param) {
		//if (access_token) param.token = access_token
		param_get = '?'+httpBuildQuery(param)
	}
	else if (method == 'POST' && source && param) {
		options.body = param
		//console.log(options.body)
		//if (access_token) param_get = '?'+httpBuildQuery({'token': access_token})
	}
	let urlApp = pllanoApp+''+source+''+source_id+''+param_get
	console.log('urlApp: '+urlApp)
	options.url = urlApp
	if (method) options.method = method
	options.json = true
	//options.gzip = true
	// options.formData = {}
	
    /*
		// Рабочий метод без промисов
		request(options, async function (error, response, resp) {
	    if (!error && response.statusCode === 200) console.log(response.statusCode)
		else console.log(error)
		})
		if (method && source) resp = await request(options)
	*/
	
	resp = await requestPromise(options)
	
	//if (resp && resp.response && resp.response.access_token) req.session.access_token = resp.response.access_token
	if (resp && resp.response && resp.response.refresh_token) req.session.access_token = resp.response.refresh_token
	
	return resp
}

async function getMarketplaceApp(req, method, source, param, access_token, query) {
	let resp = {}
	resp.response = {}
	resp.query = query
	
	let response = {}
	let new_query = ''
	let session_query = ''
	new_query = AutoText(query)
	param.query = new_query
	request_number = 2
	response = await getApp(req, 'GET', source, null, param, access_token)
	
	if (response.body.items && response.body.items.hits && response.body.items.hits.total >= 1) {
		query = new_query
		session_query = new_query
	}
	else {
		var example = query.split(' ');
		new_query = example[0]
		param.query = new_query
		request_number = 3
		response = await getApp(req, 'GET', source, null, param, access_token)
		if (response.body.items && response.body.items.hits && response.body.items.hits.total >= 1) {
			query = new_query
			session_query = new_query
		}
		else if (example[1]) {
			new_query = example[1]
			param.query = new_query
			request_number = 4
			response = await getApp(req, 'GET', source, null, param, access_token)
			if (response.body.items && response.body.items.hits && response.body.items.hits.total >= 1) {
				query = new_query
				session_query = new_query
			}
			else if (example[2]) {
				new_query = example[2]
				param.query = new_query
				request_number = 4
				response = await getApp(req, 'GET', source, null, param, access_token)
				if (response.body.items && response.body.items.hits && response.body.items.hits.total >= 1) {
					query = new_query
					session_query = new_query
				}
				else {
					delete param.query
					request_number = 5
					session_query = null
					query = ''
					response = await getApp(req, 'GET', source, null, param, access_token)
				}
			}
			else {
				delete param.query
				request_number = 5
				session_query = null
				query = ''
				response = await getApp(req, 'GET', source, null, param, access_token)
			}
		}
		else {
			delete param.query
			request_number = 5
			session_query = null
			query = ''
			response = await getApp(req, 'GET', source, null, param, access_token)
		}
	}
	resp.response = response
	resp.query = session_query
	//if (resp && resp.response && resp.response.access_token) req.session.access_token = resp.response.access_token
	//if (resp && resp.response && resp.response.refresh_token) req.session.access_token = resp.response.refresh_token
	return resp
}
// Запускаем сессию пользователя и проверяем авторизацию
async function run(req) {
	try {
		let authorize = null
		let access_token
		let user
		let response
		
		if (req.session.views) req.session.views++
		else req.session.views = 1
		
		if (req.session.access_token) access_token = req.session.access_token
		else {
			let tokgen = new TokenGenerator(512, TokenGenerator.BASE62)
			let token = tokgen.generate()
			req.session.access_token = token
			access_token = token
		}
		
		//console.log('req.session.authorize '+req.session.authorize)
		
		if (access_token && req.session.authorize != 1) {
		    //if (access_token) {
			//console.log('session regenerate 0')
			//access_token = req.session.access_token
			//let requestArr = await getApp(req, 'GET', '/auth', '', {}, req.session.access_token)
			let requestArr = await getApp(req, 'GET', '/auth', '', null, access_token)
			if (requestArr.body) user = await requestArr.body.user
			if (requestArr.response) response = await requestArr.response
			if (user.id) {
				req.session.id = user.id
				req.session.user_id = user.user_id
				req.session.cart_id = user.cart_id
				if (user.userdata_id) {
					req.session.userdata_id = user.userdata_id
					if (user.user_role) req.session.user_role = user.user_role
					if (user.partner && user.partner == 1) req.session.partner = 1
					if (user.seller && user.seller == 1) req.session.seller = 1
					if (user.email) req.session.email = user.email
					if (user.phone) req.session.phone = user.phone
					if (user.iname) req.session.iname = user.iname
					if (user.fname) req.session.fname = user.fname
					if (user.bonus_code) req.session.bonus_code = user.bonus_code
					if (user.referral_code) req.session.referral_code = user.referral_code
					if (user.club && user.club.id) req.session.club = user.club
				}
				if (response.authorization && response.authorization == 1) req.session.authorize = 1
			}
			if (response.access_token) req.session.access_token = response.access_token
			if (response.refresh_token) req.session.access_token = response.refresh_token
		}
		
		if (!req.session.access_token) {
			//console.log('session regenerate 1')
			req.session.regenerate(function(err) {})
		}
	} 
	catch (err) {
	    //console.log('session regenerate 2')
	    req.session.regenerate(function(err) {
		    // will have a new session here
		})
	}
	
	/*
		req.session.regenerate(function(err) {
		// will have a new session here
		})
		req.session.destroy(function(err) {
		// cannot access session here
		})
		req.session.reload(function(err) {
		// session updated
		})
		req.session.save(function(err) {
		// session saved
		})
		req.session.cookie.maxAge = hour
		var hour = 3600000
		req.session.cookie.maxAge = hour
	*/
}
// Авторизация и Регистрация
async function login(req) {
	try {
		if (req.body && req.body.oauth) {
			let body = req.body
			let param = {}
			if (body.oauth) param.oauth = await body.oauth
			if (body.token) param.token = await clean(body.token)
			if (body.email) param.email = await clean(body.email)
			if (body.phone) param.phone = await clean(body.phone)
			if (body.iname) param.iname = await clean(body.iname)
			if (body.fname) param.fname = await clean(body.fname)
			if (body.password) param.password = await clean(body.password)
			//console.log(param)
			let requestArr = await getApp(req, 'POST', '/auth', '', param)
			//console.log(requestArr)
			if (requestArr.body && requestArr.body.user && requestArr.body.user.id) {
				let user = {}
				user = requestArr.body.user
				req.session.id = user.id
				req.session.oauth = body.oauth
				
				if (user.user_id) req.session.user_id = user.user_id
				if (user.cart_id) req.session.cart_id = user.cart_id
				if (user.userdata_id) {
					req.session.userdata_id = user.userdata_id
					if (user.user_role) req.session.user_role = user.user_role
					if (user.partner && user.partner == 1) req.session.partner = 1
					if (user.seller && user.seller == 1) req.session.seller = 1
					if (user.email) req.session.email = user.email
					if (user.phone) req.session.phone = user.phone
					if (user.iname) req.session.iname = user.iname
					if (user.fname) req.session.fname = user.fname
					if (user.bonus_code) req.session.bonus_code = user.bonus_code
					if (user.referral_code) req.session.referral_code = user.referral_code
					if (user.club && user.club.id) req.session.club = user.club
					if (requestArr.response && requestArr.response.authorization && requestArr.response.authorization == 1) req.session.authorize = 1
				}
			}
			if (requestArr.response && requestArr.response.access_token) req.session.access_token = requestArr.response.access_token
		}
	}
	catch (err) {
	    console.log(err)
	}
}
// Выйти
function logout(req) {
    // req.sessionID = null
    // req.session.access_token = null
    // req.session.language = null
    // req.session.authorize = null
    // req.session.id = null
    // req.session.userdata_id = null
    // req.session.user_id = null
    // req.session.cart_id = null
    // req.session.oauth = null
    // req.session.email = null
    // req.session.name = null
    // req.session.iname = null
    // req.session.fname = null
    // req.session.bonus_code = null
    // req.session.referral_code = null
    req.session.destroy(function(err) {
	    console.log(err)
	})
	/* req.session.regenerate(function(err) {
		console.log(err)
	}) */
}
// Не понятно нужна или нет !!!
function sessionArr(req) {
	let requ = {}
	if (req.session.authorize) requ.authorize = req.session.authorize
	if (req.session.language) requ.language = req.session.language
	if (req.session.access_token) requ.access_token = req.session.access_token
	if (req.session.id) requ.id = req.session.id
	if (req.session.userdata_id) requ.userdata_id = req.session.userdata_id
	if (req.session.user_id) requ.user_id = req.session.user_id
	if (req.session.cart_id) requ.cart_id = req.session.cart_id
	if (req.session.oauth) requ.oauth = req.session.oauth
	if (req.session.email) requ.email = req.session.email
	if (req.session.name) requ.name = req.session.name
	if (req.session.iname) requ.iname = req.session.iname
	if (req.session.fname) requ.fname = req.session.fname
	if (req.session.bonus_code) requ.bonus_code = req.session.bonus_code
	if (req.session.referral_code) requ.referral_code = req.session.referral_code
	if (req.session.user_role) requ.user_role = req.session.user_role
	if (req.session.partner) requ.partner = req.session.partner
	if (req.session.seller) requ.seller = req.session.seller	
	if (req.session.club && req.session.club.id) requ.club = req.session.club
	//console.log(req.session.club)
	return requ
}
// Функция получения локализации в нужном языке
async function Language(req, lg) {
	let language = {}
	let param = {}
	let lang = new Set(['en', 'ru', 'ua', 'pl', 'de'])
	//console.log('lg '+lg)
	if (lang.has(lg)) {
		let file_cache = dirlanguage+'/'+lg+'.json'
		// Проверяем наличие file в локальном хранилище
	    if (!fs.existsSync(file_cache) || file_cache_update == 1) {
			//console.log(file_cache)
	        param = {'lang': lg}
			// Получаем язык по API
	        let requestArr = await getApp(req, 'GET', '/language', '', param)
	        if (requestArr.body && requestArr.body.language) language = await requestArr.body.language
			// Записываем в локальное хранилище
	        await fs.writeFileSync(file_cache, JSON.stringify(language), 'utf8') // Записать файл
		}
		else language = await JSON.parse(fs.readFileSync(file_cache, 'utf8')) // Читаем из локального хранилища
	}
	// console.log(language)
	return language
}
// Функция проверки языка у пользователя
async function LanguageTest(req, res) {
	language_id = config['language']
	if (req.session.language) language_id = req.session.language
	else if (req.acceptsLanguages('ua', 'ru', 'en', 'de', 'pl')) language_id = req.acceptsLanguages('ua', 'ru', 'en', 'de', 'pl')
	req.session.language = language_id
	return req.session.language
}
// Пишем выбранный язык в сессию
function setLanguage(req, id) {
	let lang_id = 0
	let lang
    if (id == 1) lang = 'ru'
    else if (id == 2) lang = 'ua'
    else if (id == 3) lang = 'en'
    else if (id == 4) lang = 'de'
    else if (id == 5) lang = 'pl'
    if (lang == 'ru' || lang == 'ua' || lang == 'en' || lang == 'de' || lang == 'pl') {
        req.session.language = lang
        lang_id = id
	}
	return lang_id
}
// Формируем блоки для шаблонизатора
function getBlocks(req, route, user, language) {
	let b = {}
	b.og = {}
	let authorize = user.authorize
	let club = {}
	let partner = 0
	let seller = 0

	b.template = template
	b.alias = req.originalUrl
	b.robots = 'index, follow'
	b.blocks = []
	b.blocks["0"] = {'name': template+'/head.html'}
	b.blocks["1"] = {'name': template+'/index/index.html'}
	b.blocks["2"] = {'name': template+'/nav.html'}
	b.blocks["3"] = {'name': template+'/footer.html'}
	b.blocks["4"] = {'name': template+'/js.html'}
	
	if (authorize == 1) {
		b.robots = 'noindex, nofollow'
		if (user.club && user.club.id) club = user.club
		if (user.partner && user.partner == 1) partner = 1
		if (user.seller && user.seller == 1) seller = 1
		
	    if (route == 'sign-in') route = 'index'
	    else if (route == 'sign-up') route = 'index'
	} else {
	    if (route == 'order') route = '404'
	    else if (route == 'cart') route = '404'
	    else if (route == 'wishlist') route = '404'
	    else if (route == 'collection') route = '404'
		else if (route == 'check-card') route = 'club'
	}
	
	if (route == '404') b.name = language['447'] // Ошибка 404
	else if (route == 'index') {
	    b.name = language['962'] // Новые привилегии с Platinum Card PLLANO Edition
		if (authorize == 1) b.name = language['974'] // Platinum Card PLLANO Edition
	}
	else if (route == 'marketplace') {
	    b.name = language['972'] // PLLANO Marketplace - товары без торговой наценки
	    if (authorize == 1) b.name = language['972'] // PLLANO Marketplace - товары без торговой наценки
		b.og.image = 'img/marketplace/pllano-card-social-network.png'
	}
	else if (route == 'club') b.name = language['970'] // PLLANO Club - премиум скидка 20% на все
	else if (route == 'order-card') b.name = language['571'] // Предварительный заказ
	else if (route == 'contact') b.name = language['105'] // Контакты
	else if (route == 'about-us') b.name = language['404'] // О проекте
	else if (route == 'terms-of-use') b.name = language['504'] // Условия использования сайта
	else if (route == 'privacy-policy') b.name = language['406'] // Политика конфиденциальности
	else if (route == 'for-partners') b.name = language['963'] // Для партнеров
	else if (route == 'for-banks') b.name = language['961'] // Для банков
	
	// По умолчанию если не задано
	if (!b.h1) b.h1 = b.name
	if (!b.title) b.title = b.name
	if (!b.description) b.description = b.name
	if (!b.keywords) b.keywords = b.name
	if (!b.og.title) b.og.title = b.name
	if (!b.og.description) b.og.description = b.name
	
	if (route == '404') {
		delete b.blocks
		b.blocks = []
		b.blocks["0"] = {'name': template+'/404.html'}
	}
	else if (route == 'index') {
		if (authorize == 1) b.blocks["1"] = {'name': template+'/'+route+'/'+route+'-authorize.html'}
	}
	else if (pathStatic.has(route)) b.blocks["1"] = {'name': template+'/article/'+route+'.html'}
	else if (route == 'marketplace') {
		b.blocks["1"] = {'name': template+'/article/marketplace.html'}
		if (authorize == 1) b.blocks["1"] = {'name': template+'/marketplace/product-list.html'}
	}
	else if (route == 'club') {
		b.blocks["1"] = {'name': template+'/article/club.html'}
		if (authorize == 1) b.blocks["1"] = {'name': template+'/club/index.html'}
	}
	else if (route == 'order-card') {
		b.blocks["1"] = {'name': template+'/order/order-card.html'}
		if (authorize == 1) b.blocks["1"] = {'name': template+'/order/order-card.html'}
	}
	else if (route == 'card-activation') {
		b.blocks["1"] = {'name': template+'/activation/card-activation.html'}
		if (authorize == 1) b.blocks["1"] = {'name': template+'/activation/card-activation.html'}
	}
	else if (route == 'check-card') {
		b.blocks["1"] = {'name': template+'/activation/check-card.html'}
	}
	else if (route == 'sign-in' || route == 'sign-up') {
		delete b.blocks
		b.blocks = []
		b.blocks["0"] = {'name': template+'/'+route+'.html'}
		b.blocks["1"] = {'name': template+'/js.html'}
	}
	return b
}

// ajax render
async function miniRender(req, dir, resource, metod, data, language) {
	let res
	let obi = {}
	obi.dir = dir
	obi.resource = resource
	obi.metod = metod
	obi.data = data
	obi.language = language
	let t = twig({data: fs.readFileSync(__dirname + '/views/'+template+'/'+dir+'/'+resource+'.html', 'utf8')})
	res = await t.render(obi)
	return res
}

/*
	router.get('/:alias', async function(req, res) {
	res.send(req.params)
	//original_url.url = req.url
	//original_url.path = req.path
	//original_url.protocol = req.protocol
	//original_url.host = req.get('host')
	//let requrl = url.format(original_url) // 
	//let fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl
	})
	router.get('/article/:alias', async function(req, res) {
	res.send(`Article, ${req.params.alias}!`)
	})
	router.get('/users/:userId/articles/:articleId', async function(req, res) {
	res.send(req.params)
	})
*/

function is_bot(userAgent) {
	let bot = false
    let botPattern = "(googlebot\/|Googlebot-Mobile|Googlebot-Image|Google favicon|Mediapartners-Google|bingbot|slurp|java|wget|curl|Commons-HttpClient|Python-urllib|libwww|httpunit|nutch|phpcrawl|msnbot|jyxobot|FAST-WebCrawler|FAST Enterprise Crawler|biglotron|teoma|convera|seekbot|gigablast|exabot|ngbot|ia_archiver|GingerCrawler|webmon |httrack|webcrawler|grub.org|UsineNouvelleCrawler|antibot|netresearchserver|speedy|fluffy|bibnum.bnf|findlink|msrbot|panscient|yacybot|AISearchBot|IOI|ips-agent|tagoobot|MJ12bot|dotbot|woriobot|yanga|buzzbot|mlbot|yandexbot|purebot|Linguee Bot|Voyager|CyberPatrol|voilabot|baiduspider|citeseerxbot|spbot|twengabot|postrank|turnitinbot|scribdbot|page2rss|sitebot|linkdex|Adidxbot|blekkobot|ezooms|dotbot|Mail.RU_Bot|discobot|heritrix|findthatfile|europarchive.org|NerdByNature.Bot|sistrix crawler|ahrefsbot|Aboundex|domaincrawler|wbsearchbot|summify|ccbot|edisterbot|seznambot|ec2linkfinder|gslfbot|aihitbot|intelium_bot|facebookexternalhit|yeti|RetrevoPageAnalyzer|lb-spider|sogou|lssbot|careerbot|wotbox|wocbot|ichiro|DuckDuckBot|lssrocketcrawler|drupact|webcompanycrawler|acoonbot|openindexspider|gnam gnam spider|web-archive-net.com.bot|backlinkcrawler|coccoc|integromedb|content crawler spider|toplistbot|seokicks-robot|it2media-domain-crawler|ip-web-crawler.com|siteexplorer.info|elisabot|proximic|changedetection|blexbot|arabot|WeSEE:Search|niki-bot|CrystalSemanticsBot|rogerbot|360Spider|psbot|InterfaxScanBot|Lipperhey SEO Service|CC Metadata Scaper|g00g1e.net|GrapeshotCrawler|urlappendbot|brainobot|fr-crawler|binlar|SimpleCrawler|Livelapbot|Twitterbot|cXensebot|smtbot|bnf.fr_bot|A6-Indexer|ADmantX|Facebot|Twitterbot|OrangeBot|memorybot|AdvBot|MegaIndex|SemanticScholarBot|ltx71|nerdybot|xovibot|BUbiNG|Qwantify|archive.org_bot|Applebot|TweetmemeBot|crawler4j|findxbot|SemrushBot|yoozBot|lipperhey|y!j-asr|Domain Re-Animator Bot|AddThis)"
    let re = new RegExp(botPattern, 'i')
    // let userAgent = 'Googlebot/2.1 (+http://www.googlebot.com/bot.html)'
    if (re.test(userAgent)) bot = true
	//console.log('bot '+ bot)
	return bot
}

// async..await is not allowed in global scope, must use a wrapper
async function sendMail(req, template, data, to, subject, language) {
  let dir = '_mail'
  let render_text = 'Hello world?'
  let render_html = '<b>Hello world?</b>'
  render_text = await miniRender(req, dir, template+'_text', 'text', data, language)
  render_html = await miniRender(req, dir, template+'_html', 'html', data, language)
  //console.log(render_text)
  let transporter = nodemailer.createTransport({host: 'smtp.gmail.com', port: 465, secure: true, auth: {user: 'info@pllano.com', pass: 'hnvt75f65^$S%Ud'}})
  let mailOptions = {from: '"PLLANO Marketplace 👻" <info@pllano.com>', to: to, subject: subject, text: render_text, html: render_html}
  let message = await transporter.sendMail(mailOptions)
  //console.log("Message sent: %s", message.messageId)
  return message.messageId
}

//postUniversal(req, resource, null, null, language_id)
async function postUniversal(req, resource, metod, id, language_id) {
	let language = await Language(req, language_id)
	let dir = 'post'
	let render
	let model = []
	let body = {}
	let data = {}
	if (req.body) body = req.body
	if (id) body.id = id
	if (req.body.metod) metod = req.body.metod
	
	//req.session[resource] = null
    let metodRun = new Set(['add','wishlist','delete','collection','remove','decrease','increase','quantity'])
	if (metodRun.has(metod) && resource && body.id) {
		if (req.session[resource] && req.session[resource]['0']) model = req.session[resource]
		else if (req.session[resource] && req.session[resource]['id']) {
		    model['0'] = req.session[resource]
		    req.session[resource] = null
		}
		
		let fields = new Set(['csrf','token','oauth','metod','id','name','code','passport','phone','email','num','price','currency_id','country_id','city_id','city'])
		for (var key in body) {
		    if (fields.has(key)) data[key] = body[key]
			//console.log(body[key])
		}
		
		if (model.length > 0 && data.id) {
			let ok
			let ii = 0
		    await model.forEach(function(item, i, model) {
		        if (item.id == body.id) {
					ok = 1
					ii = i
				}
			})
			
		    if (ok) {
				if (metod == 'cart' || metod == 'wishlist' || metod == 'collection') model[ii].state = data.state
				else if (metod == 'delete') model.splice(ii, 1)
			    else if (metod == 'remove') model[ii] = data
			    else if (metod == 'decrease' || metod == 'increase' || metod == 'quantity') model[ii].num = data.num
			}
			else {
		        if (metod == 'add') await model.push(data)
			}
		}
		else {
			if (metod == 'add') model['0'] = data
		}
		req.session[resource] = null
		req.session[resource] = model
	}
	
	if (resource == 'cart' && metodRun.has(metod)) {
		render = await miniRender(req, dir, resource, metod, data, language)
	}
	
	return render
}

async function getUniversal(req, resource, id) {
	let item = []
	let arr
	//req.session[resource] = null
	if (resourceSession.has(resource) && req.session[resource]) arr = await req.session[resource]
	else if (resourceJson.has(resource) && fs.existsSync(geodir+'/'+resource+'.json')) arr = await JSON.parse(await fs.readFileSync(geodir+'/'+resource+'.json', 'utf8'))
	
	if (id && arr) {
	    await arr.forEach(function(it, i, arr) {
	        if (it.id == id) item = it
		})
	} else if (arr) item = arr
	
	return await item
}

async function setGeo(geoData) {
	let country = []
	let city = []
	let region = []
	let ii = 0
	let i = 0
	if (geoData.country && geoData.country.id) {
	    if (fs.existsSync(geodir+'/country.json')) country = await JSON.parse(await fs.readFileSync(geodir+'/country.json', 'utf8')) // Читаем
	    if (country['0']) {
			ii = 0
			i = 0
			await country.forEach(function(item, i, country) {
				i++
				if (item.id == geoData.country.id) ii++
			})
			if (i-ii==i) await country.push(geoData.country)
		}
		else country['0'] = geoData.country
		fs.writeFile(geodir+'/country.json', JSON.stringify(country), 'utf8') // Записываем
	}
	if (geoData.city && geoData.city.id) {
	    if (fs.existsSync(geodir+'/city.json')) city = await JSON.parse(await fs.readFileSync(geodir+'/city.json', 'utf8')) // Читаем
	    if (city['0']) {
			ii = 0
			i = 0
			await city.forEach(function(item, i, city) {
				i++
				if (item.id == geoData.city.id) ii++
			})
			if (i-ii==i) await city.push(geoData.city)
		}
		else city['0'] = geoData.city
		fs.writeFile(geodir+'/city.json', JSON.stringify(city), 'utf8') // Записываем
	}
	if (geoData.region && geoData.region.id) {
	    if (fs.existsSync(geodir+'/region.json')) region = await JSON.parse(await fs.readFileSync(geodir+'/region.json', 'utf8')) // Читаем
	    if (region['0']) {
			ii = 0
			i = 0
			await region.forEach(function(item, i, region) {
				i++
				if (item.id == geoData.region.id) ii++
			})
			if (i-ii==i) await region.push(geoData.region)
		}
		else region['0'] = geoData.region
		fs.writeFile(geodir+'/region.json', JSON.stringify(region), 'utf8') // Записываем
	}
}

async function newOrder(req, user, resource, language_id) {
	let render = {}
	let resp
	let access_token
	let param = {}
	if (req.session.access_token) access_token = req.session.access_token
	if (req.body) param = await req.body
	if (req.session.cart) param.cart = await req.session.cart
	if (user) param.user = await user.user
	if (param.cart && param.cart['0'] && access_token) resp = await getApp(req, 'POST', '/order', '', param, access_token)
	if (resp) {
	    param.order = resp
	    console.log(resp)
	}
	//if (param.order) render = await miniRender(req, '_post', resource, metod, param, language)
	return render
}

async function orderCard(req, language_id) {
	let language = await Language(req, language_id)
	let ret = 0
	let messageId
	let template = 'admin'
	let to = 'avantis@pllano.com'
    let subject = '✔ New Order Card ✔'
	let body = {}
	let data = {}
	let arr = {}
	if (req.body) {
		body = await req.body
		let fields = new Set(['name','code','passport','phone','email'])
		for (var key in body) {
		    if (fields.has(key)) data[key] = await body[key]
		}
	}
	if (data.email) {
		arr.data = data
		messageId = sendMail(req, template, arr, to, subject, language)
		if (messageId) ret = 1
	}
	return ret
}

async function cardActivation(req, access_token, language_id) {
	let language = await Language(req, language_id)
	let render = {}
	let activation = 0
	let appGet = {}
	let userMessageId
	let userTemplate = 'card_activation'
	let userTo = 'info@pllano.com'
	let adminMessageId
	let adminTemplate = 'admin'
	let adminTo = 'avantis@pllano.com'
    let subject = '✔ PLLANO: Card Activation ✔'
	let body = {}
	let data = {}
	let arr = {}
	if (req.body) {
		body = await req.body
		let fields = new Set(['card','iname','fname','phone','email'])
		for (var key in body) {
		    if (fields.has(key)) data[key] = await body[key]
		}
	}

	// appGet = await getApp(req, 'POST', 'card-activation', '', data, access_token)					
	if (appGet.body && appGet.body.cart && appGet.body.cart.activation && appGet.body.cart.activation == 1) {
		activation = 1
	}
	activation = 1
	console.log('activation: '+activation)

	if (activation == 1) {
		arr.data = data
		console.log('data.email: '+data.email)
		if (data.email) userTo = data.email
		adminMessageId = sendMail(req, adminTemplate, arr, adminTo, subject, language)
		userMessageId = sendMail(req, userTemplate, arr, userTo, subject, language)
		render = await miniRender(req, '_post', 'card_activation', 'POST', arr, language)
	}
	console.log(render)
	return render
}

async function checkCard(req, access_token, language_id) {
	let language = await Language(req, language_id)
	let render = {}
	let check = 0
	let appGet = {}
	let adminMessageId
	let adminTemplate = 'admin'
	let adminTo = 'avantis@pllano.com'
    let subject = '✔ PLLANO: Check Card ✔'
	let body = {}
	let data = {}
	let arr = {}
	if (req.body) {
		body = await req.body
		let fields = new Set(['card','phone','email'])
		for (var key in body) {
		    if (fields.has(key)) data[key] = await body[key]
		}
	}

	// appGet = await getApp(req, 'POST', 'check-card', '', data, access_token)
	if (appGet.body && appGet.body.cart && appGet.body.cart.activation && appGet.body.cart.activation == 1) {
		check = 1
	}
	check = 1
	console.log('check: '+check)

	if (check == 1) {
		arr.data = data
		console.log('data.email: '+data.email)
		if (data.email) userTo = data.email
		adminMessageId = sendMail(req, adminTemplate, arr, adminTo, subject, language)
		render = await miniRender(req, '_post', 'check_card', 'POST', arr, language)
	}
	console.log(render)
	return render
}

// Универсальный роутер
router.all('*', async function(req, res) {
	//req.session.cookie.expires = false // This user should log in again after restarting the browser
	//req.session.cookie.maxAge = 365 * 24 * 60 * 60 * 1000 // This user won't have to log in for a year
	let cookies = new Cookies(req, res, {keys: ['cooki_js']})
	// Получаем и разбираем URL
	let original_url = await url.parse(req.originalUrl)
	let urlArr = await original_url.pathname.split('/')
	// Предусматриваем трехуровневый URL
	let resource = ''
	let alias = ''
	let resource_id
	let resource_alias
	if (urlArr[1]) resource = urlArr[1]
	if (urlArr[2]) alias = urlArr[2]
	if (urlArr[3]) resource_id = urlArr[3]
	if (urlArr[4]) resource_alias = urlArr[4]
	console.log('-----------------------------')
	console.log('method '+req.method)
	console.log('resource '+resource)
	console.log('alias '+alias)
	console.log('resource_id '+resource_id)
	console.log('sessionID: '+req.sessionID)
	let now = new Date()
	let render = 'json'
	let response = {}
	response.status = 404
	let body = {}
	let csrf = 1
	let token = 2
	let token_encrypt = ''
	let token_decrypt = ''
	let authorize = 0
	let cookie_ok = 0
	let access_token
	let arrView = {}
	let geoData = {}
	let user_ip
	let userAgent
	
	// Проверяем наличие файла session
	if (!fs.existsSync(__dirname + '/sessions/'+req.sessionID+'.json')) {
		console.log('File Session None '+__dirname + '/sessions/'+req.sessionID+'.json')
		// Хак если файл сессии удален
	    let create_session = {
	        "cookie": {"originalMaxAge": 1, "expires": Date.now(), "secure": true, "httpOnly": true, "domain": ".pllano.com", "path": "/"},
	        "__lastAccess": null,
	        "language": 'en'
		}
		fs.writeFile(__dirname + '/sessions/'+req.sessionID+'.json', JSON.stringify(create_session), 'utf8') // Записываем
	}
	
	await LanguageTest(req, res) // Определяем язык пользователя
	
	try {
		if (language_id && lang.has(language_id)) lang_id = await 'name_'+language_id
		user_ip = req.header('X-Real-IP') || req.connection.remoteAddress
		if (req.headers['user-agent']) userAgent = jsParser(req.headers['user-agent'])
		let bot = is_bot(req.headers['user-agent'])
		
		try {
			if (!bot && user_ip && fs.existsSync(geoipdir+'/'+user_ip+'.json')) geoData = await JSON.parse(await fs.readFileSync(geoipdir+'/'+user_ip+'.json', 'utf8'))
			else if (!bot && user_ip && !fs.existsSync(geoipdir+'/'+user_ip+'.json')) {
				await request({url: geo_api+'/'+user_ip, json: true}, function (error, response, geoData) {
					if (!error && response.statusCode === 200) {
						fs.writeFile(geoipdir+'/'+user_ip+'.json', JSON.stringify(geoData), 'utf8') // Записываем в локальное хранилище
						setGeo(geoData)
						//console.log(body)
					}
				})
			}
			if (geoData) {
			    if (geoData.country && geoData.country[lang_id]) country = await geoData.country[lang_id]
			    if (geoData.country && geoData.country.id) country_id = await geoData.country.id
			    if (geoData.region && geoData.region.id) region_id = await geoData.region.id
			    if (geoData.region && geoData.region[lang_id]) region = await geoData.region[lang_id]
			    if (geoData.city && geoData.city.id) city_id = await geoData.city.id
			    if (geoData.city && geoData.city[lang_id]) city = await geoData.city[lang_id]
			    if (geoData.country && geoData.country.cur_code) cur_code = await geoData.country.cur_code
			    //if (!req.session.geo) req.session.geo = await geoData
			}
		}
		catch (err) {console.log(err)}
		// console.log(geoData)
		
		if (req.session.geo) {
			if (req.session.geo.city) {
			    if (req.session.geo.city.id) city_id = req.session.geo.city.id
			    if (req.session.geo.city[lang_id]) city = req.session.geo.city[lang_id]
			}
			if (req.session.geo.country) {
			    if (req.session.geo.country[lang_id]) country = req.session.geo.country[lang_id]
			    if (req.session.geo.country.id) country_id = req.session.geo.country.id
			    if (req.session.geo.country.cur_code) cur_code = req.session.geo.country.cur_code
			}
			if (req.session.geo.region) {
			    if (req.session.geo.region.id) region_id = req.session.geo.region.id
			    if (req.session.geo.region[lang_id]) region = req.session.geo.region[lang_id]
			}
		}
		//console.log('country '+country)
		//console.log('city '+city)
		
		if (req.method == 'GET') {
			await run(req) // Проверяем авторизацию
			
			let route = '404'
			if (resource == '') route = 'index'
			else if (pathGet.has(resource)) route = await resource
			
			// method GET и нужно отдать json
			if (route == 'get') {
				//if (req.session.access_token) response.access_token = req.session.access_token // ???????????
				if (alias && resourceGetJson.has(alias)) {
					response[alias] = await getUniversal(req, alias)
					response.status = 200
				}
				else route = '404'
				// console.log(response)
			}
			// method GET для language нужно отдать json
			else if (route == 'language') {
				if (req.query.lang) language_id = req.query.lang
				if (lang.has(language_id)) req.session.language = req.query.lang
				response.lang = language_id
				response.language = await Language(req, language_id)
				response.status = 200
			}
			else {
				let content = {}
				let query = ''
				let items = {}
				let pagination = {}
				let appGet = {}
				let club = {}
				let cart = {}
				
				if (req.session.authorize) authorize = req.session.authorize
				if (req.session.cookie_ok) cookie_ok = req.session.cookie_ok
				if (req.session.access_token) access_token = req.session.access_token
				if (pathToken.has(route)) {
					token_encrypt = await tokenEncrypt(req, res)
					token_decrypt = await tokenDecrypt(token_encrypt)
				}
				
				if (authorize == 1 && req.session.cart && req.session.cart['0']) {
					cart = req.session.cart
					cookies.set('cart', 1, {signed: false, httpOnly: false})
				}
				else cookies.set('cart', 0, {signed: false, httpOnly: false})
				
				if (req.session.club && req.session.club.id) club = await req.session.club
				//console.log(club)
				
				let language = await Language(req, language_id) // Получаем массив с локализацией
				
				// Что бы уменьшить нагрузку на сервер App выполняем запросы только если пользователь авторизован
				if (authorize == 1 && access_token && language_id) {
					let param = {}
					if (language_id) param.lang = language_id
					let source = '/'
					
					if (route == 'marketplace') {
						source = '/search'
						if (req.query.query) query = req.query.query
						req.session.query = query
						if (req.session.query) param.query = req.session.query	
					}
					// req.session.authorize != 1
					if (pathApp.has(route)) {
						let dir_cache = filedir+'/'+route
						if (!fs.existsSync(dir_cache)) await fs.mkdirSync(dir_cache)
						let cache_name = await crypto.createHash('md5').update(req.originalUrl).digest("hex")
						let file_cache = await dir_cache+'/'+cache_name+'.json'
						
						
						// Проверяем наличие кэша в локальном хранилище
						if (!fs.existsSync(file_cache) || file_cache_update == 1) {
							
							appGet = await getApp(req, req.method, source, '', param, access_token)
							
							// Если ничего не найдено
							if (appGet.body && appGet.body.items && appGet.body.items.hits && appGet.body.items.hits.total == 0) {
								// Нужно перенести в function getApp() ???
								if (route == 'marketplace' && club.state) {
									let respMarketplace = await getMarketplaceApp(req, req.method, source, param, access_token, query)
									if (respMarketplace.response) appGet = respMarketplace.response
									if (respMarketplace.query) {
										req.session.query = respMarketplace.query
										query = respMarketplace.query
									}
								}
							}
							if (appGet.body && appGet.body.items) items = await appGet.body.items
							await fs.writeFileSync(file_cache, JSON.stringify(items), 'utf8') // Записываем кэш в локальное хранилище
						}
						else items = await JSON.parse(fs.readFileSync(file_cache, 'utf8')) // Читаем кэш из локального хранилища
					}
				}
				let userArr = {}
				userArr = await sessionArr(req)
				// Для шаблонизатора
				content = await getBlocks(req, route, userArr, language)
				arrView = {
					'resource': resource,
					'alias': alias,
					'resource_id': resource_id,
					'resource_alias': resource_alias,
					'request_number': request_number,
					'query': query,
					'authorize': authorize,
					'cookie_ok': cookie_ok,
					'language_id': language_id,
					'user': userArr,
					'content': content,
					'items': items,
					'pagination': pagination,
					'token': token_encrypt,
					'bot': bot,
					'cur_code': cur_code,
					'country': country,
					'country_id': country_id,
					'city': city,
					'city_id': city_id,
					'region': region,
					'region_id': region_id,
					'cart': cart,
					'user_agent': userAgent,
					'config': config['config'],
					'language': language
				}
				render = 'twig' // Отдать на рендер шаблонизатору twig
			}
		}
		else if (req.method == 'POST' && pathPost.has(resource)) {
			
			let user = {
			    'user_ip': user_ip,
			    'cur_code': cur_code,
			    'country': country,
			    'country_id': country_id,
			    'city': city,
			    'city_id': city_id,
			    'region': region,
			    'region_id': region_id
			}
			if (req.body) body = await req.body
			if (body.csrf) {csrf = await decrypt(body.csrf, dirkey+'private.pem')}
			if (req.session.token) {token = await req.session.token}
			
			if (resource == 'language' && body.id) {
				let lang = await setLanguage(req, body.id)
				if (body.id == lang) response.status = 200
			}
			else if (resource == 'logout' && token == csrf) {
				logout(req)
				response.status = 200
			}
			else if (resource == 'login' && token == csrf) {
				await login(req)
				if (req.session.authorize == 1) response.status = 200
			}
			else if (resource == 'cart' && body.id && token == csrf) {
				response.render = await postUniversal(req, resource, null, null, language_id)
				if (response.render) response.status = 200
				else response.status = 400
			}
			else if (resource == 'order' && token == csrf) {
			    response.cart = await newOrder(req, user, resource, language_id)
				if (response.cart) response.status = 200
				else response.status = 400
			}
			else if (resource == 'order-card' && token == csrf) {
				console.log('order-card')
			    response.card = await orderCard(req, language_id)
				if (response.card && response.card == 1) response.status = 200
				else response.status = 400
			}
			else if (resource == 'card-activation' && token == csrf) {
				console.log('card-activation')
			    response.html = await cardActivation(req, access_token, language_id)
				if (response.html) response.status = 200
				else response.status = 400
			}
			else if (resource == 'check-card' && token == csrf) {
				console.log('check-card')
			    response.html = await checkCard(req, access_token, language_id)
				if (response.html) response.status = 200
				else response.status = 400
			}
			console.log(response)
			//console.log('resource '+resource)
		}
		
		let log = {
			'date': dateFormat(now, "d-mm-yyyy h:MM:ss"),
			'method': req.method,
			'render': render,
			'resource': resource,
			'originalUrl': req.originalUrl,
			'user_ip': user_ip,
			'bot': bot,
			'cur_code': cur_code,
			'country': country,
			'country_id': country_id,
			'city': city,
			'city_id': city_id,
			'region': region,
			'region_id': region_id,
			'user_agent': userAgent,
			'token': token,
			'csrf': csrf,
			'body': body,
			//'response': response,
			'language_id': language_id,
			//'session_language': req.session.language,
			//'access_token': req.session.access_token,
			'token_decrypt': token_decrypt,
			//'session_views': req.session.views,
			'sessionID': req.sessionID
		}
		if (console_log == 1) console.log(log)
		if (file_log == 1) {
			let y = logdir+'/'+dateFormat(now, "yyyy")
			let m = y+'/'+dateFormat(now, "m")
			let d = m+'/'+dateFormat(now, "d")
			if (!fs.existsSync(y)) fs.mkdirSync(y)
			if (!fs.existsSync(m)) fs.mkdirSync(m)
			if (!fs.existsSync(d)) fs.mkdirSync(d)
			let date = dateFormat(now, "TT-h:MM:ss")
			let filelog = d+'/'+user_ip+'.json'
			if (fs.existsSync(filelog)) {
				fs.appendFile(filelog, `,\n${JSON.stringify(log)}`, function (err) {
					if (err) throw err
					console.log('Saved Log: '+user_ip+'.json')
				})
				// fs.appendFileSync(filelog, `,\n${JSON.stringify(log)}`)
				} else {
				console.log('Create Log: '+user_ip+'.json')
				fs.writeFileSync(filelog, JSON.stringify(log), 'utf8') // Создаем
			}
		}
	}
	catch (err) {console.log(err)}
	
	if (render == 'twig') res.render('layout.twig', arrView)
	else res.status(200).header('Content-Type', 'application/json').send(JSON.stringify(response))
	// else if (render == 'redirect') res.redirect('/all.html')
})

// Запускаем
var server = router.listen(3000, 'localhost', function () {
	var host = server.address().address
	var port = server.address().port
	console.log('Example app listening at http://%s:%s', host, port)
})
