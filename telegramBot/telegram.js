// Подключаем файловый менеджер
let fs = require('fs-extra')
/* Конфигурация - глобально
	
*/
let config = JSON.parse(fs.readFileSync(__dirname + '/config.json', 'utf8'))
let global = config['global']
let mail = config['mail']
let site = config['site']
let telegram = config['telegram']
let push = config['push']
/* Конфигурация - простые переменные
	
*/
let push_elastic_token = push['elastic_token']
let push_log_token = push['log_token'] // Токен для записи через /push
let push_admin_token = push['admin_token']

let pllanoApp = global['pllano_app']
let pllanoSite = global['pllano_site']
let file_cache_update = global['file_cache_update'] // Включитьь кэш 1 или нет 0
let language_id = global['language_id'] // id языка по умолчанию
let lang_id = global['lang_id']
let lat = global['lat'] // Координаты
let lon = global['lon'] // Координаты
let timezone = global['timezone']
let cur_code = global['cur_code'] // Код валюты
let iso = global['iso'] // Код iso
let continent = global['continent']
let country_id = global['country_id'] // Украина - id страны
let region_id = global['region_id'] // Киев - id региона (области)
let city_id = global['city_id'] // Киев - id города
let country
let city
let region
/* Разрешения
	
*/
let adminSet = new Set([711610523, 609762583]) // telegram_id наших админов
let responseSet = new Set(['authorization', 'access_token', 'refresh_token', 'datetime_token'])
let userSet = new Set(['subscription', 'user_alias', 'user_role', 'state', 'seller', 'partner', 'rating', 'balans', 'bonus_code', 'referral_code', 'iname', 'fname', 'email', 'phone', 'balans'])
let httpSet = new Set(['/start', '/search', '/stop', '/subscription', '/marketplace'])
let lang = new Set(['en', 'ru', 'ua', 'pl', 'de'])
/* Конфигурация - telegram
	
*/
let telegram_app_token = telegram['app_token'] // Токен для авторизации на сайте по ссылкам с телеграма 
let telegram_crypto_key = telegram['crypto_key'] // pllanoBotKey - ключ шифрования, messageBot - строка для шифрования
let telegram_token = telegram['token'] // Устанавливаем токен TelegramBot
let TelegramBot = require('node-telegram-bot-api')
let botTelegram = new TelegramBot(telegram_token, {polling: true, startgroup: true}) // Подключаемся к боту
/* Директории
	
*/
let dir = __dirname + '/file'
if (!fs.existsSync(dir)) fs.mkdirSync(dir)
let dirlanguage = dir + '/language'
if (!fs.existsSync(dirlanguage)) fs.mkdirSync(dirlanguage)
let user_dir = dir + '/user_data'
if (!fs.existsSync(user_dir)) fs.mkdirSync(user_dir)
let user_telegram = user_dir + '/telegram'
if (!fs.existsSync(user_telegram)) fs.mkdirSync(user_telegram)
let user_cart_dir = user_dir + '/cart'
if (!fs.existsSync(user_cart_dir)) fs.mkdirSync(user_cart_dir)
/* Дата и время
	
*/
let dateFormat = require('dateformat')
let date = Date.now()
let date_time = dateFormat(date, "d-mm-yyyy h:MM:ss")
let time = dateFormat(date, "h:MM:ss")
let sleep = (milliseconds) => {
	return new promise(resolve => setTimeout(resolve, milliseconds))
}
let control_cache = { // Время жизни кэша
	'time': date + 1000 * 60 * 60 * 24 * 1 // Один день
}
/* Пакеты
	
*/
let requestPromise = require('request-promise')
let httpBuildQuery = require('http-build-query')
let sanitizeHtml = require('sanitize-html')
let promise = require('promise') // https://www.npmjs.com/package/promise
let crypto = require('crypto')
let AES = require("crypto-js/aes")
let SHA256 = require("crypto-js/sha256")
let CryptoJS = require("crypto-js")
/* Elastic Search DB
	elastic_log - пишем логи в Elastic или нет 0 или 1
	elastic - Через что мы пишем в elastic Elastic
*/
let elastic_log = 0 // Пишем логи в Elastic
let elastic = 'local' // Через что мы пишем в elastic Elastic local или app
let elasticsearch = require('elasticsearch')
let client = new elasticsearch.Client({
  host: 'localhost:9200',
  //log: 'trace'
})
/* elasticsearch - поиск по параметрам
	
*/
async function search(body, index, type) {
	let result
	let arr = {}
	arr.index = 'log'
	arr.type = 'doc'
	arr.body = body
	if (index) arr.index = index
	if (type) arr.type = type
	if (elastic == 'local') result = await client.index(arr) // Напрямую
	else if (elastic == 'app') {
		arr.metod = 'get'
	    arr.token = push_elastic_token
	    result = await getApp('GET', '/push', '', arr) // Через API
	}
	// console.log(result)
	return result
}
/* elasticsearch - получить запись по _id
	
*/
async function getOne(id, index, type) {
	let result
	let arr = {}
	arr.index = 'log'
	arr.type = 'doc'
	arr.body = body
	if (index) arr.index = index
	if (type) arr.type = type
	if (elastic == 'local') result = await client.get(arr) // Напрямую
	else if (elastic == 'app') {
		arr.metod = 'get'
	    arr.token = push_elastic_token
	    result = await getApp('GET', '/push', '', arr) // Через API
	}
	//console.log(result)
	return result
}
/* elasticsearch - добавить в индекс одну запись
	
*/
async function indexOne(body, index, type, id) {
	let result
	let arr = {}
	arr.index = 'log'
	arr.type = 'doc'
	arr.body = body
	if (index) arr.index = index
	if (type) arr.type = type
	if (id) arr.id = id
	if (elastic == 'local') result = await client.index(arr) // Напрямую
	else if (elastic == 'app') {
	    arr.token = push_elastic_token
	    result = await getApp('POST', '/push', '', arr) // Через API
	}
	// console.log(result)
	return result
}

