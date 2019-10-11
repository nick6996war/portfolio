let TelegramBot = require('node-telegram-bot-api')
let TelegramToken = '611632695:AAHTnhdDQGDWPfcqxppxmZEtp0_za4pFU1o' // Устанавливаем токен TelegramBot
let bot = new TelegramBot(TelegramToken, { polling: true })
 let vhud = "ldjbvlsb"
bot.sendMessage(400034907, "Я ожил, Хозяин")

bot.on('message', function (msg) {
bot.sendMessage(msg.from.id, 'kfjbvd', { // Для продолжения нужен ваш номер телефона
		// создание клавиатуры на стороне пользователя
		reply_markup: {
			resize_keyboard: true, //one_time_keyboard: true,
			keyboard: [[{text: vhud}],[{text: vhud}],[{text: vhud}],[{text: vhud}],[{text: vhud}],[{text: vhud}],[{text: vhud}]]
			
		}
	})
})