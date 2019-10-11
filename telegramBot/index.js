// Подключаем файловый менеджер
const fs = require('fs-extra') // Файловый менеджер // const fs = require('fs')
const promise = require('promise') // https://www.npmjs.com/package/promise
// Конфигурация - глобальные переменные
let config = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf8'))
// Директории
config.dir = {}
config.dir.file = __dirname + config.global['filedir']
config.dir.key = __dirname + config.global['dirkey']
config.dir.geo = config.dir.file+'/geo'
config.dir.message = config.dir.file+'/message'
config.dir.geoip = config.dir.geo+'/ip'
config.dir.language = config.dir.file+'/language'
config.dir.log = config.dir.file+'/log'
config.dir.user = config.dir.file + '/user_data'
config.dir.alias = config.dir.user + '/alias'
config.dir.telegram = config.dir.user + '/telegram'
config.geo = {}
config.geo.api = 'http://de.sxgeo.city/json/'
config.geo.ipinfo = 'https://ipinfo.io/json'
// Проверяем наличие директорий, если нет создаем
for (var key in config.dir) {
    if (!fs.existsSync(config.dir[key])) fs.mkdirSync(config.dir[key])
			// console.log(body[key])
}
// Конфигурация - простые переменные
const dateFormat = require('dateformat')
let date = Date.now()
let control_cache = {'time': date + 1000 * 60 * 60 * 24 * 1} // Время жизни кэша Один день
let lang = new Set(['en', 'ru', 'ua', 'pl', 'de'])
let request_number = 0 // Количество запросов к App
// Стронние модули
const http = require('http') // https://www.npmjs.com/package/http
const requestPromise = require('request-promise') // https://www.npmjs.com/package/request-promise
const request = require('request')
const uuid = require('uuid')
const crypto = require('crypto')
const CryptoJS = require("crypto-js")
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const jsParser = require('ua-parser-js')
const bodyParser = require('body-parser')
const helmet = require('helmet')
const path = require('path')
const url = require('url')
const httpBuildQuery = require('http-build-query') // $ npm install http-build-query // https://www.npmjs.com/package/http-build-query
const Cookies = require('cookies')
const cookie = require('js-cookie')
const nodemailer = require("nodemailer")
const pagination = require('pagination')
const cookieParser = require('cookie-parser')

const express = require('express') // https://www.npmjs.com/package/express
const router = express() // https://expressjs.com/ru/starter/hello-world.html
const Twig = require('twig'), twig = Twig.twig // Подключаем шаблонизатор - Twig
// Конфигурация express
router.use(express.static(__dirname + '/../pllano.com')) // Устанавливаем глобальную папку в которой храним файлы
router.use(cookieParser())
router.use(helmet())
router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())
router.use(session({ // Сессия пользователя
	name: 'session',
	genid: function(req) {return uuid.v4()},
	store: new FileStore(),
	secret: fs.readFileSync(config.dir.key + '/session.txt', 'utf8'),
	proxy: true,
	resave: false,
	saveUninitialized: true,
	cookie: { domain: '.pllano.com', maxAge: 365 * 24 * 60 * 60 * 1000, secure: true }
}))
router.set('views', __dirname + '/views') // Устанавливаем папку в которой храним шаблоны
router.set('view engine', 'twig')
router.set('twig options', {allow_async: true, strict_variables: false, autoescape: false})
router.set('trust proxy', true)

// Наши модули
const Plugin = require('./plugin.js')
let doctor = new Plugin(config)
// const greeting = require('./greeting.js')
// console.log(greeting.getMessage('test'))
// const Users = require('./user.js')
// let eugene = new Users("Eugene", 32)
// eugene.sayHi()
// eugene.displayInfo()

// Базы MySql
const mysql = require('mysql') // https://www.npmjs.com/package/mysql
const mysqlPromise = require('mysql2/promise') // https://www.npmjs.com/package/mysql2
let database = {}
database.mysql = {}
database.mysql.localhost = {connectionLimit: 10, host: config.mysql['host'], port: config.mysql['port'], user: config.mysql['user'], password: config.mysql['password'], database: config.mysql['database']}
database.mysql.promise = {connectionLimit: 10, host: config.mysql['host'], port: config.mysql['port'], user: config.mysql['user'], password: config.mysql['password'], database: config.mysql['database'], Promise: promise}
database.mysql.sms = {connectionLimit: 10, host: config.sms['host'], user: config.sms['user'], password: config.sms['password'], database: config.sms['database']} // https://turbosms.ua/sql.html

async function db(sql, value) {
	let DB = await mysqlPromise.createConnection(database.mysql.promise)
	let rows = []
	if (value) rows = await DB.execute(sql, value)
	else rows = await DB.execute(sql)
	return rows	
	/*
		
			// https://github.com/mysqljs/mysql#getting-the-id-of-an-inserted-row
	// 'INSERT INTO `pllano_sms` SET ?', {number: number, sign: 'PLLANO', message: message}
	// let rows = await db('SELECT * FROM `api` WHERE `state` = ? AND `user_id` = ? LIMIT 0, 1', [1, 4000])
	// 'SELECT COUNT(*) FROM `'+table+'` WHERE `'+field+'` = '+value+' AND `'+field_2+'` = '+value_2+' AND `'+field_2+'` LIKE %'+unit+'%'
	// 'SELECT `id`, `site_id`, `user_id`, `supplier_id`, `seller_id`, `public_key` FROM `api` WHERE 1'
	// 'SELECT * FROM `api`'
	// 'SELECT * FROM `api` WHERE `state` = 1
	// 'SELECT * FROM `api` ORDER BY `api`.`site_id` ASC'
	// 'SELECT * FROM `api` WHERE `state` = 1 ORDER BY `api`.`user_id` ASC'
		try {
		let create = db('CREATE TABLE `pllano`.`payment` (`id` INT(11) NOT NULL AUTO_INCREMENT , `user_id` INT(11) NOT NULL DEFAULT 0 , `userdata_id` INT(11) NOT NULL DEFAULT 0 , `liqpay_order_id` VARCHAR(64) NOT NULL , `order_id` VARCHAR(64) NOT NULL , `paytype` VARCHAR(32) NOT NULL , `type` VARCHAR(32) NOT NULL , `status` VARCHAR(32) NOT NULL , `action` VARCHAR(32) NOT NULL , `ip` VARCHAR(64) NOT NULL , `currency` VARCHAR(16) NOT NULL , `language` VARCHAR(16) NOT NULL , `sender_card_bank` VARCHAR(64) NOT NULL , `sender_card_country` VARCHAR(64) NOT NULL , `sender_card_mask2` VARCHAR(64) NOT NULL , `sender_card_type` VARCHAR(64) NOT NULL , `sender_first_name` VARCHAR(64) NOT NULL , `sender_last_name` VARCHAR(64) NOT NULL , `sender_phone` VARCHAR(64) NOT NULL , `payment_id` INT(11) NOT NULL DEFAULT 0 , `transaction_id` INT(11) NOT NULL DEFAULT 0 , `acq_id` INT(11) NOT NULL DEFAULT 0 , `mpi_eci` INT(11) NOT NULL DEFAULT 0 , `version` INT(11) NOT NULL DEFAULT 3 , `amount` FLOAT(11,2) NOT NULL DEFAULT 0.00 , `amount_bonus` FLOAT(11,2) NOT NULL DEFAULT 0.00 , `amount_credit` FLOAT(11,2) NOT NULL DEFAULT 0.00 , `amount_debit` FLOAT(11,2) NOT NULL DEFAULT 0.00 , `commission_credit` FLOAT(11,2) NOT NULL DEFAULT 0.00 , `commission_debit` FLOAT(11,2) NOT NULL DEFAULT 0.00 , `agent_commission` FLOAT(11,2) NOT NULL DEFAULT 0.00 , `receiver_commission` FLOAT(11,2) NOT NULL DEFAULT 0.00 , `sender_bonus` FLOAT(11,2) NOT NULL DEFAULT 0.00 , `sender_commission` FLOAT(11,2) NOT NULL DEFAULT 0.00 , `is_3ds` BOOLEAN NOT NULL , `public_key` VARCHAR(64) NOT NULL , `token` VARCHAR(256) NOT NULL , `verifycode` VARCHAR(256) NOT NULL , `currency_debit` VARCHAR(16) NOT NULL , `currency_credit` VARCHAR(16) NOT NULL , `authcode_credit` VARCHAR(128) NOT NULL , `authcode_debit` VARCHAR(128) NOT NULL , `card_token` VARCHAR(256) NOT NULL , `completion_date` VARCHAR(64) NOT NULL , `create_date` VARCHAR(64) NOT NULL , `end_date` VARCHAR(64) NOT NULL , `refund_date_last` VARCHAR(64) NOT NULL , `rrn_credit` VARCHAR(64) NOT NULL , `rrn_debit` VARCHAR(64) NOT NULL , `customer` VARCHAR(128) NOT NULL , `description` VARCHAR(256) NOT NULL , `err_code` VARCHAR(32) NOT NULL , `err_description` VARCHAR(256) NOT NULL , `info` VARCHAR(256) NOT NULL , `redirect_to` VARCHAR(256) NOT NULL , `err_erc` VARCHAR(256) NOT NULL , `created` DATETIME NOT NULL, `state` INT(5) NOT NULL DEFAULT 1 , PRIMARY KEY (`id`)) ENGINE = InnoDB')
		} catch (err) {
		// console.log(err)
		}
		
		let post = {
		"status": "sandbox", // String - Статус платежа
		"action": "subscribe", // String - Тип операции. Возможные значения: pay - платеж, hold - блокировка средств на счету отправителя, paysplit - расщепление платежа, subscribe - создание регулярного платежа, paydonate - пожертвование, auth - предавторизация карты, regular - регулярный платеж
		"authcode_credit": '', // String - Код авторизации по транзакции credit
		"authcode_debit": '', // String - Код авторизации по транзакции debit
		"card_token": '', // String - Token карты оправителя
		"completion_date": '', // String - Дата списания средств
		"create_date": 1555589688665, // String - Дата создания платежа
		"currency": "USD", // String - Валюта платежа
		"currency_debit": "UAH", // String - Валюта транзакции debit
		"currency_credit": "UAH", // String - Валюта транзакции credit
		"customer": "", // String - Уникальный идентификатор пользователя на сайте мерчанта. Максимальная длина 100 символов
		"description": "PLLANO Gold", // String - Комментарий к платежу
		"end_date": 1555589694673, // String - Дата завершения/изменения платежа
		"err_code": "", // String - Код ошибки
		"err_description": "", // String - Описание ошибки
		"info": "", // String - Дополнительная информация о платеже
		"ip": "", // String - IP адрес отправителя
		"liqpay_order_id": "W5SLDBTE1555589694653659", // String - Order_id платежа в системе LiqPay
		"order_id": "eac48802a562f812", // String - Order_id платежа
		"paytype": "privat24", // String - Способ оплаты. Возможные значения card - оплата картой, liqpay - через кабинет liqpay, privat24 - через кабинет приват24, masterpass - через кабинет masterpass, moment_part - рассрочка, cash - наличными, invoice - счет на e-mail, qr - сканирование qr-кода.
		"public_key": "i66004736553", // String - Публичный ключ магазина
		"redirect_to": "", // String - Ссылка на которую необходимо перенаправить клиента для прохождения 3DS верификации
		"refund_date_last": "", // String - Дата последнего возврата по платежу
		"rrn_credit": "", // String - Уникальный номер транзакции в системе авторизации и расчетов обслуживающего банка Retrieval Reference number
		"rrn_debit": "", // String - Уникальный номер транзакции в системе авторизации и расчетов обслуживающего банка Retrieval Reference number
		"sender_card_bank": "pb", // String - Банк отправителя
		"sender_card_country": 804, // String - Страна карты отправителя. Цифровой ISO 3166-1 код
		"sender_card_mask2": "414960*23", // String - Карта отправителя
		"sender_card_type": "visa", // String - Тип карты отправителя MC/Visa
		"sender_first_name": "Руслан", // String - Имя отправителя
		"sender_last_name": "Плысюк", // String - Фамилия отправителя
		"sender_phone": "380674422991", // String - Телефон отправителя
		"type": "buy", // String - Тип платежа
		"token": '', // String - Token платежа
		"verifycode": '', // String - Код верификации
		"err_erc": '', // String - Код ошибки
		//"is_3ds": false, // Boolean - Возможные значения: true - транзакция прошла с 3DS проверкой, false - транзакция прошла без 3DS проверки
		"acq_id": 414963, // Number - ID эквайера
		"agent_commission": 0, // Number - Комиссия агента в валюте платежа
		"amount": 0.03, // Number - Сумма платежа
		"amount_bonus": 0, // Number - Бонус отправителя в валюте платежа debit
		"amount_credit": 0.81, // Number - Сумма транзакции credit в валюте currency_credit
		"amount_debit": 0.81, // Number - Сумма транзакции debit в валюте currency_debit
		"mpi_eci": 7, // Number - Возможные значения: 5 - транзакция прошла с 3DS (эмитент и эквайер поддерживают технологию 3D-Secure), 6 - эмитент карты плательщика не поддерживает технологию 3D-Secure, 7 - операция прошла без 3D-Secure
		"commission_credit": 0.02, // Number - Комиссия с получателя в валюте currency_credit
		"commission_debit": 0, // Number - Комиссия с отправителя в валюте currency_debit
		"payment_id": 1002024590, // Number - Id платежа в системе LiqPay
		"transaction_id": 1002024590, // Number -
		"receiver_commission": 0, // Number - Комиссия с получателя в валюте платежа
		"sender_bonus": 0, // Number - Бонус отправителя в валюте платежа
		"sender_commission": 0, // Number - Комиссия с отправителя в валюте платежа
		"version": 3, // Number - Версия API. Текущее значение - 3
		"language": "ru"
		}
		
	*/
}

