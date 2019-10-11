// Подключаем пакеты
let fs = require('fs-extra')
let requestPromise = require('request-promise')
let natural = require('natural')
let TelegramBot = require('node-telegram-bot-api')
let TelegramToken = '689957809:AAEro1IpdojropqvfbIH2RwHUcvsV6pGEfc' // Устанавливаем токен TelegramBot
let botTelegram = new TelegramBot(TelegramToken, {polling: true}) // Подключаемся к боту
let httpBuildQuery = require('http-build-query')
// Директории
let dir = __dirname + '/file'
if (!fs.existsSync(dir)) fs.mkdirSync(dir)
let dirlanguage = dir + '/language'
if (!fs.existsSync(dirlanguage)) fs.mkdirSync(dirlanguage)
let userdir = dir + '/user_data'
if (!fs.existsSync(userdir)) fs.mkdirSync(userdir)
// Конфигурация
let PllanoBotToken = TelegramToken // Устанавливаем токен PllanoBot
let site = 'https://club.pllano.com'
let pllanoApp = 'https://app.pllano.com'
let file_cache_update = 0 // Сохранять кеш или нет ?
let responseSet = new Set(['authorization', 'access_token', 'refresh_token', 'datetime_token'])
let userSet = new Set(['id', 'cart_id', 'user_role', 'state', 'seller', 'partner', 'rating', 'bonus_code', 'referral_code', 'iname', 'fname', 'email', 'phone', 'balans'])
let httpSet = new Set(['/start', '/stop', '/club', '/marketplace'])
//const answerSet = new Set(['Привет', 'Меню', 'Тест', 'Test'])

let adminSet = new Set([711610523, 4000349070])

//let tokenizer = new natural.WordTokenizer()
let tokenizer = new natural.AggressiveTokenizerRu()

