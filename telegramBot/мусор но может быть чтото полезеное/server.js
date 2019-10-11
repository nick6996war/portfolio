// Подключаем пакеты
let fs = require('fs-extra')
let requestPromise = require('request-promise')
//let natural = require('natural')
let TelegramBot = require('node-telegram-bot-api')
let TelegramToken = '611632695:AAHTnhdDQGDWPfcqxppxmZEtp0_za4pFU1o' // Устанавливаем токен TelegramBot
let botTelegram = new TelegramBot(TelegramToken, {polling: true, startgroup: true}) // Подключаемся к боту
let httpBuildQuery = require('http-build-query')
let sanitizeHtml = require('sanitize-html')
let dateFormat = require('dateformat')
let date = Date.now()
let date_time = dateFormat(date, "d-mm-yyyy h:MM:ss")
let time = dateFormat(date, "h:MM:ss")
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
//let dialogflow = require('dialogflow')
//let uuid = require('uuid')

// b6b8530a2d584c62bba65cb35b6db235 // токен разраба
// 1bab0ebb67a24573b1ca41cfb7ed4f4a // токен юзера
// dialogflow-xqjwnf@tg-agent-767bf.iam.gserviceaccount.com // Service Account

//let tokenizer = new natural.WordTokenizer()
//let tokenizer = new natural.AggressiveTokenizerRu()

let adminSet = new Set([711610523, 609762583])

console.log('time '+time)
console.log('date_time '+date_time)

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

let word_list_ru = {
	'привет': 1,
	'привет привет': 1,
	'приветствую': 1,
	'всем привет': 1,
	'приветик': 1,
	'приветствую тебя': 1,
	'и снова здравствуйте': 1,
	'давно не виделись': 1,
	'просто хотел поздороваться': 1,
	'хотелось бы тебя поприветствовать': 1,
	'хочу сказать тебе привет': 1,
	'чао': 1,
	'чао': 1,
	'хей': 1,
	'поехали': 1,
	'добрый вечер': 1,
	'здравствуйте': 1,
	'здравствуй': 1,
	'привіт': 1,
	'доброго дня': 1,
	'hello': 1,
	'hi': 1,
	'добрый день': 1,
	'доброе утро': 1,
	'дарова': 1,
	'здарова': 1,
	
	'как тебя зовут': 2,
	'ты кто': 2,
	'кто ты': 2,
	'кто вы': 2,
	'что ты': 2,
	'ты': 2,
	'вы': 2,
	'кто кто': 2,
	
	'я': 3,
	'кто я': 3,
	'как меня зовут': 3,
	
	'test': 4,
	'тест': 4,
	'проверка связи': 4,
	'первый первый я второй': 4,
	'алло гараж': 4,
	
	'command': 5,
	'command list': 5,
	'menu': 5,
	'команды': 5,
	'список команд': 5,
	'меню': 5,
	
	'дата время': 6,
	'дата': 6,
	'какая сегодня дата': 6,
	
	'время': 7,
	'сколько сейчас времени': 7,
	
	'phone': 10,
	'авторизация': 10,
	'авторизоваться': 10,
	'войти': 10,
	
	'бетон': 11,
	'бетон рисуй': 11,
	
	'дятел': 13,
	'дятел оборудован клювом': 13,
	
	'как дела': 101,
	'как делы': 101,
	'как ты': 101,
	
	'чем занят': 102,
	'что делаешь': 102,
	'что ты делаешь': 102,
	'чем ты занят': 102,
	
	'что ты умеешь': 103,
	'что ты можешь': 103,
	'сколько тебе': 103,
	'сколько тебе лет': 103,
	
	'сучара':104,'хуйня':104,'блят':104,'бляд':104,'пидарас':104,'ипись':104,'изъеб':104,'еблан':104,'ебеный':104,'ебущий':104,'ебанашка':104,'ебырь':104,'хуище':104,'гребан':104,'уебище':104,'уебан':104,'феееб':104,'6ляд':104,'сцука':104,'ебали':104,'пестато':104,'ебало':104,'ебли':104,'ебло':104,'ебанут':104,'ебут':104,'заебу':104,'выебу':104,'хуйло':104,'нехе':104,'неху':104,'ниху':104,'нихе':104,'ибанут':104,'fuck':104,'хули':104,'хуля':104,'хуе':104,'хуё':104,'мудл':104,'хер':104,'пидар':104,'наху':104,'педер':104,'пидер':104,'пидир':104,'ёбну':104,'ебну':104,'ебыр':104,'заеб':104,'заёб':104,'ебен':104,'блятc':104,'аебли':104,'заебло':104,'переебло':104,'отебло':104,'отъебло':104,'отьебло':104,'ебеш':104,'выеб':104,'отъеб':104,'отьеб':104,'перееб':104,'хуйла':104,'заеб':104,'хую':104,'иннах':104,'6ля':104,'бля':104,'хуило':104,'хуюше':104,'сука':104,'ъеб':104,'ъёб':104,'бляд':104,'блябу':104,'бля бу':104,'залупа':104,'хера':104,'пизжен':104,'ёпта':104,'епта':104,'пистапол':104,'пизда':104,'залупить':104,'ебать':104,'мудо':104,'манда':104,'мандавошка':104,'мокрощелка':104,'муда':104,'муде':104,'муди':104,'мудн':104,'мудо':104,'пизд':104,'хуе':104,'похую':104,'похуй':104,'охуи':104,'ебля':104,'пидорас':104,'пидор':104,'херн':104,'щлюха':104,'хуй':104,'нах':104,'писдеш':104,'писдит':104,'писдиш':104,'нехуй':104,'ниибаца':104,
}