/* Elastic Search DB
	elastic_log - пишем логи в Elastic или нет 0 или 1
	elastic - Через что мы пишем в elastic Elastic
*/
const elasticsearch = require('elasticsearch')
let client = new elasticsearch.Client({
	host: 'localhost:9200',
	//log: 'trace'
})
/** elasticsearch (local & app)
	** let elastic = elasticApp(index, type)
	** elastic.search(body)
	** elastic.get(id)
	** elastic.index(body)
	** elastic.index(body, id)
**/
let elasticApp = async function(index, type) {
	let connect = config.elastic['db']
	let ignore = {ignore: [404], maxRetries: 3}
	let elastic_ping = false
	if (connect == 'local') {
		try {
			elastic_ping = await client.ping()
		}
		catch (err) {
			// console.log(err)
		}
		if (elastic_ping === false) {
			let sender = new Sms()
			send.admin(config.admin['phone'], 'elasticsearch is down', date)
		}
	}
	
	this.search = async function(body) {
		let result
		let arr = {}
		arr.index = 'log'
		arr.type = 'doc'
		if (index) arr.index = index
		if (type) arr.type = type
		arr.body = body
		if (connect == 'local' && elastic_ping === true) result = await client.search(arr, ignore)
		else if (connect == 'app') {
			arr.metod = 'get'
			arr.token = config.push['elastic_token']
			result = await getApp(null, 'GET', '/push', '', arr) // Через API
		}
		return result
	}
	
	this.get = async function(id) {
		let result
		let arr = {}
		arr.index = 'log'
		arr.type = 'doc'
		if (index) arr.index = index
		if (type) arr.type = type
		if (id) arr.id = id
		if (connect == 'local' && elastic_ping === true) result = await client.get(arr, ignore)
		else if (connect == 'app') {
			arr.metod = 'get'
			arr.token = config.push['elastic_token']
			result = await getApp(null, 'GET', '/push', '', arr) // Через API
		}
		return result
	}
	
	this.index = async function(body, id) {
		let result
		let arr = {}
		arr.index = 'log'
		arr.type = 'doc'
		if (index) arr.index = index
		if (type) arr.type = type
		if (id) arr.id = id
		arr.body = body
		if (connect == 'local' && elastic_ping === true) result = await client.index(arr, ignore)
		else if (connect == 'app') {
			arr.token = config.push['elastic_token']
			result = await getApp(null, 'POST', '/push', '', arr) // Через API
		}
		return result
	}
	
	return this
}

// Работаем с пользователем
let User = function() {
	// Поля пользователя которые нам нужны
	let fields = new Set(['subscribe','geo','user_alias','user_role','email','phone','iname','fname','bonus_code','referral_code','partner','seller','fb_id','google_id','telegram_id'])
	// Запускаем сессию пользователя и проверяем авторизацию
    this.run = async function userRun(req) {
	    let resp = {}
	    try {
		if (req.session.views) req.session.views++
		else req.session.views = 1
		
		let access_token
		if (req.session.access_token) access_token = req.session.access_token
		else {
			let token = crypto.randomBytes(64).toString('hex')
			req.session.access_token = token
			access_token = token
		}
		if (access_token && req.session.authorize != 1) {
			let requestArr = await getApp(req, 'GET', '/auth', '', null, access_token)
			let user = {}
			if (requestArr.body) user = await requestArr.body.user
			let response = {}
			if (requestArr.response) response = await requestArr.response
			if (user.user_alias) {
				if (response.authorization && response.authorization == 1) req.session.authorize = 1
				for (var key in user) {
					if (config.userFields.has(key)) req.session[key] = user[key]
				}
			}
			if (response.access_token) req.session.access_token = response.access_token
			if (response.refresh_token) req.session.access_token = response.refresh_token
		}
		// Получаем из сессии данные пользователя и переводим в обьект
		function sessionArr(req) {
		    let requ = {}
		    let sessionFields = new Set(['subscribe','geo','oauth','authorize','language','access_token','user_alias','user_role','email','phone','iname','fname','bonus_code','referral_code','partner','seller','fb_id','google_id','telegram_id'])
		    for (var key in req.session) {
		        if (fields.has(key)) requ[key] = req.session[key]
		    }
		    return requ
		}
		
		if (req.session.authorize && req.session.authorize == 1) resp = await sessionArr(req)
		if (!req.session.access_token) req.session.regenerate(function(err) {})
	    }
	    catch (err) {
		req.session.regenerate(function(err) {
			// will have a new session here
		})
	    }
	    return resp
    }
	
	// Авторизация и Регистрация
	this.login = async function(req) {
	    try {
		if (req.body && req.body.oauth) {
			let body = req.body
			let param = {}
			let loginFields = new Set(['oauth','token','email','phone','iname','fname','password'])
			for (var key in body) {
				if (loginFields.has(key)) param[key] = await doctor.clean(body[key])
			}
			if (param.oauth == 'sign-in' || param.oauth == 'sign-up') param.oauth = 'password'
			let requestArr = await getApp(req, 'POST', '/auth', '', param)
			if (requestArr.body && requestArr.body.user && requestArr.body.user.user_alias) {
				let user = requestArr.body.user
				for (var key in user) {
					if (fields.has(key)) req.session[key] = user[key]
				}
				req.session.oauth = body.oauth
				if (requestArr.response && requestArr.response.authorization && requestArr.response.authorization == 1) req.session.authorize = 1
			}
			if (requestArr.response && requestArr.response.access_token) req.session.access_token = requestArr.response.access_token
		}
	    }
	    catch (err) {
		    console.log(err)
	    }
		
	}
	
	// Выйти
	this.logout = function(req) {
	    req.session.destroy(function(err) {
		    console.log(err)
	    })
	}
	
	return this
}

// Каркас Api
let Api = function() {
	// this.host = "https://pllano.com/api"
	this.host = host
	this.order = function() {
		this.post = function(data) {
			let res
			
			return res
		}
		
		this.get = function(data) {
			let res
			
			return res
		}
		return this
	}
	return this
}

/** Отправка СМС
	** 
**/
let Sms = function() {
	// SMS администратору
    this.admin = function(number, message, date_control) {
	    let TelegramBot = require('node-telegram-bot-api')
	    let botTelegram = new TelegramBot(config.telegram['token'], {polling: true, startgroup: true}) // Подключаемся к боту
	    // http://qaru.site/questions/1646248/getting-the-users-last-seen-from-a-telegram-bot
	    // https://core.telegram.org/type/ContactStatus
	    // https://core.telegram.org/method/contacts.getStatuses
	    botTelegram.sendMessage(711610523, message)
	    let send = 0
	    if (date_control) {
			let file_message = config.dir.message+'/'+number+'.json'
			if (!fs.existsSync(file_message)) {
				fs.writeFileSync(file_message, JSON.stringify({'date': date_control, 'number': number, 'message': message}), 'utf8') // Записать
				send = 1
			}
			else {
				let data = JSON.parse(fs.readFileSync(file_message, 'utf8')) // Читаем
				let test_date = (Number(data.date) + Number(60*60*1000))
				if (Number(test_date) <= Number(date_control)) {
					fs.writeFileSync(file_message, JSON.stringify({'date': date_control, 'number': number, 'message': message}), 'utf8') // Записать
					send = 1
				}
				console.log('data.date '+(+data.date))
				console.log('date_control '+ Number(date_control))
				console.log('test_date '+ Number(test_date))
			}
		} else send = 1
		
	    if (send == 1) {
		    console.log('send 1')
		    try {
			    let sms_db = mysql.createConnection(database.mysql.sms)
			    sms_db.connect()
			    sms_db.query('INSERT INTO pllano_sms SET ?', {number: number, sign: 'PLLANO', message: message}, function (error, results, fields) {
				    console.log('insertId '+results.insertId)
				    if (error) throw error;
				})
			    sms_db.end()
			}
			catch (err) {
			    console.log(err)
			}
		}
	}
	this.user = function(number, message) {
		try {
		    let sms_db = mysql.createConnection(database.mysql.sms)
		    sms_db.connect()
		    sms_db.query('INSERT INTO pllano_sms SET ?', {number: number, sign: 'PLLANO', message: message}, function (error, results, fields) {
		        console.log('insertId '+results.insertId)
		        if (error) throw error;
			})
		    sms_db.end()
		}
		catch (err) {
		    console.log(err)
		}
	}
	return this
}