/* Вопросы - ответы
	
*/
let questions_ru = {}
let answers_ru = {
    "0": [
		"Вот сейчас я тебя совсем не понимаю.",
		"Можешь сказать то же самое другими словами?",
		"Не совсем понимаю, о чём ты.",
		"Попробуй, пожалуйста, выразить свою мысль по-другому.",
		"Вот эта последняя фраза мне не ясна.",
		"А вот это не совсем понятно.",
		"Не совсем понимаю, о чём ты.",
		"К сожалению я не смог найти ответ на твой запрос",
		"Попробуй изменить или упростить текст запроса"
	],
	"1": [
		date_time
	],
	"2": [
		time
	],
	"3": [
		"Список команд Бота: команды, меню, command, menu",
		"Список команд Бота: команды, меню",
		"Список команд Бота: command, menu",
		"Command List Bot: command, menu"
	],
	"4": [
		"Вход",
		"Добро пожаловать",
		"Нажми кнопку отправить телефон"
	],
	"5": [
		"Ваша корзина",
		"Корзина"
	],
	"6": [
		"ВАЖНО! Не делитесь ссылками на сайт pllano.com полученными от pllano_bot с другими людьми! Во все ссылки встроен токен авторизации и при переходе по ссылке система автоматически авторизуют вас на нашем сайте. Человек который перейдет по вашей ссылке будет авторизован под вами! Лучше поделитесь ссылкой на меня: https://t.me/pllano_bot \n \n Что я могу:\n– Бот отвечает на все что вы ему напишите.\n– Может поддерживать простой разговор.\n– Искать товары по ключевым словам, например: стол, кровать, матрас, кабель, ботинки\n \nКоманды:\n– команды, меню, command (выводит список команд)\n– корзина, моя корзина, cart (выведет вашу корзину)\n– заказы, мои заказы, orders (выведет ваши заказы)\n– платежи, pay (выведет список ваших платежей)\n– карта, card, клуб, club (выведет информацию по вашей подписке)\n– дата, date, дата время (выводит текущую дату)\n– время (выведет текущее время)\n– beta (выведет список команд находящихся в разработке)"
	]
}

let hello = "ВАЖНО! Не делитесь ссылками на сайт pllano.com полученными от pllano_bot с другими людьми! Во все ссылки встроен токен авторизации и при переходе по ссылке система автоматически авторизуют вас на нашем сайте. Человек который перейдет по вашей ссылке будет авторизован под вами! Лучше поделитесь ссылкой на меня: https://t.me/pllano_bot \n \n Что я могу:\n– Бот отвечает на все что вы ему напишите.\n– Может поддерживать простой разговор.\n– Искать товары по ключевым словам, например: стол, кровать, матрас, кабель, ботинки\n \nКоманды:\n– команды, меню, command (выводит список команд)\n– корзина, моя корзина, cart (выведет вашу корзину)\n– заказы, мои заказы, orders (выведет ваши заказы)\n– платежи, pay (выведет список ваших платежей)\n– карта, card, клуб, club (выведет информацию по вашей подписке)\n– дата, date, дата время (выводит текущую дату)\n– время (выведет текущее время)\n– beta (выведет список команд находящихся в разработке)"

//const answerSet = new Set(['Привет', 'Меню', 'Тест', 'Test'])
//let dialogflow = require('dialogflow')
//let uuid = require('uuid')

// b6b8530a2d584c62bba65cb35b6db235 // токен разраба
// 1bab0ebb67a24573b1ca41cfb7ed4f4a // токен юзера
// dialogflow-xqjwnf@tg-agent-767bf.iam.gserviceaccount.com // Service Account

//let tokenizer = new natural.WordTokenizer()
//let tokenizer = new natural.AggressiveTokenizerRu()