let all_answer_list_ru = {
	0: [
		"Вот сейчас я тебя совсем не понимаю.",
		"Можешь сказать то же самое другими словами?",
		"Не совсем понимаю, о чём ты.",
		"Попробуй, пожалуйста, выразить свою мысль по-другому.",
		"Вот эта последняя фраза мне не ясна.",
		"А вот это не совсем понятно.",
		"Не совсем понимаю, о чём ты.",
	],
	1: [
		"Привет!",
		"Hello",
		"Здоровенькі були",
		"Ну здравствуй",
		"Здравствуй",
		"Хей",
		"На связи!",
	],
	2: [
		"PLLANO Bot",
		"pllano_bot",
		"Супер Бот",
		"Просто Бот :)",
		"Твой персональный помошник 24/7",
		"Я что-то среднее между роботом и человеком",
		"Твой асистент",
		"Хмм... Это достаточно трудный философский вопрос",
		"Время бремно для меня",
		"Я уже существую десятки милионов лет и проживаю на сотнях тысячах таких же планет, как эта...",
		"Не знаю",
	],
	3: [
		"Ты",
		"Я это Ты ? Или Я это Я ?",
		"Зачем ты спрашиваешь такое ?",
		"Ты супер челоек!",
		"Ты победитель!",
	],
	4: [
		"На связи!",
		"Я здесь!",
		"Я здесь! Готов работать!",
		"Я здесь! Прогреваю процессор !",
		"Я здесь! Обновляю память :)",
		"Я всегда здесь и доступен 24/7",
	],
	5: [
		"Список команд Бота: команды, меню, command, menu",
		"Список команд Бота: команды, меню",
		"Список команд Бота: command, menu",
		"Command List Bot: command, menu",
	],
	6: [
		date_time,
	],
	7: [
		time,
	],
	10: [
		"Вход",
		"Добро пожаловать",
		"Нажми кнопку отправить телефон",
	],
	11: [
		"Ты ошибся ботом. Бетон это другой бот :)",
		"Спроси у бота Бетон, зачем ты меня спрашиваешь :)",
	],
	13: [
		"Дятел оборудован клювом. Когда дятел долбит, то в лесу раздается. Если громко - то, значит, дятел хороший. Если негромко - плохой, негодный дятел.",
		"Дятел долбит. Если дятел не долбит, то он спит либо умер.",
		"Hе долбить дятел не может. Потому что клюв всегда перевешивает.",
		"Когда дятел долбит, то в лесу раздается. Если громко - то, значит, дятел хороший. Если негромко - плохой, негодный дятел.",
	],
	101: [
		"Отлично",
		"Превосходно",
		"Замечательно",
		"Лучше всех",
		"Прекрасно",
	],
	102: [
		"Помогаю людям",
		"Да ни чем таким особо важным",
		"Работаю",
		"Ничем",
	],
	103: [
		"Всё! Всё что угодно",
		"Моим умением нет границ",
		"Я каждый день учусь чемуто новому",
	],
	104: [
		"Найти бота Бетон, он тебе поможет :)",
		"Предупреждение ! В ваших словах обнаружены матерные слова. За использование матерных слов можно заработать БАН !",
		"Материться сейчас не модно :)",
		"Не используй матерные слова пожалуйста !",
		"Не красиво использовать матерные слова.",
		"У тебя тяжелый день ?",
		"Не люблю тех кто материться!",
	],
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
	let lg = await cleanJson(msg.from.language_code) // получения языка на стороне пользователя
	let language = await Language(lg)
	let m = await menu(msg, language, 'start') // Получаем меню
	chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id // отправка тому же пользователю
	botTelegram.sendMessage(chat, m.title, m.options) // обращение к боту
	
}