// Для тестов: Рабочий метод
let promiseRequest = function(options) {
	return new Promise((resolve, reject) => {
		request(options, (error, response, body) => {
			if (response) return resolve(response)
			if (error) return reject(error)
		})
	})
}

/* Универсальная функия обращения к Pllano App
	
*/
async function getApp(req, method, source, id, param, access_token) {
	let resp = {}
	let param_get = ''
	let source_id = ''
	let options = {}
	if (id) source_id = '/'+id
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
	let urlApp = config.global['pllano_app']+''+source+''+source_id+''+param_get
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
	if (req && resp && resp.response && resp.response.refresh_token) req.session.access_token = resp.response.refresh_token
	
	return resp
}

/* Повторный поиск товаров через APP
	
*/
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

/* Операции с информацией по IP адресу
	Смотрим в локальном хранилище, если нет получаем через API
	geo_api = 'http://de.sxgeo.city/json/'
*/
async function geo(req, user_ip, bot, language_id) {
	// Личная база: country, region, city - Сохранение и проверка
	// Смотрим в локальном хранилище, если нет сохраняем в файл данные из geoData
    async function setGeo(geoData) {
	let country = []
	let city = []
	let region = []
	let ii = 0
	let i = 0
	if (geoData.country && geoData.country.id) {
		if (fs.existsSync(config.dir.geo+'/country.json')) country = JSON.parse(await fs.readFileSync(config.dir.geo+'/country.json', 'utf8')) // Читаем
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
		fs.writeFile(config.dir.geo+'/country.json', JSON.stringify(country), 'utf8') // Записываем
	}
	if (geoData.city && geoData.city.id) {
		if (fs.existsSync(config.dir.geo+'/city.json')) city = JSON.parse(await fs.readFileSync(config.dir.geo+'/city.json', 'utf8')) // Читаем
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
		fs.writeFile(config.dir.geo+'/city.json', JSON.stringify(city), 'utf8') // Записываем
	}
	if (geoData.region && geoData.region.id) {
		if (fs.existsSync(config.dir.geo+'/region.json')) region = JSON.parse(await fs.readFileSync(config.dir.geo+'/region.json', 'utf8')) // Читаем
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
		fs.writeFile(config.dir.geo+'/region.json', JSON.stringify(region), 'utf8') // Записываем
	}
    }
	try {
		let geoData = {}
		
		if (!bot && user_ip && fs.existsSync(config.dir.geoip+'/'+user_ip+'.json')) {
			geoData = JSON.parse(await fs.readFileSync(config.dir.geoip+'/'+user_ip+'.json', 'utf8'))
		}
		else if (!bot && user_ip && !fs.existsSync(config.dir.geoip+'/'+user_ip+'.json')) {
			await request({url: config.geo.api+'/'+user_ip, json: true}, function (error, response, geoData) {
				if (!error && response.statusCode === 200) {
					fs.writeFile(config.dir.geoip+'/'+user_ip+'.json', JSON.stringify(geoData), 'utf8') // Записываем в локальное хранилище
					setGeo(geoData)
					//console.log(body)
				}
			})
		}
		
		if (geoData) {
			//let lang_id = 'name_en'
			//if (language_id && lang.has(language_id)) lang_id = await 'name_'+language_id
			
			req.session.geo = {}
			req.session.geo.country = {}
			req.session.geo.region = {}
			req.session.geo.city = {}
			
			if (geoData.country) {
				if (geoData.country.name_en) req.session.geo.country.name_en = await geoData.country.name_en
				else if (geoData.country.name_en) req.session.geo.country.name_en = await geoData.country.name_en
				if (geoData.country.id) req.session.geo.country.id = await geoData.country.id
				if (geoData.country.cur_code) req.session.geo.country.cur_code = await geoData.country.cur_code
			}
			if (geoData.region) {
				if (geoData.region.name_en) req.session.geo.region.name_en = await geoData.region.name_en
				else if (geoData.region.name_en) req.session.geo.region.name_en = await geoData.region.name_en
				if (geoData.region && geoData.region.id) req.session.geo.region.id = await geoData.region.id
			}
			if (geoData.city) {
				if (geoData.city.name_en) req.session.geo.city.name_en = await geoData.city.name_en
				else if (geoData.city.name_en) req.session.geo.city.name_en = await geoData.city.name_en
				if (geoData.city.id) req.session.geo.city.id = await geoData.city.id
			}
		}
	}
	catch (err) {console.log(err)}
}

/* Функция получения локализации в нужном языке
	
*/
async function Language(req, lg) {
	let language = {}
	let param = {}
	let lang = new Set(['en', 'ru', 'ua', 'pl', 'de'])
	//console.log('lg '+lg)
	if (lang.has(lg)) {
		if (!fs.existsSync(config.dir.language)) fs.mkdirSync(config.dir.language)
		let file_cache = config.dir.language+'/'+lg+'.json'
		//console.log(config.dir.language)
		// Проверяем наличие file в локальном хранилище
		if (!fs.existsSync(file_cache) || config.global['file_cache_update'] == 1) {
			//console.log(file_cache)
			param = {'lang': lg}
			// Получаем язык по API
			let requestArr = await getApp(req, 'GET', '/language', '', param)
			if (requestArr.body && requestArr.body.language) language = await requestArr.body.language
			// Записываем в локальное хранилище
			await fs.writeFileSync(file_cache, JSON.stringify(language), 'utf8') // Записать файл
		}
		else language = JSON.parse(fs.readFileSync(file_cache, 'utf8')) // Читаем из локального хранилища
	}
	// console.log(language)
	return language
}

/* Функция проверки языка у пользователя
	
*/
async function languageTest(req, res) {
	let language_id = config['language']
	if (req.session.language) language_id = req.session.language
	else if (req.acceptsLanguages('ua', 'ru', 'en', 'de', 'pl')) language_id = req.acceptsLanguages('ua', 'ru', 'en', 'de', 'pl')
	if (!lang.has(language_id)) req.session.language = 'ru' // Проверяем язык в сессии, если локализации нет выставляем русский
	else req.session.language = language_id
	return req.session.language
}

/* Изменение языка пользователя
	Сохраняем выбранный язык в сессию
*/
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

/* Формируем блоки для шаблонизатора
	
*/
function getBlocks(req, route, id, user, language) {
	let b = {}
	b.og = {}
	let authorize = user.authorize
	let subscription = {}
	let partner = 0
	let seller = 0
	
	b.template = config['site']['template']
	b.alias = req.originalUrl
	b.robots = 'index, follow'
	b.blocks = []
	b.blocks["0"] = {'name': b.template+'/head.html'}
	b.blocks["1"] = {'name': b.template+'/index/index.html'}
	b.blocks["2"] = {'name': b.template+'/nav.html'}
	b.blocks["3"] = {'name': b.template+'/footer.html'}
	b.blocks["4"] = {'name': b.template+'/js.html'}
	
	if (authorize == 1) {
		b.robots = 'noindex, nofollow'
		if (user.subscription && user.subscription.id) subscription = user.subscription
		if (user.partner && user.partner == 1) partner = 1
		if (user.seller && user.seller == 1) seller = 1
		
		if (route == 'sign-in') route = 'index'
		else if (route == 'sign-up') route = 'index'
	}
	else {
		if (route == 'order') route = '404'
		else if (route == 'cart') route = '404'
		else if (route == 'wishlist') route = '404'
		else if (route == 'collection') route = '404'
		else if (route == 'subscription') route = 'sign-in'
	}

	b.name = 'PLLANO Marketplace'
	
	if (route == '404') b.name = language['447'] // Ошибка 404
	else if (route == 'index') {
		b.name = ''
		if (subscription.state == 1 && authorize == 1) b.name = language['972']
		else if (authorize == 1) b.name = language['974']
	}
	else if (route == 'marketplace') {
		b.og.image = 'img/marketplace/pllano-card-social-network.png'
	}
	else if (route == 'cart') b.name = language['23']
	else if (route == 'gold') b.name = 'PLLANO Gold: '+language['49']
	else if (route == 'platinum') b.name = 'PLLANO Platinum: '+language['972']
	else if (route == 'subscription') b.name = language['238']
	else if (route == 'order-card') b.name = language['571'] + ' - ' + language['660']
	else if (route == 'contact') b.name = language['105'] + ' - ' + language['660']
	//else if (route == 'about-us') b.name = language['404']
	else if (route == 'terms-of-use') b.name = language['504'] + ' - ' + language['660']
	else if (route == 'privacy-policy') b.name = language['406'] + ' - ' + language['660']
	//else if (route == 'for-partners') b.name = language['963']
	//else if (route == 'for-banks') b.name = language['961']
	
	// По умолчанию если не задано
	if (!b.h1) b.h1 = b.name
	if (!b.title) b.title = b.name
	if (!b.description) b.description = b.name
	if (!b.keywords) b.keywords = b.name
	if (!b.og.title) b.og.title = b.name
	if (!b.og.description) b.og.description = b.name
	
	// Список ресурсов статей, не запрашиваем API
	let pathStatic = new Set([
	    'subscription',
	    'contact',
	    'about-us',
	    'terms-of-use',
	    'privacy-policy',
	    'for-partners',
	    'for-banks',
	])
	
	if (route == '404') {
		delete b.blocks
		b.blocks = []
		b.blocks["0"] = {'name': b.template+'/404.html'}
	}
	else if (route == 'index') {
		if (authorize == 1) b.blocks["1"] = {'name': b.template+'/index/index-authorize.html'}
	}
	else if (route == 'marketplace') {
		b.blocks["1"] = {'name': b.template+'/article/marketplace.html'}
		if (authorize == 1) {
			if (id && id != '') b.blocks["1"] = {'name': b.template+'/marketplace/product.html'}
			else b.blocks["1"] = {'name': b.template+'/marketplace/product-list.html'}
		}
	}
	else if (route == 'gold') {
		b.blocks["1"] = {'name': b.template+'/article/gold.html'}
		//if (authorize == 1) b.blocks["1"] = {'name': b.template+'/marketplace/product-list.html'}
	}
	else if (route == 'platinum') {
		b.blocks["1"] = {'name': b.template+'/article/platinum.html'}
		//if (authorize == 1) b.blocks["1"] = {'name': b.template+'/marketplace/product-list.html'}
	}
	else if (route == 'subscription') {
		if (authorize == 1) b.blocks["1"] = {'name': b.template+'/subscription/subscribe.html'}
	}
	else if (route == 'cart') {
		b.blocks["1"] = {'name': b.template+'/index/index.html'}
		if (authorize == 1) b.blocks["1"] = {'name': b.template+'/order/cart.html'}
	}
	else if (pathStatic.has(route)) b.blocks["1"] = {'name': b.template+'/article/'+route+'.html'}
	else if (route == 'card-activation') {
		b.blocks["1"] = {'name': b.template+'/activation/card-activation.html'}
		if (authorize == 1) b.blocks["1"] = {'name': b.template+'/activation/card-activation.html'}
	}
	else if (route == 'check-card') {
		b.blocks["1"] = {'name': b.template+'/activation/check-card.html'}
	}
	else if (route == 'sign-in' || route == 'sign-up') {
		delete b.blocks
		b.blocks = []
		b.blocks["0"] = {'name': b.template+'/head.html'}
		b.blocks["1"] = {'name': b.template+'/'+route+'.html'}
		b.blocks["2"] = {'name': b.template+'/js.html'}
	}
	
	b.route = route
	return b
}