/* 
let strText = fs.readFileSync(dir+'/answer_databse.txt','utf-8')
let arrText = strText.split('/n')
//let arrKey = []
let BreakException = {}
try {
arrText.forEach(function(item, is, arrText) {
	console.log(is)
	let question
	let answer
	let tttt
	//let arrItem = {}
	let arrItem = item.split('\\')
	if (arrItem[0] && arrItem[0] != '') question = arrItem[0]
	if (arrItem[1] && arrItem[1] != '') answer = arrItem[1]
	// if (arrItem[2] && arrItem[2] != '') tttt = arrItem[2]
	let mat = ["сучара","хуйня","блят","бляд","пидарас","ипись","изъеб","еблан","ебеный","ебущий","ебанашка","ебырь","хуище","гребан","уебище","уебан","феееб","6ляд","сцука","ебали","пестато","ебало","ебли","ебло","ебанут","ебут","заебу","выебу","хуйло","нехе","неху","ниху","нихе","ибанут","fuck","хули","хуля","хуе","хуё","мудл","хер","пидар","наху","педер","пидер","пидир","ёбну","ебну","ебыр","заеб","заёб","ебен","блятc","аебли","заебло","переебло","отебло","отъебло","отьебло","ебеш","выеб","отъеб","отьеб","перееб","хуйла","хую","иннах","6ля","бля","хуило","хуюше","сука","ъеб","ъёб","блябу","бля бу","залупа","хера","пизжен","ёпта","епта","пистапол","пизда","залупить","ебать","мудо","манда","мандавошка","мокрощелка","муда","муде","муди","мудн","пизд","похую","похуй","охуи","ебля","пидорас","пидор","херн","щлюха","хуй","писдеш","писдит","писдиш","нехуй","ниибаца"]

	mat.forEach(function(it, ii, mat) {
	    let body = []
	    if (answer.indexOf(it) - 1) indexOne(body, 'answers', 'text')
	})
	if (is > 500 && is < 1000) {
		throw BreakException
	}
})
} catch (e) {
  if (e !== BreakException) throw e
}
*/

// console.log('time '+time)
// console.log('date_time '+date_time)

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
		let example = str.split(' ')
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

// Функция клинер
async function clean(value) {
	if (value) return await sanitizeHtml(value.trim())
}

