let TelegramBot = require('node-telegram-bot-api')
let TelegramToken = '611632695:AAHTnhdDQGDWPfcqxppxmZEtp0_za4pFU1o' // Устанавливаем токен TelegramBot
let bot = new TelegramBot(TelegramToken, { polling: true })
let fs = require('fs')
let mkdirp = require('mkdirp')
let dateFormat = require('dateformat')
let i = -1
let y =0

bot.sendMessage(400034907, "Я ожил, Хозяин")
bot.sendMessage(711610523, "Я ожил, Хозяин")
bot.on('message', function (msg) {
    if(msg.text=="молоца"){
        setTimeout(5222,Question(msg))
    }
    console.log(msg)
    //bot.sendMessage(msg.chat.id,"привет")
    Question(msg)
})


function Question(msg) {
    let buttons = [
            [{ text: "+1", callback_data: '1' }], 
            [{  text: "-1 ",callback_data: '2'}] 
    ]
    let options = {
        reply_markup: JSON.stringify({
            inline_keyboard: buttons,
            parse_mode: 'Markdown'
        })
    }
    chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id
    bot.sendMessage(chat, "старый текст", options)
}


bot.on('callback_query', msg => {
    console.log(msg)
    if(msg.data == 1){
        i++//нужни для того что б меняллись даные, если даные одинаковые прегружать сообщение не будет 
    }
    else if(msg.data == 2){
        i--//нужни для того что б меняллись даные, если даные одинаковые прегружать сообщение не будет 
    }
    chate = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id
    bot.editMessageText('новый текст '+i,{
        chat_id:chate,//отдает только from.id но для подстраховки
        message_id:msg.message.message_id,//что б обратиться к нужному сообщению
        reply_markup:{
            inline_keyboard:[//можно и переменую
                [{ text: "+1 ", callback_data: '1' }], 
                [{  text: "-1 ",callback_data: '2' }] 
              ],
              parse_mode: 'Markdown'//кодировка можно поставить и HTML тогда будет понимать и теги
        }
    })
})
//editMessageText
//https://tlgrm.ru/docs/bots/api#updating-messages