/* Рендер html ответов для POST запросов
	
*/
async function miniRender(req, dir, resource, metod, data, language) {
	let res
	let obi = {}
	obi.dir = dir
	obi.resource = resource
	obi.metod = metod
	obi.data = data
	obi.language = language
	let t = twig({data: fs.readFileSync(__dirname + '/views/'+config['site']['template']+'/'+dir+'/'+resource+'.html', 'utf8')})
	res = await t.render(obi)
	return res
}

/* Создаем Landing Form
	
*/
async function landingAdd(req, resource, access_token, language) {
	let render
	let metodLanding = new Set(['create','add'])
	if (resource == 'landing' && req.body.id && req.body.metod && metodLanding.has(req.body.metod)) {
		let id = req.body.id
		let param = {}
		if (req.session.user_alias) param.user_alias = req.session.user_alias
		param.metod = req.body.metod
		param.elastic_id = id
		let elastic = await elasticApp('pllano','doc')
		let appGet = await elastic.get(id)
		if (appGet && appGet._id) {
			let product = await appGet._source
			param.elastic_id = appGet._id
			//if (product.price_id) param.price_id = product.price_id
			if (product.product_id) param.product_id = product.product_id
			let appPost = await getApp(req, 'POST', '/landing', '', param, access_token)
			if (appPost.body && appPost.body.items && appPost.body.items.landing) {
				let data = await appPost.body.items.landing
				data.id = req.body.id
				data.metod = req.body.metod
				//let language = await Language(req, language_id)
				console.log(data)
				render = await miniRender(req, '_post', resource, param.metod, data, language)
			}
		}
	}
	console.log(render)
	return render
}

/* Список Landing Form пользователя без товаров
	
*/
async function landingApp(req, access_token) {
	let landing = {}
	let param = {}
	param.list = 'all'
	let landingGet = await getApp(req, 'GET', '/landings', '', param, access_token)
	if (landingGet.body && landingGet.body.landing) {
		landing = await landingGet.body.landing
		// console.log(landing)
	}
	return landing
}

/* getUniversal - доработать
	
*/
async function getUniversal(req, resource, id) {
	let item = []
	let arr
	//req.session[resource] = null
	let resourceFile = new Set(['cart','wishlist','collection'])
	let resourceJson = new Set(['country','city','region'])
	if (resourceFile.has(resource) && req.session.user_alias) {
		let user_alias = req.session.user_alias
		let usercart = config.dir.user + '/' + resource
		if (!fs.existsSync(usercart)) fs.mkdirSync(usercart)
		let file_cart = await usercart+'/'+user_alias+'.json'
		if (fs.existsSync(file_cart)) {
			arr = JSON.parse(fs.readFileSync(file_cart, 'utf8')) // Читаем корзину
		}
	}
	else if (resourceJson.has(resource) && fs.existsSync(config.dir.geo+'/'+resource+'.json')) arr = JSON.parse(await fs.readFileSync(config.dir.geo+'/'+resource+'.json', 'utf8'))
	
	if (id && arr) {
		await arr.forEach(function(it, i, arr) {
			if (it.id == id) item = it
		})
	} else if (arr) item = arr
	
	return await item
}

/* Оформить заказ
	
*/
async function newOrder(req, userData, resource, language) {
	let render = {}
	let resp
	let access_token
	let param = {}
	if (req.session.access_token) access_token = req.session.access_token
	if (req.body) param = await req.body
	param.order = await getApp(req, 'POST', '/order', '', param, access_token)
	console.log(param.order)
	// render = await miniRender(req, '_post', 'order', 'add', param, language)
	return render
}