async function Clean(r) {
	return await JSON.stringify(r).replace(/["']/g, "")
}

// Универсальная функия обращения к Pllano App
async function getApp(method, source, id, param, access_token) {
	let resp = {}
	let options = {}
	let param_get = ''
	
	if (method == 'GET' && source && param) param_get = '?' + httpBuildQuery(param)
	else if (method == 'POST' && source && param) options.body = param
	
	if (access_token) options.headers = {'Auth': 'Bearer', 'Token': 'Bearer ' + access_token + '', 'Content-Type': 'application/json'}
	options.url = pllanoApp+''+source+''+id+''+ param_get
	options.method = method
	options.json = true
	//console.log(options)
	resp = await requestPromise(options)
	return resp
}

// Статус авторизации, Авторизация, Регистрация (Свел в одну функцию)
async function auth(msg, type) {
	let data = {}
	data.telegram = {}
	data.pllano = {}
	let id = await msg.from.id
	if (id) {
		let user_file = await userdir + '/' + id + '.json'
		if (user_file && fs.existsSync(user_file))
		data = JSON.parse(await fs.readFileSync(user_file, 'utf8')) // Читаем
		for (let key in msg.from) {
			data.telegram[key] = await msg.from[key]
		}
		if (msg.contact && msg.contact.phone_number) {
			for (let key in msg.contact) {
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
		}
		else if (type == 'login') {
			param.id = id
			param.oauth = 'telegram'
			param.token = PllanoBotToken
			if (data.telegram && data.telegram.phone_number) param.phone = await data.telegram.phone_number
			if (type == 'login' && param.phone) resp = await getApp('POST', '/auth', '', param)
		}
		
		if (resp.response && resp.headers && resp.headers.code && resp.headers.code == 200) {
			if (resp.response.authorization && resp.response.authorization == 1) {
				for (let key in resp.response) {
					if (responseSet.has(key)) data.pllano[key] = await resp.response[key]
				}
				if (resp.body && resp.body.user && resp.body.user.id) {
					for (let key in resp.body.user) {
						if (userSet.has(key)) data.pllano[key] = await resp.body.user[key]
					}
				}
				fs.writeFile(user_file, JSON.stringify(data), 'utf8') // Записываем
				data.state = 1
			}
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

// функция создания и отправки вопросов
async function question(msg) {
	let lg = await Clean(msg.from.language_code) // получения языка на стороне пользователя
	let language = await Language(lg)
	let m = await menu(msg, language, 'start') // Получаем меню
	chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id // отправка тому же пользователю
	botTelegram.sendMessage(chat, m.title, m.options) // обращение к боту
	
}

// функция для отправки ползователем мобильного телефона
async function getNumm(msg) {
	let lg = await Clean(msg.from.language_code) // получения языка на стороне пользователя
	let language = await Language(lg) // загрузка языкового пакета в масив
	botTelegram.sendMessage(msg.from.id, language[165] + '. ' + language[195] + ': ' + language[960], { // Для продолжения нужен ваш номер телефона
		// создание клавиатуры на стороне пользователя
		reply_markup: {
			resize_keyboard: true, //one_time_keyboard: true,
			keyboard: [[{text: language[960], request_contact: true}]]
		}
	})
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
	resp = {}
	resp.title = 'BotMenu'
	resp.menu = [
	    [{text: language[938], callback_data: 'Попробуйте снова/Try again'}], // позитивный вариант ответа, продолжает авторизицию
	    [{text: language[939], url: site + '/sign-in'}], // Перейти на сайт
	]
	resp.options = {reply_markup: JSON.stringify({inline_keyboard: resp.menu, parse_mode: 'Markdown'})}
	if (type) {
		if (type == 'start') resp.title = language[937]//вопрос который задает бот в самом начале
	}
	return resp
}

async function ii(language, title, param) {
	let m = await menu(language) // Получаем меню
	resp = {}
	resp.title = title
	resp.options = {}
	resp.menu = await m
	//console.log(m)
	let value = {
	    'Привет': {title: 'Здравствуйте', options: resp.menu.options},
	    'Как дела ?': {title: 'Отлично!', options: {}},
	    'Как дела?': {title: 'Прекрастно!', options: {}},
	    'Как тебя зовут ?': {title: 'PLLANO Bot', options: {}},
	    'Ты кто ?': {title: 'PLLANO Bot', options: {}},
	    'Ты кто?': {title: 'PLLANO Bot', options: {}},
	}
	for (let key in value) {
	    if (key == title) {
	        resp.title = await value[key].title
	        resp.options = await value[key].options
	    }
	}
	return resp
}
// функция запуска события по нажатию на кнопку авторизации
botTelegram.on('callback_query', function (msg) {
	getNumm(msg)
})

// функция обработки любых сообщений
botTelegram.on('message', async function (msg) {
	if (msg && msg.from && msg.from.id && msg.chat && msg.chat.id && msg.from.is_bot == false) { // Закрываем доступ ботам
		let chat = await msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id // отправка тому же пользователю
		//console.log(msg)
		let comand
		// botTelegram.sendMessage(chat, JSON.stringify(msg)) //функция для отладки
		let authTest
		let lg = await Clean(msg.from.language_code) // получения языка на стороне пользователя
		let language = await Language(lg) // загрузка языкового пакета в масив
		let file = await userdir + '/' + msg.from.id + '.json'
		authTest = await auth(msg, 'auth') // Проверяем авторизацию
		if (authTest && authTest.state && authTest.state == 1) {
			botTelegram.sendMessage(chat, language[262]) // Вы авторизованы
			if (authTest.pllano && authTest.pllano.authorization && authTest.pllano.authorization == 1) {
				if (msg.text && msg.text != '') {
					
					let title = await msg.text
					let options = {}
					
					if (!httpSet.has(title)) { // Исключили роутинг
						let separator = '#' // разделитель
						if (title.match(separator) && adminSet.has(chat)) {
							let arr = title.split(separator) // id#comand#text (400034907##Текст сообщения)
							//console.log(arr)
							chat = arr[0]
							if (arr[1] != '') comand = arr[1]
							if (comand) {
							    options = {}
							}
							title = arr[2]
						}
						else {
							title = await Clean(title)
						    // Работаем с вопросами от юзера
						    console.log('user: '+title)
						    //console.log(tokenizer.tokenize(title))
						    // Отправляем вопрос админу
						    

						    // Наши ответы на вопросы, в ответ можно давать что угодно
						    let ix = await ii(language, title)
						    //console.log(ix)
						    title = ix.title
						    options = ix.options
						}
					}
					else {
						if (title == '/start') {
							
							let m = await menu(language) // Получаем меню
						    title = m.title
							options = m.options
							
						}
						else if (title == '/stop') {
						
						    title = ''
							
						}
					}
					
					if (!adminSet.has(chat)) {
						for (let key of adminSet) {
						    //botTelegram.sendMessage(key, chat+'##'+title)
					   }
					}
					console.log('bot: '+title)
					botTelegram.sendMessage(chat, title, options)
				}
			}
		}
		else {
			if (msg.from.first_name) botTelegram.sendMessage(chat, language[170] + ' ' + msg.from.first_name)
			botTelegram.sendMessage(chat, language[255]) // Вы не авторизованы
			getNumm(msg) // Просим у пользователя номер телефона и после получения запускаем авторизацию авторизуем
			if (msg.contact && msg.contact.phone_number) authTest = await auth(msg, 'login') // Авторизуемся
			if (authTest && authTest.state && authTest.state == 1) {
				botTelegram.sendMessage(chat, language[262]) // Вы авторизованы
				// Продолжаем работу с юзером
			}
		}
	}
})

// функция реакции на команду /start
botTelegram.onText('/start', function (msg, match) {
	botTelegram.sendMessage(msg.chat.id, ' -- start -- ')
	question(msg) //вызов функции question
})

botTelegram.onText('/card', function (msg) {
card()
})

function card(){
	let send
	send = 'https://api.qrserver.com/v1/create-qr-code/?size=450x450&data=' + msg.from.id + '_' + msg.from.first_name // http://goqr.me/api/  http://goqr.me/api/doc/
	if (msg.from && msg.from.last_name) send = send + '_' + msg.from.last_name
	//console.log(msg)
	botTelegram.sendMessage(msg.chat.id, send) //вызов функции question
}