async function cleanJson(r) {
	return await JSON.stringify(r).replace(/["']/g, "")
}

function rand(max) {
	return Math.floor(Math.random() * max)
}

// Функция клинер для ввода слов пользователем
async function cleanStr(value) {
	value = await value.toLowerCase()
	value = await value.replace(/[.,\/#!?$%\^&\*<>;:{}=\-_`~()]/g,"")
	value = await value.replace(/\s{2,}/g," ")
	value = await sanitizeHtml(value)
	value = await value.trim()
	return value
}

/* async function runSample(projectId = 'tg-agent-767bf') {
	// A unique identifier for the given session
	const sessionId = uuid.v4()
	// Create a new session
	const sessionClient = new dialogflow.SessionsClient()
	const sessionPath = sessionClient.sessionPath(projectId, sessionId)
	// The text query request.
	const request = {
	session: sessionPath,
	queryInput: {
	text: {
	// The query to send to the dialogflow agent
	text: 'hello',
	// The language used by the client (en-US)
	languageCode: 'en-US',
	},
	},
	}
	// Send request and log result
	const responses = await sessionClient.detectIntent(request)
	console.log('Detected intent')
	const result = responses[0].queryResult
	console.log(`  Query: ${result.queryText}`)
	console.log(`  Response: ${result.fulfillmentText}`)
	if (result.intent) {
	console.log(`  Intent: ${result.intent.displayName}`)
	}
	else {
	console.log(`  No intent matched.`)
	}
} */

// Универсальная функия обращения к Pllano App
async function getApp(method, source, id, param, access_token) {
	let resp = {}
	let options = {}
	let param_get = ''
	let token
	//param.access_token = access_token
	if (access_token) token = access_token.replace(/['"]/g, '')
	
	if (method == 'GET' && source && param) param_get = '?' + httpBuildQuery(param)
	else if (method == 'POST' && source && param) options.body = param
	
	if (token) options.headers = {'Auth': 'Bearer', 'Token': 'Bearer '+token, 'Content-Type': 'application/json'}
	let urlApp = pllanoApp+''+source+''+id+''+ param_get
	console.log('urlApp: '+urlApp)
	options.url = urlApp
	options.method = method
	options.json = true
	//console.log(options)
	resp = await requestPromise(options)
	return resp
}

// Статус авторизации, Авторизация, Регистрация
async function auth(msg, type) {
	let data = {}
	data.telegram = {}
	data.pllano = {}
	let id = await msg.from.id
	if (id) {
		let user_file = await user_telegram + '/' + id + '.json'
		if (user_file && fs.existsSync(user_file)) {
			data = JSON.parse(await fs.readFileSync(user_file, 'utf8')) // Читаем
		}
		for (var key in msg.from) {
			data.telegram[key] = await msg.from[key]
		}
		if (msg.contact && msg.contact.phone_number) {
			for (var key in msg.contact) {
				data.telegram[key] = await msg.contact[key]
			}
		}
		let resp = {}
		resp.state = 0
		let param = {}
		if (type == 'auth') {
			param.lang = await msg.from.language_code
			let access_token
			if (data.pllano.access_token) access_token = data.pllano.access_token
			resp = await getApp('GET', '/auth', '', param, access_token) // Проверяем авторизацию
			//console.log(resp)
		}
		else if (type == 'login') {
			param.id = id
			param.oauth = 'telegram'
			param.token = telegram_app_token
			if (data.telegram && data.telegram.first_name) param.iname = await data.telegram.first_name
			if (data.telegram && data.telegram.last_name) param.fname = await data.telegram.last_name
			if (data.telegram && data.telegram.language_code) param.language = await data.telegram.language_code
			if (data.telegram && data.telegram.phone_number) param.phone = await data.telegram.phone_number
			if (type == 'login' && param.phone) resp = await getApp('POST', '/auth', '', param)
		}
		if (resp.response && resp.headers && resp.headers.code && resp.headers.code == 200) {
			if (resp.response.authorization && resp.response.authorization == 1) {
				for (var key in resp.response) {
					if (responseSet.has(key)) data.pllano[key] = await resp.response[key]
				}
				if (resp.body && resp.body.user && resp.body.user.id) {
					for (var key in resp.body.user) {
						if (userSet.has(key)) data.pllano[key] = await resp.body.user[key]
					}
				}
				data.count = data.count + 1
				data.state = 1
				fs.writeFile(user_file, JSON.stringify(data), 'utf8') // Записываем
			}
		}
		else if (resp.response && resp.headers && resp.headers.code && resp.headers.code == 400) {
			data = auth(msg, 'login')
		}
	}
	return data
}

// Функция получения локализации в нужном языке
async function Language(lg) {
	let language = {}
	let param = {}
	let lang = new Set(['en', 'ru', 'ua', 'pl', 'de'])
	if (lang.has(lg)) {
		let file_cache = await dirlanguage + '/' + lg + '.json'
		if (!fs.existsSync(file_cache) || file_cache_update == 1) { // Проверяем наличие в локальном хранилище
			param = {'lang': lg}
			let requestArr = await getApp('GET', '/language', '', param) // Получаем язык по API
			if (requestArr.body && requestArr.body.language)
			language = await requestArr.body.language
			await fs.writeFileSync(file_cache, JSON.stringify(language), 'utf8') // Записать файл
		}
		else language = JSON.parse(fs.readFileSync(file_cache, 'utf8')) // Читаем из локального хранилища
	}
	return language
}

// Ответ при нажатии /start
async function question(msg, language) {
	let m
	m.title = language[165] // Для продолжения нужен ваш номер телефона
	m.options = {}
	// m = await menu(language, 'start') // Получаем меню
	chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id // отправка тому же пользователю
	botTelegram.sendMessage(chat, m.title, m.options) // обращение к боту
}

// функция для отправки ползователем мобильного телефона
async function authPhone(msg, language) {
	let resp
	botTelegram.sendMessage(msg.from.id, language[165] + '. ' + language[195] + ': ' + language[960], { // Для продолжения нужен ваш номер телефона
		// создание клавиатуры на стороне пользователя
		reply_markup: {
			resize_keyboard: true, //one_time_keyboard: true,
			keyboard: [[{text: language[960], request_contact: true}]]
		}
	})
	return resp
}

async function sendNumm(msg) {
	if (msg && msg.from && msg.from.id && msg.contact) {
		let numm = "+" + JSON.parse(msg.contact.phone_number)
		let body = {
			"url": "https://api.",
			"who": "telegaram_bot",
			"numm": numm,
		}
		//let userNum = await body
		//getApp('GET', '/', null, {})
	}
}

function menu(language, type) {
	let resp = {}
	resp.run = 1
	resp.title = 'BotMenu'
	resp.menu = [
		[{text: language[938], callback_data: 'Попробуйте снова/Try again'}], // позитивный вариант ответа, продолжает авторизицию
		[{text: language[939], url: pllanoSite + '/sign-in'}], // Перейти на сайт
	]
	resp.options = {reply_markup: JSON.stringify({inline_keyboard: resp.menu, parse_mode: 'Markdown'})}
	if (type) {
		if (type == 'start') resp.title = language[937] //вопрос который задает бот в самом начале
	}
	return resp
}

// Загрузка команд
async function commandGet(msg, userData, language, command, type) {
	let resp
	if (command == 'menu') resp = await menu(language, type)
	else if (command == 'phone') resp = await authPhone(msg)
	else if (command == 'getCart') resp = await getCart(msg, userData, language)
	return resp
}

// Собираем url
async function authQuery(userData) {
	let resp
    // Формируем параметры, для шифрования 
    let messageBot = JSON.stringify({
        'telegram_id': userData.telegram.id,
        'user_alias': userData.pllano.user_alias
	})
    // Шифруем, Encrypt
    let ciphertext = await CryptoJS.AES.encrypt(messageBot, telegram_crypto_key) // telegram_crypto_key - ключ шифрования, messageBot - строка для шифрования
    // console.log(ciphertext.toString())
    let param = {}
    param.auth = await ciphertext.toString() // Зашифрованное в виде строки
    param.bot = 'telegram'
    resp = await '?'+httpBuildQuery(param)
	return resp
}

// Товары в корзине
async function getCart(msg, userData, language) {
	let resp = {}
	let telegram_id = await userData.telegram.id
	let user_alias = await userData.pllano.user_alias
	let file = await user_cart_dir+'/'+user_alias+'.json'
	if (fs.existsSync(file)) {
		let cartArr = await JSON.parse(fs.readFileSync(file, 'utf8')) // Читаем корзину
		let order_options = {}
		let order_title = language[110]
		let ii = cartArr.length
		let ix = 0
		if (ii > 0) {
		    await cartArr.forEach(function(item, i, cartArr) {
				ix = i
				let buttons = [[
				    {text: language[799], callback_data: item.id+'|cart|delete'}, 
				    {text: language[952], callback_data: item.id+'|cart|wishlist'}, 
				    {text: language[636], callback_data: item.id+'|landing|add'}
				]]
				let title = item.name +' ('+language[36]+': '+item.price+' '+item.currency_id+')'
				let options = {
				    reply_markup: JSON.stringify({
				        inline_keyboard: buttons,
				        parse_mode: 'Markdown'
					})
				}
				//console.log(options)
				botTelegram.sendMessage(telegram_id, title, options) // Отправляем сообщение пользователю
			})
			
			order_options = {
			    reply_markup: JSON.stringify({
			        inline_keyboard: [[{text: language[114], callback_data: telegram_id+'|order|add'}]],
			        parse_mode: 'Markdown'
				})
			}
			order_title = language[110]+'. '+language[851]
			
		}
		if (ii == ix+1) {
			console.log('ii '+ii)
			console.log('ix '+ix)
			await sleep(2000)
		    botTelegram.sendMessage(telegram_id, order_title, order_options) // Отправляем сообщение пользователю
		}
	}
	return resp
}
// Корзина
// cart(msg, userData, telegram_user_id)
async function cart(msg, userData, language, telegram_user_id) {
    let dataCart
    if(msg.text) dataCart = await msg.text
    else if (msg.data) dataCart = await msg.data
    let separatorData = '|' // разделитель для работы с данными
    if (dataCart && dataCart.match(separatorData)) {
        // Если обнаружен разделитель, разбираем его
		// product_id|cart|add
        let arr = await dataCart.split(separatorData)
		let product_id
		let metod
        if (arr[0]) product_id = arr[0]
        if (arr[2] && arr[2] != '') metod = arr[2]
        if (product_id && metod && metod != '') {
			let user_alias = await userData.pllano.user_alias
			let cartData = []
			let file = await user_cart_dir+'/'+user_alias+'.json'
			if (fs.existsSync(file)) {
			    cartData = await JSON.parse(await fs.readFileSync(file, 'utf8')) // Читаем из локального хранилища					
			}
			let product = {}
			let appGet = {}
			let item = {}
			let access_token = await userData.pllano.access_token
			// Получаем карточку товара
			appGet = await getApp('GET', '/search', '/'+product_id, {'lang': 'ru'}, access_token)
			if (appGet.body && appGet.body.items && appGet.body.items.item && appGet.body.items.item._id) {
				item = await appGet.body.items.item._source
				let data = {}
				item_id = await appGet.body.items.item._id
				data.id = item_id
				data.metod = metod
				data.state = metod
				data.num = 1
				data.name = item.productName
				data.vendorName = item.productVendorName
				data.price = item.productPriceLocal
				data.old_price = item.productPriceOldLocal
				data.currency_id = item.currencyId
				data.image = item.images[0]
				data.url = await pllanoSite+'/marketplace/'+item_id
				let title = await metod
				console.log('metod '+metod)
				
				if (cartData.length > 0 && data.id) {
		            let ok
		            let ii = 0
		            await cartData.forEach(function(it, i, cartData) {
		                if (it.id == data.id) {
					        ok = 1
					        ii = i
						}
					})
					
		            if (ok) {
		                if (metod == 'cart' || metod == 'wishlist' || metod == 'collection') cartData[ii].state = data.state
		                else if (metod == 'delete') {
							cartData.splice(ii, 1)
						}
		                else if (metod == 'remove') {
							cartData[ii] = data
						}
		                else if (metod == 'decrease' || metod == 'increase' || metod == 'quantity') {
							cartData[ii].num = data.num
						}
					}
		            else if (metod == 'add') {
						await cartData.push(data)
						title = language[839]
					}
				}
				else if (metod == 'add') {
					cartData['0'] = await data
					title = language[839]
				}
				
				console.log('title '+title)
				botTelegram.sendMessage(telegram_user_id, title) // Отправляем сообщение пользователю
				
				await fs.writeFileSync(file, JSON.stringify(cartData), 'utf8') // Записываем в локальное хранилище
				
			}
		}
	}
}

// Функция роутер, отвечает за обработку входящих запросов
async function router(msg, userData, language, telegram_user_id) {
	// По умолчанию
	//console.log(msg)
	let options
	let title
	if(msg.text) title = await msg.text
	else if (msg.data) title = await msg.data
	
	let original_title = title
	
	let command // Команда по умолчанию
	let commandData
	let commandUser = 'none'
	let keyId // ключ по умолчанию
	let control = 0
	let from = 0
	let size = 1
	let access_token
	// let file = await user_telegram+'/'+telegram_user_id+'.json'
	//console.log('app')
	
	if (!httpSet.has(title)) { // Исключили роутинг
		let separatorAdmin = '#' // разделитель для сообщений от админов
		if (title.match(separatorAdmin) && adminSet.has(telegram_user_id)) { // Пропускаем если сообщение написал админ и в нем есть разделитель #
			let arr = title.split(separatorAdmin) // telegram_user_id#command#text (400034907##Текст сообщения)
			//console.log(arr)
			if (arr[0]) telegram_user_id = arr[0]
			if (arr[1] && arr[1] != '') command = arr[1]
			if (arr[2]) title = arr[2]
			if (command) {
				commandData = await commandGet(msg, userData, language, command, type) // Запрашиваем команду
				// Получаем параметры для отправки сообщения пользотелю
				if (commandData.run) {
					if (commandData.options) options = commandData.options
					if (commandData.title) title = commandData.title
				}
			}
		}
		else {
			
			questions_ru = await JSON.parse(await fs.readFileSync(dir+'/questions_ru.json', 'utf-8')) // Загружаем файл
			let get_answers_ru = await JSON.parse(await fs.readFileSync(dir+'/answers_ru.json', 'utf-8')) // Загружаем файл
			answers_ru = await Object.assign(get_answers_ru, answers_ru)
			
			console.log('user: '+title) // Выводим полученный текст от telegram
			let separatorData = '|' // разделитель для работы с данными
			
			if (title.match(separatorData)) {
				// Если обнаружен разделитель, разбираем его
				let arrData = title
				let arr = arrData.split(separatorData) // Text|app|from|size или Стол|app|2|0
				if (arr[0]) title = arr[0]
				if (arr[1] && arr[1] != '') commandUser = arr[1]
				if (commandUser && commandUser == 'app') {
					if (arr[2] && arr[2] != '') from = arr[2]
					if (arr[3] && arr[3] != '') size = arr[3]
				}
			}
			
			//title = await cleanJson(title) // Чистим текст
			title = await cleanStr(title) // Еще раз чистим текст
			
			if (commandUser == 'none') {
				// Вопросы
				if (questions_ru[title]) keyId = await questions_ru[title]
				else {
					let new_text = await AutoText(title)
					if (questions_ru[new_text]) keyId = await questions_ru[new_text]
					else {
						let tests = 0
						for (var key in questions_ru) {
							if (key.indexOf(title) >= 0) {
								//console.log('key '+key)
								keyId = await questions_ru[key]
								//console.log('keyId '+keyId)
								if (keyId) break
							}
						}
					}
				}
				
				// Если ключ keyId найден
				if (keyId) {
					// Ответы
					let answer_list_ru
					if (answers_ru[keyId]) answer_list_ru = await answers_ru[keyId]
					let length_answer_list_ru
					if (answer_list_ru) length_answer_list_ru = await Object.keys(answer_list_ru).length
					let new_key
					if (length_answer_list_ru) new_key = await rand(length_answer_list_ru)
					if (answer_list_ru[new_key]) {
						title = await answer_list_ru[new_key]
						control = 1 // Текст есть !
					}
					else commandUser = 'app' // Ответ не найден, запрашиваем App
					
					let commands = { // Каталог команд, вынести в файл
						4: {'command': 'menu', 'type': 'start'},
						5: {'command': 'getCart', 'type': ''},
						//6: {'command': 'phone', 'type': null},
					}
					if (commands[keyId]) {
						commandData = await commandGet(msg, userData, language, commands[keyId].command, commands[keyId].type)
						if (commandData) {
							if (commands[keyId].command == 'getCart') {
								title = await JSON.stringify(commandData)
								control = 1 // Текст есть !
							}
							else options = await commandData
						}
					}
				}
				else commandUser = 'app' // Ответ не найден, запрашиваем App
			}
			
			if (commandUser == 'app' && userData.pllano.access_token) {
				let items = {}
				// Поиск товаров. Попытка №1
				let controlCache = 0
				let controlGet = 0
				let appGet = {}
				let param = {}
				param.query = 'ru'
				if (lang.has(userData.telegram.language_code)) param.lang = userData.telegram.language_code
				param.query = title
				param.from = from
				param.size = size
				
				let param_id = ''
				let param_get = '?'+httpBuildQuery(param)
				
				if (userData.pllano.access_token) access_token = userData.pllano.access_token
				let cache_subscription = ''
				if (userData.pllano.subscription && userData.pllano.subscription.state == 1) cache_subscription = 'subscription'
				let bot_cache = dir+'/marketplace'
				if (!fs.existsSync(bot_cache)) await fs.mkdirSync(bot_cache)
				let cache_name = await crypto.createHash('md5').update('/marketplace'+param_id+param_get).digest("hex")
				let file_cache = await bot_cache+'/'+cache_subscription+'_'+cache_name+'.json'

				if (fs.existsSync(file_cache)) {
					items = JSON.parse(fs.readFileSync(file_cache, 'utf8')) // Читаем кэш из локального хранилища
					if (items.hits && items.hits.hits[0]._id) controlGet = 1
					if (!items.time || new Date(items.time).getTime() > new Date(control_cache.time).getTime()) controlCache = 1
				}
				else if (!fs.existsSync(file_cache) || file_cache_update == 1) controlCache = 1
				
				console.log('controlCache '+controlCache)

				if (controlCache == 1) {
					//console.log(param)
					//console.log(access_token)
					
					appGet = await getApp('GET', '/search', '', param, access_token)
					console.log(appGet)
					
					
					if (appGet.body && appGet.body.items && appGet.body.items.hits && appGet.body.items.hits.total >= 1) controlGet = 1
					else {
						// Поиск товаров. Попытка №2
						param.query = await AutoText(title)
						appGet = await getApp('GET', '/search', '', param, access_token)
						if (appGet.body && appGet.body.items && appGet.body.items.hits && appGet.body.items.hits.total >= 1) controlGet = 1
					}
					
					if (appGet.body && appGet.body.items) {
						items = await appGet.body.items
					    items.time = control_cache.time
					}
					await fs.writeFileSync(file_cache, JSON.stringify(items), 'utf8') // Записываем кэш в локальное хранилище
				}

				if (controlGet == 1) {
					// Если controlGet = 1 то значит мы запрашивали API
					// console.log(appGet.body.items.hits.hits[0])
					// Берем один, первый товар
					let item = items.hits.hits[0]._source
					let item_id = items.hits.hits[0]._id
					
					// Обьект: карточка товара
					let arrItems = {}
					arrItems.id = item_id
					arrItems.name = item.productName
					arrItems.vendorName = item.productVendorName
					arrItems.price = item.productPriceLocal
					arrItems.old_price = item.productPriceOldLocal
					arrItems.currency_id = item.currencyId
					arrItems.image = item.images[0]
					let auth_query = await authQuery(userData)
					arrItems.url = await pllanoSite+'/marketplace/'+item_id+''+auth_query
					// Отдаем telegram
					//title = await JSON.stringify(arrItems)
					await botTelegram.sendPhoto(telegram_user_id, arrItems.image) // Отправили картинку
					//console.log(arrItems)
					// Text|app|from|size или Стол|app|2|0
					//let next_from = Number(from)+1
					let next = title+'|app|'+(Number(from) + 1)+'|'+size
					let previous = title+'|app|'+(Number(from) - 1)+'|'+size
					// product_id|command|model , command = cart, model = add, delete, wishlist, collection
					
					let user_alias = await userData.pllano.user_alias
					let cartData = []
					let cart_file = await user_cart_dir+'/'+user_alias+'.json'
					if (fs.existsSync(cart_file)) {
						cartData = await JSON.parse(await fs.readFileSync(cart_file, 'utf8')) // Читаем из локального хранилища					
					}
					
					let ok
					if (cartData.length > 0 && item_id) {
						await cartData.forEach(function(it, i, cartData) {
							if (it.id == item_id) ok = 1
						})
					}
					
					let cartMenu = []
					if (ok) {
						// Если товар в корзине показываем: "Удалить" и "В избранное"
						cartMenu = [
							{text: language[636], callback_data: arrItems.id+'|landing|add'},
							{text: language[952], callback_data: arrItems.id+'|cart|wishlist'},
							{text: language[799], callback_data: arrItems.id+'|cart|delete'}
						]
					}
					else {
						// Или предлагаем добавить в корзину 
						cartMenu = [
							{text: language[636], callback_data: arrItems.id+'|landing|add'},
							{text: language[952], callback_data: arrItems.id+'|cart|wishlist'},
							{text: language[3], callback_data: arrItems.id+'|cart|add'}
						]
					}
					
					let buttons = [cartMenu, [
						{text: language[449], callback_data: previous},
						{text: 'URL', url: arrItems.url},
						{text: language[814], callback_data: next}
					]]
					
					//console.log(buttons)
					
					title = arrItems.name +' ('+language[36]+': '+arrItems.price+' '+arrItems.currency_id+')'
					options = {
						reply_markup: JSON.stringify({
							inline_keyboard: buttons,
							parse_mode: 'Markdown'
						})
					}
					
					control = 1 // Текст есть !
				}
			
			    
			}

			//console.log(param_log)
			//console.log(search_log)
			
			if (control == 0) {
				// Ничего не найдено
				// Можешь сказать то же самое другими словами?
				answer_list_ru = await answers_ru[0]
				//console.log(answer_list_ru)
				let length_answer_list_ru = await Object.keys(answer_list_ru).length
				let new_key = await rand(length_answer_list_ru)
				title = await answer_list_ru[new_key]
			}
		}
	}
	else if (title == '/start') {
		// С возвращением first_name! Благодарим за то что вы с нами!. Вы авторизованы
		title = language[412]+' '+msg.from.first_name+'. '+language[262]+'. '+language[426]
		options = {}
	}
	
	if (!adminSet.has(telegram_user_id)) {
		for (let key of adminSet) {
			// Пока что отключил
			// if (key = 711610523) botTelegram.sendMessage(key, telegram_user_id+'##'+title) // Отправляем сообщение админам
		}
	}
	
	let push_param = {}
	push_param.index = 'search_log'
	push_param.token = push_elastic_token
	push_param.date_time = date_time
	push_param.date = date
	push_param.telegram_user_id = telegram_user_id
	push_param.user_alias = await userData.pllano.user_alias
	push_param.original_title = original_title
	push_param.title = await title
	getApp('POST', '/push', '', push_param)
	//let search_log = await getApp('POST', '/push', '', push_param)
	
	//botTelegram.sendMessage(telegram_user_id, JSON.stringify(search_log))
	
	console.log('bot: '+title)
	if (title) botTelegram.sendMessage(telegram_user_id, title, options) // Отправляем сообщение пользователю
}

// Полужирное начертание — две звёздочки (**) с каждой стороны.
// Курсив — символ подчёркивания (_) с каждой стороны.
// Моноширинный шрифт — три знака апострофа (‘) с каждой стороны.
// функция обработки любых сообщений
botTelegram.on('message', async function (msg) {
	console.log(msg)
	if (msg && msg.from && msg.from.id && msg.chat && msg.chat.id) {
		let telegram_user_id = await msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id
		let lg = await cleanJson(msg.from.language_code) // получения языка на стороне пользователя
		let language = await Language(lg) // загрузка языкового пакета
		if (msg.from.is_bot == false) { // Закрываем доступ ботам
			//botTelegram.sendMessage(chat, JSON.stringify(msg)) // для отладки, возращаем боту все что от него получили
			let authTest
			authTest = await auth(msg, 'auth') // Проверяем авторизацию
			if (authTest && authTest.state && authTest.state == 1) { // Если только начал общение с ботом, на счетчике 1
				if (authTest.pllano && authTest.pllano.authorization && authTest.pllano.authorization == 1) { // Авторизован
					if (msg.contact && msg.contact.phone_number) {
						botTelegram.sendMessage(telegram_user_id, language[262]) // Вы авторизованы
						await sleep(2000)
						botTelegram.sendMessage(telegram_user_id, hello) // Информация
						await sleep(2000)
						botTelegram.sendMessage(telegram_user_id, language[956]) // Мы выплачиваем самый большой кэшбэк, разделяя торговую наценку между лидерами мнений и покупателями.
						await sleep(1000)
						botTelegram.sendMessage(telegram_user_id, language[896]) // Призыв начать
					}
					if (msg.text && msg.text != '') {
					    router(msg, authTest, language, telegram_user_id) // Отдаем роутеру
					}
				}
				
			}
			else {
				if (msg.from.first_name) botTelegram.sendMessage(telegram_user_id, language[170] + ' ' + msg.from.first_name)
				botTelegram.sendMessage(telegram_user_id, language[255]) // Выводит текст: Вы не авторизованы
				authPhone(msg, language) // Просим у пользователя номер телефона и после получения запускаем авторизацию авторизуем
				if (msg.contact && msg.contact.phone_number) authTest = await auth(msg, 'login') // Авторизуемся, если получили номер телефона
				if (authTest && authTest.state && authTest.state == 1) { // Если только начал общение с ботом, на счетчике 2
					if (authTest.count && authTest.count <= 2) {
					    botTelegram.sendMessage(telegram_user_id, language[262]) // Вы авторизованы
						await sleep(2000)
						botTelegram.sendMessage(telegram_user_id, hello) // Информация
						await sleep(2000)
						botTelegram.sendMessage(telegram_user_id, language[956]) // Мы выплачиваем самый большой кэшбэк, разделяя торговую наценку между лидерами мнений и покупателями.
						await sleep(1000)
						botTelegram.sendMessage(telegram_user_id, language[896]) // Призыв начать
					}
					// Продолжаем работу с юзером
					// Можем что то вывести, меню например или текст, описание возможностей бота
				}
			}
		}
		else if (msg.from.is_bot == true) { // Если нам пишет бот
			let title = await msg.text
			//title = await cleanJson(title) // Чистим json
			title = await cleanStr(title) // Еще раз чистим текст
			if (!adminSet.has(telegram_user_id)) {
				for (let key of adminSet) {
					// Пересылаем админам сообщение от ботов
					if (title != '') botTelegram.sendMessage(key, telegram_user_id+'##Bot: '+title)
				}
			}
		}
	}
})

// функция запуска события по нажатию на кнопку авторизации
botTelegram.on('callback_query', async function (msg) {
	let telegram_user_id = await msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id
    if (msg && telegram_user_id) {
		
		let lg = await cleanJson(msg.from.language_code) // получения языка на стороне пользователя
		let language = await Language(lg) // загрузка языкового пакета
		let access_token
		let userData = {}
		let user_file = await user_telegram + '/' + telegram_user_id + '.json'
		if (user_file && fs.existsSync(user_file)) {
			userData = JSON.parse(await fs.readFileSync(user_file, 'utf8')) // Читаем
		}
		let msgData = msg.data
		let separatorData = '|' // разделитель для работы с данными
		if (msgData.match(separatorData)) {
			if (userData.pllano && userData.pllano.authorization && userData.pllano.authorization == 1) {
				let arr = msgData.split(separatorData)
				let command
				if (arr[1] && arr[1] != '') command = arr[1]
				if (command) {
					console.log('command '+command)
					// Text|app|from|size или Стол|app|2|0
					if (command == 'app') {
						router(msg, userData, language, telegram_user_id)
					}
					// product_id|command|model , command = cart, model = add, delete, wishlist, collection
					else if (command == 'cart') cart(msg, userData, language, telegram_user_id) // Работаем с корзиной
				}
			}
		}
		else {
			// Нажатия на конпки команды
			// authPhone(msg, language)
		}
	}
})

// функция реакции на команду /start
botTelegram.onText('/start', async function (msg, match) {
	let lg = await cleanJson(msg.from.language_code) // получения языка на стороне пользователя
	let language = await Language(lg)
	question(msg, language) // вызов функции question
})

botTelegram.onText('/card', async function (msg) {
	let send
	send = 'https://api.qrserver.com/v1/create-qr-code/?size=450x450&data=' + msg.from.id + '_' + msg.from.first_name // http://goqr.me/api/  http://goqr.me/api/doc/
	if (msg.from && msg.from.last_name) send = send + '_' + msg.from.last_name
	//console.log(msg)
	botTelegram.sendMessage(msg.chat.id, send) //вызов функции question
})