/* orderCard - текущий заказ - отправляем email админу
	Устаревший, на удаление !!!
*/
async function orderCard(req, language) {
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

/* Получаем корзину
	Вычисляем суммы и общие колличества
*/
async function getCart(userArr, user_alias) {
	let cart = {}
	if (user_alias) {
		let usercart = config.dir.user + '/cart'
		if (!fs.existsSync(usercart)) fs.mkdirSync(usercart)
		let file_cart = await usercart+'/'+user_alias+'.json'
		if (fs.existsSync(file_cart)) {
			// Читаем корзину
			cart = await JSON.parse(fs.readFileSync(file_cart, 'utf8'))
			let total_old_price = 0
			let total_price = 0
			let total_num = 0
			let cashback = 0
			let economy = 0
			
			let platform_commission = 5
			let seller_commission = 15
			
			cart.forEach(function(item, i, cart) {
				if (item.metod == 'add' || item.metod == 'cart') {
					let item_total_old_price = item.price * item.num
					if (item.old_price) item_total_old_price = (item.old_price * item.num).toFixed(2)
					cart[i].total_old_price = item_total_old_price.toFixed(2)
					
					let item_total_price = item.price * item.num
					cart[i].total_price = item_total_price.toFixed(2)
					
					if (userArr.subscription && userArr.subscription.state && userArr.subscription.state == 1) {
						item_economy = item_total_price / 100 * (seller_commission - 1)
						cart[i].economy = item_economy
						economy += item_economy
					}
					else {
						item_cashback = item_total_price / 100 * ((seller_commission - platform_commission) / 2)
						cart[i].cashback = item_cashback
						cashback += item_cashback
					}
					total_num += item.num
					total_price += item_total_price
					total_old_price += item_total_old_price
				}
			})
			cart.cashback = cashback.toFixed(2)
			cart.economy = economy.toFixed(2)
			cart.total_num = total_num
			cart.total_old_price = total_old_price.toFixed(2)
			if (userArr.subscription && userArr.subscription.state && userArr.subscription.state == 1) {
				cart.total_price = (total_price - economy).toFixed(2)
				cart.percent = (economy / ( total_price / 100 )).toFixed(2)
			}
			else {
				cart.total_price = total_price.toFixed(2)
				cart.percent = (cashback / ( total_price / 100 )).toFixed(2)
			}
		}
	}
	// console.log(cart)
	return cart
}

/* Операции с корзиной
	Добавление товаров в корзину, изменение статусов или колличества
*/
async function cart(req, resource, metod, id, language) {
	let dir = '_post'
	let render
	let user_alias
	let model = []
	let body = {}
	let data = {}
	if (req.body) body = req.body
	if (id) body.id = id
	if (req.body.metod) metod = req.body.metod
	//console.log(body)
	if (req.session.user_alias) user_alias = req.session.user_alias
	//req.session[resource] = null
	let metodCart = new Set(['add','wishlist','delete','collection','remove','decrease','increase','quantity'])
	if (metodCart.has(metod) && resource == 'cart' && body.id && user_alias) {
		let usercart = config.dir.user + '/' + resource
		if (!fs.existsSync(usercart)) fs.mkdirSync(usercart)
		let file_resource = await usercart+'/'+user_alias+'.json'
		if (fs.existsSync(file_resource)) {
			model = JSON.parse(fs.readFileSync(file_resource, 'utf8')) // Читаем из локального хранилища
		}
		let fields = new Set(['token','oauth','metod','id','name','vendor_name','image','code','passport','phone','email','url','num','price','currency_id','country_id','city_id','city'])
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
				if (metod == 'cart' || metod == 'wishlist' || metod == 'collection') {
					model[ii].state = data.state
					model[ii].metod = data.metod
				}
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
		await fs.writeFileSync(file_resource, JSON.stringify(model), 'utf8') // Записываем в локальное хранилище
	}
	
	if (resource == 'cart' && metodCart.has(metod)) {
		render = await miniRender(req, dir, resource, metod, data, language)
	}
	return render
}

/* Активация карты пользователя
	Доработать !!!
*/
async function cardActivation(req, access_token, language) {
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
			if (fields.has(key)) data[key] = await doctor.clean(body[key])
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

/* Проверка карты
	Доработать !!!
*/
async function checkCard(req, access_token, language) {
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
			if (fields.has(key)) data[key] = await doctor.clean(body[key])
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

/* Отправка сообщений через smtp.gmail.com
	
*/
async function sendMail(req, template, data, to, subject, language) {
	let dir = '_mail'
	let render_text = config.mail['text']
	let render_html = config.mail['html']
	render_text = await miniRender(req, dir, template+'_text', 'text', data, language)
	render_html = await miniRender(req, dir, template+'_html', 'html', data, language)
	//console.log(render_text)
	let transporter = nodemailer.createTransport({host: config.mail['host'], port: config.mail['port'], secure: config.mail['secure'], auth: {user: config.mail['user'], pass: config.mail['pass']}})
	let mailOptions = {from: config.mail['from'], to: to, subject: subject, text: render_text, html: render_html}
	//transporter.sendMail(mailOptions)
	let message = await transporter.sendMail(mailOptions)
	//console.log("Message sent: %s", message.messageId)
	return message.messageId
}

/* Отправка сообщения админу
	
*/
async function sendAdmin(req, access_token, language) {
	let render = {}
	let check = 0
	let appGet = {}
	let adminMessageId
	let adminTemplate = 'admin'
	let adminTo = 'avantis@pllano.com'
	let subject = '✔ PLLANO: New Message ✔'
	let body = {}
	let data = {}
	let arr = {}
	if (req.body) {
		body = await req.body
		let fields = new Set(['text','phone','email','name'])
		for (var key in body) {
			if (fields.has(key)) data[key] = await doctor.clean(body[key])
		}
	}
	check = 1
	//console.log('check: '+check)
	if (check == 1) {
		arr.data = data
		//console.log('data.email: '+data.email)
		if (data.email) userTo = data.email
		sendMail(req, adminTemplate, arr, adminTo, subject, language)
		render = await miniRender(req, '_post', 'send_message', 'POST', arr, language)
	}
	//console.log(render)
	return render
}

/* ХАК - Проверяем наличие файла session
	Если мы удалим папку __dirname + '/sessions/'
	В некоторых браузерах автоматически не создается
	Поэтому мы проверяем наличие файла сессии, если его нет создаем
*/
async function sessionControl(req) {
	// Проверяем наличие файла session
	if (!fs.existsSync(__dirname + '/sessions/'+req.sessionID+'.json')) {
		//console.log('File Session None '+__dirname + '/sessions/'+req.sessionID+'.json')
		// Хак если файл сессии удален
		let create_session = {
			"cookie": {"originalMaxAge": 1, "expires": Date.now(), "secure": true, "httpOnly": true, "domain": ".pllano.com", "path": "/"},
			"__lastAccess": null,
			"language": 'en'
		}
		fs.writeFile(__dirname + '/sessions/'+req.sessionID+'.json', JSON.stringify(create_session), 'utf8') // Записываем
	}
}

/* Авторизация по ссылке из telegram
	Если пользователь еще не авторизован - Авторизуем
	queryData - содержит query параметры
	Если есть queryData['auth'] и queryData['bot'] == 'telegram'
	То пользователь перешол из телеграм
	Все данные пишем в сессию
*/
async function telegramAuth(req, queryData) {
	let authUrl
	if (queryData['auth']) authUrl = queryData['auth']
	let authBot
	if (queryData['bot']) authBot = queryData['bot']
	if (authUrl && authBot && authBot == 'telegram' && req.session.authorize != 1) {
		let bytes = CryptoJS.AES.decrypt(authUrl, config.telegram['crypto_key'])
		let plaintext = bytes.toString(CryptoJS.enc.Utf8)
		let authTelegram = JSON.parse(plaintext)
		if (authTelegram.telegram_id && authTelegram.user_alias) {
			let telegram_id = authTelegram.telegram_id
			// Пользователь определен, нужно авторизовать
			let user_file = await config.dir.telegram+'/'+telegram_id+'.json'
			if (user_file && fs.existsSync(user_file)) {
				let dataTelegram = JSON.parse(await fs.readFileSync(user_file, 'utf8')) // Читаем
				//console.log(dataTelegram)
				if (dataTelegram && dataTelegram.pllano && dataTelegram.pllano.access_token && dataTelegram.pllano.user_alias) {
					req.session.authorize = 1
					req.session.telegram_id = telegram_id
					req.session.user_alias = dataTelegram.pllano.user_alias
					req.session.access_token = dataTelegram.pllano.access_token
					req.session.language = dataTelegram.telegram.language_code
					req.session.datetime_token = dataTelegram.pllano.datetime_token
					req.session.user_role = dataTelegram.pllano.user_role
					req.session.state = dataTelegram.pllano.state
					req.session.seller = dataTelegram.pllano.seller
					req.session.rating = dataTelegram.pllano.rating
					req.session.bonus_code = dataTelegram.pllano.bonus_code
					req.session.referral_code = dataTelegram.pllano.referral_code
					req.session.iname = dataTelegram.pllano.iname
					req.session.fname = dataTelegram.pllano.fname
					req.session.email = dataTelegram.pllano.email
					req.session.phone = dataTelegram.pllano.phone
					req.session.balans = dataTelegram.pllano.balans
					if (dataTelegram.pllano.subscription) req.session.subscription = dataTelegram.pllano.subscription
				}
			}
		}
	}
}

function LiqPay(public_key, private_key) {
	// API host
	this.host = "https://www.liqpay.ua/api/"
	this.checkout_url = "https://www.liqpay.ua/api/3/checkout"
	
	this.cnb_url = function(params) {
		let language = "ru"
		if(params.language) language = params.language
		params = this.cnb_params(params)
		let data = Buffer.from(JSON.stringify(params)).toString('base64')
		let signature = this.str_to_sign(private_key + data + private_key)
		//let signature = this.cnb_signature(params)
		let liqpay_url = this.checkout_url+'?data='+data+'&signature='+signature
		//console.log(Buffer.from(data, 'base64').toString('utf8'))
		return liqpay_url
	}
	
	/**
		* Call API
		*
		* @param string $path
		* @param Object $params
		* @param function $callback
		*
		* @return Object
	*/
	this.api = function(path, params, callback, callbackerr) {
		if(!params.version)
		throw new Error('version is null')
		params.public_key = public_key
		var data = Buffer.from(JSON.stringify(params)).toString('base64')
		var signature = this.str_to_sign(private_key + data + private_key)
		request.post(this.host + path, {form: {data : data, signature : signature}}, function (error, response, body) {
			if (!error && response.statusCode == 200) callback(JSON.parse(body))
			else callbackerr(error, response)
		}
		)
	}
	
	/**
		* cnb_form
		*
		* @param Object $params
		*
		* @return string
		*
		* @throws InvalidArgumentException
	*/
	this.cnb_form = function(params){
		var language = "ru"
		if(params.language) language = params.language
		params = this.cnb_params(params)
		var data = Buffer.from(JSON.stringify(params)).toString('base64')
		var signature = this.str_to_sign(private_key + data + private_key)
		return '<form method="POST" action="'+this.checkout_url+'" accept-charset="utf-8">' +
		'<input type="hidden" name="data" value="'+data+'" />' +
		'<input type="hidden" name="signature" value="'+signature+'" />' +
		'<input type="image" src="//static.liqpay.ua/buttons/p1'+language+'.radius.png" name="btn_text" />' +
		'</form>'
	}
	
	/**
		* cnb_signature
		*
		* @param Object $params
		*
		* @return string
		*
		* @throws InvalidArgumentException
	*/
	this.cnb_signature = function(params) {
		params = this.cnb_params(params)
		var data = Buffer.from(JSON.stringify(params)).toString('base64')
		return this.str_to_sign(private_key + data + private_key)
	}
	
	/**
		* cnb_params
		*
		* @param Object $params
		*
		* @return Object $params
		*
		* @throws InvalidArgumentException
	*/
	this.cnb_params = function(params) {
		params.public_key = public_key
		if(!params.version)
		throw new Error('version is null')
		if(!params.amount)
		throw new Error('amount is null')
		if(!params.currency)
		throw new Error('currency is null')
		if(!params.description)
		throw new Error('description is null')
		return params
	}
	
	/**
		* str_to_sign
		*
		* @param string $str
		*
		* @return string
	*/
	this.str_to_sign = function(str) {
		var sha1 = crypto.createHash('sha1')
		sha1.update(str)
		return sha1.digest('base64')
	}
	
	/**
		* Return Form Object
	*/
	this.cnb_object = function(params) {
		var language = "ru"
		if(params.language) language = params.language
		params = this.cnb_params(params)
		var data = Buffer.from(JSON.stringify(params)).toString('base64')
		var signature = this.str_to_sign(private_key + data + private_key)
		return {data: data, signature: signature}
	}
	
	return this
}

async function pay_liqpay(user_alias, language, type, action, amount, currency, description, _order_id, period, subscribe, sandbox) {
	let table
	if (action == 'subscribe') table = 'subscribe'
	else if (action == 'pay') table = 'pay'
	let order_id
	if (_order_id) order_id = _order_id
	else order_id = crypto.randomBytes(8).toString('hex')
	let res = {}
	let order = {}
	let id
	/* let kurs = '28.00'
		let options = {}
		options.url = 'https://api.privatbank.ua/p24api/pubinfo?json&exchange&coursid=5'
		options.method = 'GET'
		options.json = true
		let kursGet = await requestPromise(options)
		for (var key in kursGet) {
		if (kursGet[key]['ccy'] == 'USD' && kursGet[key]['base_ccy'] == 'UAH') kurs = kursGet[key]['sale']
	} */
	let pay = {}
	if (sandbox && sandbox == 1) pay.sandbox = 1 // Test Pay
	pay.version = '3'
	pay.action = action
	pay.amount = amount
	pay.currency = currency
	pay.order_id = order_id
	pay.description = description
	pay.language = language
	pay.result_url = config.liqpay['result_url']
	pay.server_url = config.liqpay['server_url']
	if (period && action == 'subscribe') {
		pay.subscribe = 1
		pay.subscribe_date_start = await dateFormat(date, "yyyy-mm-dd hh:MM:ss")
		pay.subscribe_periodicity = period
	}

	let val = {}
	val.payment_system = 'liqpay'
	val.state = 0
	val.order_id = order_id
	val.action = action
	val.price = amount
	val.currency = currency
	val.language = language
	val.date = await dateFormat(date, "yyyy-mm-dd hh:MM:ss")
	
	if (action == 'subscribe' && period && subscribe) {
	    if (subscribe == 'platinum' || subscribe == 'Platinum') val.type = 'Platinum'
		else if (subscribe == 'gold' || subscribe == 'Gold') val.type = 'Gold'
		if (period == 'month' || period == 'Month') val.period = 'month'
		else if (period == 'year' || period == 'Year') val.period = 'year'
	    val.date_activation = val.date
	    val.date_end = await dateFormat(date + 1000 * 60 * 60 * 24 * 365, "yyyy-mm-dd hh:MM:ss")
	}
				
	if (user_alias) {
		let userdata = await db('SELECT * FROM `cart_userdata` WHERE `alias` = ? LIMIT 0, 10', [user_alias])
		let user = {}
		if (userdata[0] && userdata[0][0]) user = userdata[0][0]
		if (user.id) val.userdata_id = user.id
		if (user.iname) val.iname = user.iname
		if (user.fname) val.fname = user.fname
		if (user.phone) val.phone = user.phone
		if (action == 'subscribe' && val.userdata_id && val.type && period && amount) {
		    let orders = await db('SELECT * FROM `subscribe` WHERE `userdata_id` = ? AND `type` = ? AND `period` = ? AND `price` = ? LIMIT 0, 2', [val.userdata_id, val.type, period, amount])
		    if (orders[0][0]) order = orders[0][0]
		    if (order.order_id) {
				if (order.state = 1) {
					res.subscribe = order
					res.subscribe.date_end = await dateFormat(order.date_end, "dd-mm-yyyy")
				}
				
				id = order.order_id
				pay.order_id = order.order_id
				console.log('Подписка найдена '+id)
			}
		}
	}

	if (!id && table) {
		let DB = mysql.createConnection(database.mysql.localhost)
		DB.connect()
		DB.query('INSERT INTO '+table+' SET ?', val, function (error, results, fields) {
			console.log('insertId '+results.insertId)
			if (error) throw error
		})
		DB.end()
	}
	
	liqpay = LiqPay(config.liqpay['public_key'], config.liqpay['private_key'])
	if (type == 'form') res.url = await liqpay.cnb_form(pay)
	else res.url = await liqpay.cnb_url(pay)
	
	return res
	
	/* "status" - Статус платежа. Возможные значения:
		
		// sandbox - Тестовый платеж
		// error - Неуспешный платеж. Некорректно заполнены данные
		// failure - Неуспешный платеж
		// reversed - Платеж возвращен
		// subscribed - Подписка успешно оформлена
		// success - Успешный платеж
		// unsubscribed - Подписка успешно деактивирована
		
		// cash_wait - Ожидается оплата наличными в ТСО
		// hold_wait - Сумма успешно заблокирована на счету отправителя
		// invoice_wait - Инвойс создан успешно, ожидается оплата
		// prepared - Платеж создан, ожидается его завершение отправителем
		// processing - Платеж обрабатывается
		// wait_accept - Деньги с клиента списаны, но магазин еще не прошел проверку. Если магазин не пройдет активацию в течение 90 дней, платежи будут автоматически отменены
		// wait_card - Не установлен способ возмещения у получателя
		// wait_compensation - Платеж успешный, будет зачислен в ежесуточной проводке
		// wait_lc - Аккредитив. Деньги с клиента списаны, ожидается подтверждение доставки товара
		// wait_reserve - Средства по платежу зарезервированы для проведения возврата по ранее поданной заявке
		// wait_secure - Платеж на проверке
		// 3ds_verify - Требуется 3DS верификация. Для завершения платежа, требуется выполнить 3ds_verify
		// captcha_verify - Ожидается подтверждение captcha
		// cvv_verify - Требуется ввод CVV карты отправителя. Для завершения платежа, требуется выполнить cvv_verify
		// ivr_verify - Ожидается подтверждение звонком ivr
		// otp_verify - Требуется OTP подтверждение клиента. OTP пароль отправлен на номер телефона Клиента. Для завершения платежа, требуется выполнить otp_verify
		// password_verify - Ожидается подтверждение пароля приложения Приват24
		// phone_verify - Ожидается ввод телефона клиентом. Для завершения платежа, требуется выполнить phone_verify
		// pin_verify - Ожидается подтверждение pin-code
		// receiver_verify - Требуется ввод данных получателя. Для завершения платежа, требуется выполнить receiver_verify
		// sender_verify - Требуется ввод данных отправителя. Для завершения платежа, требуется выполнить sender_verify
		// senderapp_verify - Ожидается подтверждение в приложении SENDER
		// wait_qr - Ожидается сканирование QR-кода клиентом
		// wait_sender - Ожидается подтверждение оплаты клиентом в приложении Privat24/SENDER
	*/
}

async function authApi(req) {
	let res
	return res
}

let Marketplace = async function(req) {
	let res
 
	return res
}

/** Пинг сайта
	** Должен отдать code = 200
**/
router.all('/ping', async function(req, res) {
	let response = {}
	response.code = 200
	res.status(200).header('Content-Type', 'application/json').send(JSON.stringify(response, null, 2))
})

/** Пишем статистику из аналитики
	**
**/
router.all('/collect', async function(req, res) {
	let _id
	let session = {}
	let response = {}
	response.code = 404
	let query = url.parse(req.originalUrl, true).query // Получаем и разбираем URL
	if (req.method == 'GET' && query['_gid'] && query['_al']) {
		let body = {}
		let googleFields = new Set(['v','_v','a','t','_s','dl','ul','de','dt','sd','sr','vp','je','_u','jid','gjid','cid','tid','_gid','_r','z','user_agent','referrer'])
		for (var key in query) {
			if (googleFields.has(key)) body[key] = query[key]
		}
		if (query['_al'] && query['_al'] != null) {
			let user_alias = query['_al']
			if (fs.existsSync(config.dir.alias+'/'+user_alias+'.json')) {
				let test = JSON.parse(fs.readFileSync(config.dir.alias+'/'+user_alias+'.json', 'utf8')) // Читаем из локального хранилища
				if (test.sessionID) session = JSON.parse(fs.readFileSync(__dirname + '/sessions/'+test.sessionID+'.json', 'utf8')) // Читаем из локального хранилища
				let fields = new Set(['subscription','geo','oauth','authorize','language','user_alias','user_role','email','phone','iname','fname','bonus_code','referral_code','partner','seller','fb_id','google_id','telegram_id'])
				for (var key in session) {
					if (fields.has(key)) body[key] = session[key]
				}
			}
		}
		body.date = Date.now()
		body.date_time = dateFormat(body.date, "d-mm-yyyy h:MM:ss")
		if (Object.keys(body).length >= 20) {
			let resp
			let elastic = await elasticApp('google', 'collect')
			resp = await elastic.index(body)
			if (resp && resp['_id']) response.code = 200
		}
	}
	res.status(200).header('Content-Type', 'application/json').send(JSON.stringify(response, null, 2))
})

/** Формирование кнопки для оплаты
	** https://pllano.com/vendor/liqpay/pay?test=1&language=ru&type=url&action=subscribe&subscribe=platinum&period=month&amount=0.02&currency=USD&description=PLLANO%20Gold
**/
router.all('/vendor/liqpay/pay', async function(req, res) {
	let response = {}
	response.code = 404
	if (req.method == 'GET') {
		let data = {}
		data.order_id = crypto.randomBytes(8).toString('hex')
		data.type = 'url'
		data.language = 'ru' // Язык клиента ru, uk, en
		data.action = 'subscribe' // pay - платеж, hold - блокировка средств на счету отправителя, subscribe - регулярный платеж, paydonate - пожертвование, auth - предавторизация карты
		data.currency = 'USD' // USD, EUR, RUB, UAH
		data.period = 'month' // month|year
		data.subscribe = 'Gold'
		data.sandbox = 1 // Test Pay
		data.description = 'PLLANO '+data.subscribe
		data.amount = 0.01
		data.user_id = 0
		let query = {}
		query = url.parse(req.originalUrl, true).query
		if (query && query.test && query.test == 1) {
			let fields = new Set(['user_id','language','type','action','amount','currency','description','order_id','period','period','subscribe','sandbox'])
			for (var key in query) {
				if (fields.has(key)) data[key] = await doctor.clean(query[key])
			}
			response.query = query
			response.url = await pay_liqpay(data.user_id, data.language, data.type, data.action, data.amount, data.currency, data.description, data.order_id, data.period, data.subscribe, data.sandbox)
			response.code = 200
		}
	}
	res.status(200).header('Content-Type', 'application/json').send(JSON.stringify(response, null, 2))
})

/** Принимаем callback POST от liqpay.ua
	** Аналогично можно сделать под любую платежную систему
**/
router.all('/vendor/liqpay/callback', async function(req, res) {
	let original_url = await url.parse(req.originalUrl)
	console.log(original_url)
	let response = {}
	response.code = 404
	if (req.method == 'POST') {
		let body
		if (req.body && req.body.signature && req.body.data) {
			let sign = LiqPay().str_to_sign(config.liqpay['private_key'] + req.body.data + config.liqpay['private_key'])
			// console.log(sign)
			if (req.body.signature == sign) {
				// console.log('callback liqpay ok')
				// Сигнатуру сравнили, все ок
				// Получаем тело ответа
				let data = await JSON.parse(Buffer.from(req.body.data, 'base64').toString('utf8'))
				//console.log(data)
				//fs.writeFile(config.dir.file+'/liqpay.json', JSON.stringify(data), 'utf8') // Записываем в локальное хранилище
				if (data && data.status) {
					let DB = mysql.createConnection(database.mysql.localhost)
					DB.connect()
					// Поля которые разрешаем для записи в базу
					let fields = new Set(['status','acq_id','action','amount','amount_bonus','amount_credit','amount_debit','authcode_credit','authcode_debit','card_token','commission_credit','commission_debit','completion_date','create_date','currency','currency_debit','currency_credit','customer','description','end_date','err_code','err_description','info','ip','is_3ds','liqpay_order_id','mpi_eci','order_id','payment_id','transaction_id','paytype','public_key','receiver_commission','redirect_to','refund_date_last','rrn_credit','rrn_debit','sender_bonus','sender_card_bank','sender_card_country','sender_card_mask2','sender_card_type','sender_commission','sender_first_name','sender_last_name','sender_phone','type','token','verifycode','err_erc','version','language'])
					let val = {}
					for (var key in data) {
						if (fields.has(key)) val[key] = await data[key]
					}
					if (data.status == 'subscribed' || data.status == 'success' || data.status == 'sandbox') val.locking = 1
					val.state = 1
					val.payment_system = 'liqpay'
					val.created = dateFormat(date, "yyyy-mm-dd hh:MM:ss")
					if (data.sender_phone) {
						let user = {}
						// Ищем пользователя в базе
						let userdata = await db('SELECT * FROM `cart_userdata` WHERE `state` = 1 AND `phone` = '+data.sender_phone+' LIMIT 0, 10')
						if (userdata[0][0]) user = userdata[0][0]
						if (user.id) val.userdata_id = user.id
						// if (user.alias) val.alias = user.alias
						
						// Определяем статус подписки в зависимости от ответа платежной системы
						let state = 0
						if (data.status == 'subscribed' || data.status == 'success' || data.status == 'sandbox') state = 1
						let payer_userdata_id = 0
						if (user.id) payer_userdata_id = user.id
						if (data.order_id && data.sender_first_name && data.sender_last_name && data.sender_card_mask2 && data.amount && data.payment_id) {
							let update = [
								val.payment_system, // Платежная система
								state, // Статус подписки
								payer_userdata_id, // userdata_id плательщика
								data.sender_phone, // Телефон плательщика
								data.sender_first_name, // Имя
								data.sender_last_name, // Фамилия
								data.sender_card_mask2, // Карта
								data.amount, // Сумма платежа
								data.payment_id, // id платежа, для отслеживания
								val.created, // Дата обновления
								data.order_id
							]
							// Обновляем данные о подписке
							DB.query('UPDATE subscribe SET payment_system = ?, state = ?, payer_userdata_id = ?, payer_phone = ?, payer_first_name = ?, payer_last_name = ?, card_mask = ?, amount = ?, payment_id = ?, date = ? WHERE order_id = ?', update, function (error, results, fields) {
								if (error) throw error
								console.log('changed ' + results.changedRows + ' rows')
							})
							
						}
					}
					
					// Сохраняем в elasticsearch
					// let elastic = await elasticApp('payment', 'callback')
					// elastic.index(val)
					
					// Сохраняем в базу mysql
					DB.query('INSERT INTO payment SET ?', val, function (error, results, fields) {
						console.log('insertId '+results.insertId)
						if (error) throw error
					})
					
					DB.end()
					
					response.code = 200
				}
			}
		}
	}
	res.status(200).header('Content-Type', 'application/json').send(JSON.stringify(response))
})

/** Локальный API
	** Для интеграций со сторонними сервисами
**/
router.all('/api', async function(req, res) {
	let auth
	let response = {}
	response.code = 404
	// Получаем и разбираем URL
	// let original_url = await url.parse(req.originalUrl)
	// Разбираем параметры url
	let query = url.parse(req.originalUrl, true).query
	auth = await authApi(req) // Проверяем авторизацию, должен вернуть user_id
	if (auth && query.action) {
		let action = ''
		let data = {}
		if (auth >= 1) data.user_id = auth
		if (req.method == 'GET') {
			// Список разрешенных GET action
			let pathApiGet = new Set(['index','order','user'])
			if (pathApiGet.has(query.action)) action = await query.action // GET
			// Передаем обработку функциям
			if (action == 'order') {
				// Список разрешенных параметров для этого ресурса
				let fields = new Set(['id','language','type','amount','currency','description','order_id','period','period','subscribe','sandbox'])
				for (var key in query) {
					if (fields.has(key)) data[key] = await doctor.clean(query[key])
				}
				// response.data = await api(data).order().get()
			}
			else if (action == 'cart') {
				// Список разрешенных параметров для этого ресурса
				let fields = new Set(['id','language','type','amount','currency','description','order_id','period','period','subscribe','sandbox'])
				for (var key in query) {
					if (fields.has(key)) data[key] = await doctor.clean(query[key])
				}
				// response.data = await api(data).cart().get()
			}
		}
		else if (req.method == 'POST' && req.body) {
			let body = req.body
			// Список разрешенных POST action
			let pathApiPost = new Set(['index','order','user'])
			if (pathApiPost.has(data.action)) action = await data.action // POST
			// Передаем обработку функциям
			if (action == 'order') {
				// Список разрешенных параметров для этого ресурса
				let fields = new Set(['id','language','type','amount','currency','description','order_id','period','period','subscribe','sandbox'])
				for (var key in body) {
					if (fields.has(key)) data[key] = await doctor.clean(body[key])
				}
				// response.data = await api(data).order().post()
			}
		}
	}
	else response.auth = null
	if (response.data) response.code = 200
	res.status(200).header('Content-Type', 'application/json').send(JSON.stringify(response, null, 2))
})

/* Глобальный роутер - Потдерживает четырехуровневый URL
	Благодаря ему мы можем не писать тысячи лишних строк
*/
router.all('*', async function(req, res) {
	sessionControl(req) // Если файла сессии нет, создаем
	let arrView = {}
	let response = {}
	response.status = 404
	let body = {}
	let csrf = 1
	let token = 2
	let render = 'json'
	let token_encrypt = ''
	let id = ''
	let authorize = 0 // По умолчанию неавторизован
	let user_alias // Алиас пользователя. По умолчанию undefined
	let cookie_ok = 0
	let access_token // По умолчанию undefined
	let userData = {}
	let now = new Date()
	
	// Предусматриваем четырехуровневый URL
	let resource = ''
	let alias = ''
	let resource_id
	let resource_alias
	
	// Получаем и разбираем URL
	let original_url = await url.parse(req.originalUrl)
	let urlArr = await original_url.pathname.split('/')
	if (urlArr[1]) resource = urlArr[1]
	if (urlArr[2]) alias = urlArr[2]
	if (urlArr[3]) resource_id = urlArr[3]
	if (urlArr[4]) resource_alias = urlArr[4]
	
	// Пороверка на бота
	let bot = doctor.is_bot(req.headers['user-agent'])
	// Получаем IP
	let user_ip = req.header('X-Real-IP') || req.connection.remoteAddress
	let userAgent // по умолчанию undefined
	if (req.headers['user-agent']) userAgent = jsParser(req.headers['user-agent'])
	// Получаем параметры URL
	let queryData = url.parse(req.originalUrl, true).query
	
	// Определяем язык пользователя
	let language_id = await languageTest(req, res) // Определяем язык пользователя
	// Получаем массив с локализацией
	let language = await Language(req, language_id)
	
	// Загрузка данных об IP
	geo(req, user_ip, bot, language_id)
	
	let user = new User()
	
	// Что бы уменьшить нагрузку от посещения ботов
	if (!bot) {
		// Авторизация по ссылке из Telegram
		telegramAuth(req, queryData)
		// Проверяем авторизацию
		userData = await user.run(req)
		if (req.session.authorize) authorize = req.session.authorize
		if (authorize == 0 && queryData['invite']) req.session.invite = queryData['invite'] // Если пользователь не авторизован и пришол с invite кодом
		if (authorize == 1 && req.session.user_alias) user_alias = req.session.user_alias
		if (req.session.cookie_ok) cookie_ok = req.session.cookie_ok
		if (req.session.access_token) access_token = req.session.access_token
	}
	
	// Печенька для общения бекенда и фронтенда
	let gid
	let cid
	let sr
	
	let gaCookie = new Cookies(req, res, {'secure': false})
	
	if (gaCookie.get('_gid')) gid = await doctor.replaceSplitJoin(gaCookie.get('_gid'), 'GA1.2.', '')
	if (gaCookie.get('_ga')) cid = await doctor.replaceSplitJoin(gaCookie.get('_ga'), 'GA1.2.', '')
	if (gaCookie.get('sr')) sr = await gaCookie.get('sr')
	
	if (sr) req.session.sr = sr
	if (gid) req.session.gid = gid
	if (cid) req.session.cid = cid
	
	if (user_alias) {
		let jn = {}
		jn.user_alias = user_alias
		jn.sessionID = req.sessionID
		if (cid) jn.cid = cid
		if (gid) jn.gid = gid
		fs.writeFile(config.dir.alias+'/'+user_alias+'.json', JSON.stringify(jn), 'utf8')
	}
	
	if (user_alias && cid && gid) {
		// Обновляем данные о пользователе
		let DB = mysql.createConnection(database.mysql.localhost)
		DB.connect()
		DB.query('UPDATE cart_userdata SET cid = ?, gid = ? WHERE alias = ?', [cid, gid, user_alias], function (error, results, fields) {
			if (error) throw error
		})
		DB.end()
	}
	
	if (req.method == 'GET') {
		let route = '404' // Роутер по умолчанию, для несуществующих ресурсов
		// GET ресурсы
		let pathGet = new Set([
			'contact',
			'about-us',
			'terms-of-use',
			'privacy-policy',
			'for-partners',
			'for-banks',
			'marketplace',
			'gold',
			'platinum',
			'language', // Мультиязычность
			'sign-in', // Авторизация
			'sign-up', // Регистрация
			'check-card', // Проверка карты ----------------------
			'card-activation', // Активация карты ----------------------
			'card', // Корзина
			'order', // Заказы
			'subscription', // Оформить подписку
			'cart', // Корзина
			'wishlist', // Отложенное
			'collection', // Избранное
			//'suggestions',
			//'landings',
			//'referral',
			//'balance',
			'get', // Получить данные
			'subscription-state', // Проверить карту храмим первіх 6 цифр и md5 ----------------------
		])
		
		if (resource == '') route = 'index' // Главная страница
		else if (pathGet.has(resource)) route = await resource // Для разрешонных ресурсов
		
		if (route == 'get') { // method GET и нужно отдать json
			//if (req.session.access_token) response.access_token = req.session.access_token // ???????????
			let resourceGetJson = new Set(['cart', 'country','city','region'])
			if (alias && resourceGetJson.has(alias)) {
				response[alias] = await getUniversal(req, alias)
				response.status = 200
			}
			else route = '404'
		}
		else if (route == 'language') { // method GET для language нужно отдать json
			if (req.query.lang) language_id = req.query.lang
			if (lang.has(language_id)) req.session.language = req.query.lang
			response.lang = language_id
			response.language = language
			response.status = 200
		}
		else {
			
			let content = await getBlocks(req, route, id, userData, language)
			let paginator = ''
			let query = ''
			let items = {}
			let landing = {}
			let cart = {}
			
			// Что бы уменьшить нагрузку на сервер App выполняем запросы только если пользователь авторизован
			if (route == 'marketplace' && authorize == 1 && user_alias && access_token && language_id) {
					
					// Получаем список лендингов
					landing = await landingApp(req, access_token)
					// Получаем корзину
					cart = await getCart(userData, user_alias)
					// console.log(cart)
					// Печенька для общения бекенда и фронтенда
					let cookies = new Cookies(req, res, {keys: ['cooki_js']})
					if (cart.total_price) cookies.set('cart', 1, {signed: false, httpOnly: false})
					else cookies.set('cart', 0, {signed: false, httpOnly: false})

				    let param = {}
				    if (queryData && queryData != null) {
					if (queryData['size']) param.size = queryData['size']
					if (queryData['page'] && queryData['size']) param.from = (queryData['size'] * queryData['page']) + 1
					else if (queryData['page']) {
						if (queryData['page'] == 1) param.from = 0
						else if (queryData['page'] >= 2) param.from = (30 * (queryData['page'] - 1)) + 1
					}
					else param.from = 0
				    }
				
				    if (language_id) param.lang = language_id
				    let source = '/'
				    let param_id = ''

					source = '/search'
					if (alias) {
						id = alias
						param_id = '/'+alias
					}
					else {
						if (req.query.query) query = req.query.query
						req.session.query = query
						if (req.session.query) param.query = req.session.query
					}
					
					param_get = '?'+httpBuildQuery(param)
					let dir_cache = config.dir.file+'/'+route
					if (!fs.existsSync(dir_cache)) await fs.mkdirSync(dir_cache)
					let cache_name = await crypto.createHash('md5').update('/'+route+param_id+param_get).digest("hex")
					let cache_subscription = 'subscription'
					let file_cache = await dir_cache+'/'+cache_subscription+'_'+cache_name+'.json'
					let controlCache = 0
					
					if (fs.existsSync(file_cache)) { // Проверяем наличие кэша в локальном хранилище
						items = JSON.parse(fs.readFileSync(file_cache, 'utf8')) // Читаем кэш из локального хранилища
						//if (items.hits && items.hits.hits[0]._id) controlCache = 1
						//new Date(items.time).getTime() > new Date(control_cache.time).getTime()
						if (!items.time || new Date(items.time).getTime() > new Date(control_cache.time).getTime()) controlCache = 1
					}
					else if (!fs.existsSync(file_cache) || config.global['file_cache_update'] == 1) controlCache = 1
					
					//console.log(new Date(items.time).getTime() > new Date(control_cache.time).getTime())
					//console.log(new Date(items.time).getTime())
					//console.log(new Date(control_cache.time).getTime())
					//console.log('controlCache '+controlCache)
					
					let appGet = {}
					if (controlCache == 1) {
						
						appGet = await getApp(req, req.method, source, id, param, access_token)
						// console.log(appGet)
						
						if (route == 'marketplace' && alias && appGet.body && appGet.body.items.item._id) {
							let description = appGet.body.items.item._source.description
							description = doctor.replaceSplitJoin(description, '&lt;', '<')
							description = doctor.replaceSplitJoin(description, '&gt;', '>')
							//console.log(description)
							appGet.body.items.item._source.description = description
							
							let productType = appGet.body.items.item._source.productName.split(' '+appGet.body.items.item._source.productVendorName+' ')
							appGet.body.items.item._source.productType = productType[0]
							
						}
						// Если ничего не найдено поторяем поиск
						else if (appGet.body && appGet.body.items && appGet.body.items.hits && appGet.body.items.hits.total == 0) {
							// Нужно перенести в function getApp() ???
							if (route == 'marketplace') {
								// console.log('повторный поиск')
								let respMarketplace = await getMarketplaceApp(req, req.method, source, param, access_token, query)
								if (respMarketplace.response) appGet = respMarketplace.response
								if (respMarketplace.query) {
									req.session.query = respMarketplace.query
									query = respMarketplace.query
								}
							}
						}
						
						if (appGet.body && appGet.body.items) {
							items = await appGet.body.items
							items.time = control_cache.time
						}
						
						await fs.writeFileSync(file_cache, JSON.stringify(items), 'utf8') // Записываем кэш в локальное хранилище
						
					}
				

			    if (items.item && items.item._id) {
					
				let item = items.item._source
				content.h1 = item.productName
				content.title = item.productName
				content.description = item.productName
				content.keywords = item.productName
				content.og.title = item.productName
				content.og.description = item.productName
				content.og.image = item.images[0]
				
			    }
			    else if (items.hits && items.hits.total >= 1) {
				
				let paginator_query = ''
				let p_current = 1
				let p_size = 30
				let p_total = items.hits.total
				if (queryData && queryData != null) {
					let query_data = {}
					let queryNoKey = new Set(['size', 'query', 'sort'])
					for (var key in queryData) {
						if (key == 'query') query_data[key] = query
						if (key == 'size') query_data[key] = queryData[key]
					}
					if (query_data) paginator_query = '?'+httpBuildQuery(query_data)
					if (queryData['page']) p_current = queryData['page'] // Начиная с этой
					if (queryData['size']) p_size = queryData['size'] // Вывести строк
				}
				// Пагинация
				let paginations = pagination.create('search', {prelink:'/'+route+''+paginator_query, current: p_current, rowsPerPage: p_size, totalResult: p_total});
				paginator = paginations.render()
				
			    }

			}
			else if (route == 'subscription') {
				if (authorize == 1 && user_alias && language_id) {
				    items.order_id = crypto.randomBytes(8).toString('hex')
				    items.subscribe = 'Gold'
				    items.period = 'month'
				    items.currency = 'USD'
				    items.price = '5.00'
				    if (queryData.period && queryData.subscribe) {
				        if (queryData.subscribe == 'platinum' || queryData.subscribe == 'Platinum') items.subscribe = 'Platinum'
				        else if (queryData.subscribe == 'gold' || queryData.subscribe == 'Gold') items.subscribe = 'Gold'
				        if (queryData.period == 'month' || queryData.period == 'Month') items.period = 'month'
				        else if (queryData.period == 'year' || queryData.period == 'Year') items.period = 'year'
				    }

				    if (items.subscribe == 'Gold' && items.period == 'month') items.price = '5.00'
				    else if (items.subscribe == 'Gold' && items.period == 'year') items.price = '50.00'
				    else if (items.subscribe == 'Platinum' && items.period == 'month') items.price = '10.00'
				    else if (items.subscribe == 'Platinum' && items.period == 'year') items.price = '100.00'
				    items.description = 'PLLANO '+items.subscribe
					
					let liqpay = await pay_liqpay(user_alias, language_id, 'url', 'subscribe', items.price, items.currency, items.description, items.order_id, items.period, items.subscribe, 1)
				    items.pay = {}
				    if (liqpay.url) items.pay.liqpay = liqpay.url
					if (liqpay.subscribe) items.subscribe = liqpay.subscribe
					
					console.log('subscribe')
					console.log(items.subscribe)
					console.log('url')
					console.log(items.url)
				}
				else req.session.location = req.originalUrl
			}
			
			// Список ресурсов для которых генерируем token, для того что бы не генерить токен картинкам
			let pathToken = new Set([
			    'index',
			    'contact',
			    'about-us',
			    'terms-of-use',
			    'privacy-policy',
			    'for-partners',
			    'for-banks',
			    'marketplace',
			    'subscription',
			    'language', // Мультиязычность
			    'sign-in', // Авторизация
			    'sign-up', // Регистрация
			    'order-card', // Оформить заказ
			    'check-card', // Проверка карты
			    'card-activation', // Активация карты
			    'card', // Корзина
			    'order', // Заказы
			    'cart', // Корзина
			    'wishlist', // Отложенное
			    'collection', // Избранное
			    'subscription-state', // Проверить карту храмим первіх 6 цифр и md5
			])
			if (pathToken.has(route)) {
				let token = await doctor.token()
				req.session.token = token
			    token_encrypt = await doctor.encrypt(token) // Шифруем токен 
			}
			// Данные для шаюлонизатора
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
				'user_agent': userAgent,
				'user': userData,
				'content': content,
				'items': items,
				'pagination': paginator,
				'token': token_encrypt,
				'bot': bot,
				'cart': cart,
				'landing': landing,
				'config': config['site'],
				'language': language
			}
			render = 'twig' // Отдать на рендер шаблонизатору twig
		}
	}
	else if (!bot && req.method == 'POST') {
		// POST ресурсы
		let pathPost = new Set([
			'language', // Мультиязычность
			'logout', // Выход
			'login', // Вход
			'cart', // Корзина
			'landing', // Работа с лендингами
			'wishlist', // Отложенное
			'collection', // Избранное
			'order', // Заказы
			//'landings',
			//'suggestions',
			'post', // Другие POST запросы
			'subscription', // Заказ карты
			'check-card', // Проверка карты ----------------------
			'card-activation', // Активация карты ----------------------
			'send-message', // Сообщение
		])
		if (pathPost.has(resource)) {
			
			let user_data = {
				'user_agent': userAgent,
				'user_ip': user_ip,
				'user': userData
			}
			
			if (req.body) body = await req.body
			//console.log(req.body)
			if (body.csrf) csrf = await doctor.decrypt(body.csrf)
			if (req.session.token) token = await req.session.token
			
			if (resource == 'language' && body.id) {
				let lang = await setLanguage(req, body.id)
				if (body.id == lang) response.status = 200
			}
			else if (resource == 'logout' && token == csrf) {
				user.logout(req)
				response.status = 200
			}
			else if (resource == 'login' && token == csrf) {
				await user.login(req)
				if (req.session.authorize == 1) {
					response.status = 200
					if (req.session.location) {
						response.location = req.session.location
						req.session.location = null
					}
				}
			}
			else if (resource == 'landing' && body.id && token == csrf) {
				response.render = await landingAdd(req, resource, access_token, language)
				if (response.render) response.status = 200
				else response.status = 400
			}
			else if (resource == 'cart' && body.id && token == csrf) {
				response.render = await cart(req, resource, null, null, language)
				if (response.render) response.status = 200
				else response.status = 400
			}
			else if (resource == 'order' && token == csrf) {
				response.cart = await newOrder(req, user_data, resource, language)
				if (response.cart) response.status = 200
				else response.status = 400
			}
			else if (resource == 'order-card' && token == csrf) {
				console.log('order-card')
				response.card = await orderCard(req, language)
				if (response.card && response.card == 1) response.status = 200
				else response.status = 400
			}
			else if (resource == 'card-activation' && token == csrf) {
				console.log('card-activation')
				response.html = await cardActivation(req, access_token, language)
				if (response.html) response.status = 200
				else response.status = 400
			}
			else if (resource == 'check-card' && token == csrf) {
				console.log('check-card')
				response.html = await checkCard(req, access_token, language)
				if (response.html) response.status = 200
				else response.status = 400
			}
			else if (resource == 'send-message' && token == csrf) {
				console.log('send-message')
				response.html = await sendAdmin(req, access_token, language)
				if (response.html) response.status = 200
				else response.status = 400
			}
		}
	}
	
	if (userData.access_token) delete userData.access_token // access_token в логи не пишем
	
	let log = {
		'date': date,
		'date_time': dateFormat(now, "d-mm-yyyy h:MM:ss"),
		'method': req.method,
		'render': render,
		'resource': resource,
		'alias': alias,
		'resource_id': resource_id,
		'originalUrl': req.originalUrl,
		'sessionID': req.sessionID,
		'user_ip': user_ip,
		'language_id': language_id,
		'bot': bot,
		'user_agent': userAgent,
		'user': userData,
		//'token': token,
		//'csrf': csrf,
		'post': body,
		//'response': response,
		'gid': gid,
		'cid': cid,
		'sr': sr
	}
	
	if (config.global['console_log'] == 1) console.log(log)
	if (!bot && config.global['file_log'] == 1) {
		let y = config.dir.log+'/'+dateFormat(now, "yyyy")
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
		}
		else {
			console.log('Create Log: '+user_ip+'.json')
			fs.writeFileSync(filelog, JSON.stringify(log), 'utf8') // Создаем
		}
	}
	if (!bot && config.elastic['log'] == 1) {
		let elastic = await elasticApp('log','doc')
		elastic.index(log)
	}
	
	console.log('--------------------------------------------')
	if (render == 'twig') res.render('layout.twig', arrView)
	else res.status(200).header('Content-Type', 'application/json').send(JSON.stringify(response))
	// else if (render == 'redirect') res.redirect('/all.html')
})

// Запускаем Node
var server = router.listen(3000, 'localhost', function () {
	var host = server.address().address
	var port = server.address().port
	console.log('Example app listening at http://%s:%s', host, port)
})

//const app = require(fs.readFileSync(__dirname + '/app.js'))
// https://catalog-api.rozetka.com.ua/v2/fats/getFullMenu?lang=ua
/*
	
	//id = Math.random().toString(36).substring(7)
	//console.log("Math random id", id)
	//id = uuid.v4()
	//console.log("uuid random id", id)
	
	// console.log(Buffer.from("Hello World").toString('base64'))
	// console.log(Buffer.from("SGVsbG8gV29ybGQ=", 'base64').toString('ascii')) // ascii, utf8, utf16le/ucs2, base64, binary, hex
	
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
//console.log(CryptoJS.HmacSHA1("Message", config.telegram['crypto_key']))
/*
	
	//cookies.set('LastVisit', new Date().toISOString(), {signed: true})
	//let lastVisit = cookies.get('LastVisit', {signed: true})
	//cookies.set('test_js', 'test', {signed: false, httpOnly: false})
	//let test_js = cookies.get('test_js')
	
	let message = JSON.stringify({
	'one': 'duo',
	'ert': 'trey'
	})
	console.log(message)
	// Encrypt
	var ciphertext = CryptoJS.AES.encrypt(message, config.telegram['crypto_key'])
	console.log(ciphertext.toString())
	// Decrypt
	var bytes = CryptoJS.AES.decrypt(ciphertext.toString(), config.telegram['crypto_key'])
	var plaintext = bytes.toString(CryptoJS.enc.Utf8)
	console.log(plaintext)
	
	// Создаем и проверяем хеш
	// let password = '4149605006216923' // Исходная строка
	// let hashs = bcrypt.hashSync(password, bcrypt.genSaltSync(10)) // Создаем хеш
	// let testHash = bcrypt.compareSync(password, hashs) // Проверка хеша true если ок
	// console.log(testHash) // true если ок
	
	//const request = require('request') // https://www.npmjs.com/package/request
	//const compression = require('compression')
	// fs.writeFile(config.dir.file+'/message.txt', 'Hello Node.js', 'utf8', callback) // Записать файл
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