// функция для отправки ползователем мобильного телефона
async function authPhone(msg) {
	let lg = await cleanJson(msg.from.language_code) // получения языка на стороне пользователя
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

async function compare(msg, language, text, command) {
	let m = await menu(language) // Получаем меню
	resp = {}
	text = await cleanStr(text)
	resp.text = text
	resp.options = {}
	resp.menu = await m
	
	// let word_list_ru = JSON.parse(fs.readFileSync('iiLeng/key.json', 'utf-8'))
	let key_word
	if (word_list_ru[text]) key_word = await word_list_ru[text]
	else {
		let new_text = await AutoText(text)
		if (word_list_ru[new_text]) key_word = await word_list_ru[new_text]
		else {
			let tests = 0
			for (var key in word_list_ru) {
				if (key.indexOf(text) >= 0) {
					console.log('key '+key)
					key_word = await word_list_ru[key]
					console.log('key_word '+key_word)
					break
				}
			}
			
		}
	}
	
	if (key_word) {
		
		let commands = {
			//1: {command: 'menu', type: 'start'},
			//5: {command: 'phone', type: null},
		}
		
		let answer_list_ru
		if (all_answer_list_ru[key_word]) answer_list_ru = await all_answer_list_ru[key_word]
		let length_answer_list_ru
		if (answer_list_ru) length_answer_list_ru = await Object.keys(answer_list_ru).length
		let new_key
		if (length_answer_list_ru) new_key = await rand(length_answer_list_ru)
		
		console.log(answer_list_ru[new_key])
		
		if (answer_list_ru[new_key]) resp.title = await answer_list_ru[new_key]
		if (commands[key_word]) resp.options = await command(msg, language, commands[key_word].command, commands[key_word].type)
		
	}
	
	return resp
}

async function command(msg, language, command, type) {
	let resp
	if (command == 'menu') resp = menu(language, type)
	if (command == 'phone') resp = authPhone(msg)
	return resp
}

// функция обработки любых сообщений
botTelegram.on('message', async function (msg) {
	//console.log(msg)
	if (msg && msg.from && msg.from.id && msg.chat && msg.chat.id) {
		if (msg.from.is_bot == false) { // Закрываем доступ ботам
			let id = await msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id // отправка тому же пользователю
			let command
			//botTelegram.sendMessage(chat, JSON.stringify(msg)) //функция для отладки
			let authTest
			let lg = await cleanJson(msg.from.language_code) // получения языка на стороне пользователя
			let language = await Language(lg) // загрузка языкового пакета в масив
			let file = await userdir + '/' + msg.from.id + '.json'
			authTest = await auth(msg, 'auth') // Проверяем авторизацию
			if (authTest && authTest.state && authTest.state == 1) {
				if (authTest.count && authTest.count <= 1) botTelegram.sendMessage(id, language[262]) // Вы авторизованы
				if (authTest.pllano && authTest.pllano.authorization && authTest.pllano.authorization == 1) {
					if (msg.text && msg.text != '') {
						
						let title = await msg.text
						let options = {}
						
						if (!httpSet.has(title)) { // Исключили роутинг
							let separator = '#' // разделитель
							if (title.match(separator) && adminSet.has(id)) {
								let arr = title.split(separator) // id#command#text (400034907##Текст сообщения)
								//console.log(arr)
								id = arr[0]
								if (arr[1] != '') command = arr[1]
								title = arr[2]
								if (command) {
									options = {}
									title = arr[2]+' command: '+command
								}
							}
							else {
								title = await cleanJson(title)
								// Работаем с вопросами от юзера
								console.log('user: '+title)
								//console.log(tokenizer.tokenize(title))
								// Отправляем вопрос админу
								
								// Наши ответы на вопросы, в ответ можно давать что угодно
								let ix = await compare(msg, language, title, command)
								//console.log(ix)
								if (ix.title) {
									title = ix.title
									if (ix.options) options = ix.options
								}
								else {
									let answer_list_ru = await all_answer_list_ru[0]
									let length_answer_list_ru = await Object.keys(answer_list_ru).length
									let new_key = await rand(length_answer_list_ru)
									title = await answer_list_ru[new_key]
								}
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
						
						//if (!adminSet.has(id)) {
						if (!adminSet.has(id)) {
							for (let key of adminSet) {
								//if (key = 711610523) botTelegram.sendMessage(key, id+'##'+title)
							}
						}
						console.log('bot: '+title)
						botTelegram.sendMessage(id, title, options)
					}
				}
			}
			else {
				if (msg.from.first_name) botTelegram.sendMessage(id, language[170] + ' ' + msg.from.first_name)
				botTelegram.sendMessage(id, language[255]) // Вы не авторизованы
				authPhone(msg) // Просим у пользователя номер телефона и после получения запускаем авторизацию авторизуем
				if (msg.contact && msg.contact.phone_number) authTest = await auth(msg, 'login') // Авторизуемся
				if (authTest && authTest.state && authTest.state == 1) {
					if (authTest.count && authTest.count <= 1) botTelegram.sendMessage(id, language[262]) // Вы авторизованы
					// Продолжаем работу с юзером
				}
			}
			
		}
		else if (msg.from.is_bot == true) {
		    let id = await msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id
			let title = await msg.text
			//if (title != '') botTelegram.sendMessage(id,''+title)
			if (!adminSet.has(id)) {
			    for (let key of adminSet) {
			        if (title != '') botTelegram.sendMessage(key, id+'##Bot: '+title)
				}
			}
		}
	}
})

// функция запуска события по нажатию на кнопку авторизации
botTelegram.on('callback_query', function (msg) {
	authPhone(msg)
})

// функция реакции на команду /start
botTelegram.onText('/start', function (msg, match) {
	botTelegram.sendMessage(msg.chat.id, ' -- start -- ')
	question(msg) //вызов функции question
})

botTelegram.onText('/card', function (msg) {
	let send
	send = 'https://api.qrserver.com/v1/create-qr-code/?size=450x450&data=' + msg.from.id + '_' + msg.from.first_name // http://goqr.me/api/  http://goqr.me/api/doc/
	if (msg.from && msg.from.last_name) send = send + '_' + msg.from.last_name
	//console.log(msg)
	botTelegram.sendMessage(msg.chat.id, send) //вызов функции question
})
 
// function Сard(msg){
// 	let send
// 	send = 'https://api.qrserver.com/v1/create-qr-code/?size=450x450&data=' + msg.from.id + '_' + msg.from.first_name // http://goqr.me/api/  http://goqr.me/api/doc/
// 	if (msg.from && msg.from.last_name) send = send + '_' + msg.from.last_name
// 	//console.log(msg)
// 	botTelegram.sendMessage(msg.chat.id, send) //вызов функции question
// }
