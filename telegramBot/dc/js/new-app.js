var word_expression = new RegExp(/^[а-яА-Яa-zA-ZÀ-ÿ0-9а-щА-ЩЬьЮюЯяЇїІіЄєҐґ\/\n/:;.!'"?%&*-+=_,№#$€@\ \-]{1,500}$/)
var check_expression_new = new RegExp(/^[а-яА-Яa-zA-ZÀ-ÿ0-9а-щА-ЩЬьЮюЯяЇїІіЄєҐґ\/\n/:;.!'"?%&*-+=_,№#$€@\ \-]{1,500}$/)
var check_expression = new RegExp(/^[а-яА-Яa-zA-ZÀ-ÿ0-9а-щА-ЩЬьЮюЯяЇїІіЄєҐґ\/\n/:;.!'"?%&*-+=_,№#$€@\ \-]{1,500}$/)
var email_expression = new RegExp(/^[-0-9a-z_\.]+@[-0-9a-z_\.]+\.[a-z]{2,6}$/i)
var phone_expression = new RegExp(/^[\(\)\[\]\s\\\/\-0-9\+]{5,50}/i)
var phone_pattern = new RegExp(/^((8|0|\+\d{1,2})[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/i)
var password_expression = new RegExp(/^[^\s]{8,25}$/)
var code_expression = new RegExp(/[0-9]{2}-[0-9]{2}-[0-9]{2}$/)
var url_expression = new RegExp(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi)
let router_post = '/'
let router_get = '/'
let router_language = 'language'
let router_order_card = '/order-card'
let router_card_activation = '/card-activation'
let router_check_card = '/check-card'
let router_logout = 'logout'
let router_login = 'login'
let router_check_in = 'login'
let languages = {}, language = {}

let localDb = window.localStorage // localStorage
// localDb.setItem('key', 'value')
// var data = localDb.getItem('key')
// localDb.removeItem('key')
// localDb.clear()

var sessionDb = window.sessionStorage // sessionStorage
// sessionDb.setItem('key', 'value')
// var data = sessionDb.getItem('key')
// sessionDb.removeItem('key')
// sessionDb.clear()

// Функция проверки доступности localStorage и sessionStorage
function storageAvailable(type) {
	try {
		var storage = window[type],
		x = '__storage_test__'
		storage.setItem(x, x)
		storage.removeItem(x)
		return true
	}
	catch (e) {
		return e instanceof DOMException && (
		// everything except Firefox
		e.code === 22 ||
		// Firefox
		e.code === 1014 ||
		// test name field too, because code might not be present
		// everything except Firefox
		e.name === 'QuotaExceededError' ||
		// Firefox
		e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
		// acknowledge QuotaExceededError only if there's something already stored
		storage.length !== 0
	}
}

// Пишем данные в localStorage, sessionStorage, indexedDB
function setDb(key, data) {
	if (storageAvailable('localStorage')) localDb.setItem(key, data)
	if (storageAvailable('sessionStorage')) sessionDb.setItem(key, data)
}

function getDb(key) {
	if (storageAvailable('localStorage')) return localDb.getItem(key)
	else if (storageAvailable('sessionStorage')) return sessionDb.getItem(key)
	else return null
}

function removeDb(key) {
	let ret = true
	if (storageAvailable('localStorage')) localDb.removeItem(key)
	if (storageAvailable('sessionStorage')) sessionDb.removeItem(key)
	return ret
}

function clearDb() {
	try {
		localDb.clear()
		sessionDb.clear()
		return true
	}
	catch (e) {
		// alert(e.name)
		return null
	}
}

function createCookie(name, value, days) {
	if (days) {
		var date = new Date()
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 365))
		var expires = "; expires=" + date.toGMTString()
	}
	else
	var expires = ""
	document.cookie = name + "=" + value + expires + "; path=/; secure"
}

function readCookie(name) {
	var nameEQ = name + "="
	var ca = document.cookie.split(';')
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i]
		while (c.charAt(0) == ' ')
		c = c.substring(1, c.length)
		if (c.indexOf(nameEQ) == 0)
		return c.substring(nameEQ.length, c.length)
	}
	return null
}

function eraseCookie(name) {
	createCookie(name, "", -1)
}

async function getLanguages(lg) {
	var getLang = 1
	var json = {}
	if (getDb('languages')) {
		json = await JSON.parse(getDb('languages'))
		if (json.lang == getDb('lang') && lg == getDb('lang')) getLang = 0
	}
	if (getLang == 1) {
		var param = ''
		if (lg) {
			setDb('lang',lg)
			param = '?lang='+lg
		}
		$.get(router_get+router_language+param, {}, async function (data){
			if (data) {
				json = await JSON.stringify(data)
				setDb('languages',json)
			}
		}),
		json
	}
	return await json
}

function setLanguage(id) {
	var lang = 'en'
	$.post(router_post+router_language, {id: id}, function (data) {
		if (data.status == 200) {
			if (id == 1) lang = 'ru'
			else if (id == 2) lang = 'ua'
			else if (id == 3) lang = 'en'
			else if (id == 4) lang = 'de'
			else if (id == 5) lang = 'pl'
			setDb('lang', lang)
			getLanguages(lang)
			window.location.reload()
		}
	})
}

function lang(id) {
	var getLang = JSON.parse(getDb('languages'))
	return getLang.language[id]
}

function r_tel() {
	var tel = document.getElementById('tel')
	//tel.value = tel.value.replace(/\s/g, '')
	tel.value = tel.value.replace(/\D+/g, '')
}

function isValidJSON(src) {
	var filtered = src
	filtered = filtered.replace(/\\["\\\/bfnrtu]/g, '@')
	filtered = filtered.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
	filtered = filtered.replace(/(?:^|:|,)(?:\s*\[)+/g, '')
	return (/^[\],:{}\s]*$/.test(filtered))
}

function checkData(fieldname, message_item, expression) {
	var errorStatus = true
    var data_string = $("#"+fieldname).val()
    if (data_string.length == 0) {
        $("#" + fieldname + "-status").after("<small class='error_message' id=" + fieldname + "_di ><i class='fa fa-info-circle text-danger' aria-hidden='true'></i> "+message_item+"</small>")
        errorStatus = false
        $('#' + fieldname).addClass('is-invalid')
	}
	else if (expression != false) {
        var result = expression.test(data_string)
        if(result == false) {
            $("#" + fieldname).after("<small class='error_message' id="+fieldname+"_di ><i class='fa fa-info-circle text-danger' aria-hidden='true'></i> "+message_item+"</small>")
            errorStatus = false
            $('#' + fieldname).addClass('is-invalid')
		}
		else $('#' + fieldname).removeClass('is-invalid').addClass('is-valid')
	}
	else $('#' + fieldname).removeClass('is-invalid').addClass('is-valid')
	return errorStatus
}

$(document).ready(async function() {
	
	let fn = await $.fn
	let intlTelInput = await fn.intlTelInput
	let countryData = await intlTelInput.getCountryData()
	
	await $.each(countryData, async function(i, country) {
		country.name = await country.name.replace(/.+\((.+)\)/,"$1")
	})
	
	let telInput = await $("#phone"), errorMsg = $("#error-msg"), validMsg = $("#valid-msg")
	
	$("#phone").intlTelInput({
		initialCountry: "auto",
		geoIpLookup: function(callback) {
			$.get('https://ipinfo.io', function() {}, "jsonp").always(function(resp) {
				let countryCode = (resp && resp.country) ? resp.country : ""
				callback(countryCode)
			})
		},
		autoFormat: true,
		autoPlaceholder: true,
		preferredCountries: ["ua", "pl", "de", "fr", "it", "us", "by", "kz", "ge", "uz"],
		separateDialCode: true,
		utilsScript: "/lib/phone/1.0.1/js/phone.js"
	})
	
	let reset = function() {
		telInput.removeClass("error")
		errorMsg.addClass("hide")
		validMsg.addClass("hide")
	}
	
	// on blur: validate
	telInput.blur(function() {
		reset()
		if ($.trim(telInput.val())) {
			if (telInput.intlTelInput("isValidNumber")) validMsg.removeClass("hide")
			else {
				telInput.addClass("error")
				errorMsg.removeClass("hide")
			}
		}
	})
	
	telInput.on("keyup change", reset)
	
})



function appCopyToClipBoard(idText, sText, responseText)
{
	let oText = false, bResult = false
	try {
		oText = document.createElement("textarea")
		$(oText).addClass('clipboardCopier').val(sText).insertAfter('body')
		oText.select()
		document.execCommand("Copy")
		bResult = true
	}
	catch(e) {}
	$(oText).remove()
	if (bResult) {
		text = responseText
		classText = 'success'
	}
	else {
		text = '{{ language.836 }}'
		classText = 'warn'
	}
	$('.'+idText).notify(text, {className: classText, position: 'bottom center', style: 'bootstrap', autoHide: true})
}

function OneNotify(title, text, type, icon, addclass) {
	new PNotify({
		title: title,
		text: text,
		type: type,
		icon: icon,
		addclass: addclass
	})
}

function jsonNotify(json) {
	new PNotify(json)
}

function checkIn() {
$('.error_message').remove()

checkData('phone', lang(107)+': '+lang(200), false)
checkData('password', lang(107)+': '+lang(201), password_expression)
checkData('email', lang(107)+': '+lang(161), email_expression)
checkData('fname', lang(107)+': '+lang(57), word_expression)
checkData('iname', lang(107)+': '+lang(58), word_expression)

var phone = $("#phone").intlTelInput("getNumber")
var email = $("#email").val()
var password = $("#password").val()
var iname = $("#iname").val()
var fname = $("#fname").val()
var csrf = $("#csrf").val()
var oauth = 'sign-in'

if (csrf && oauth && email && phone && password && iname && fname) {
setDb('phone', phone)
setDb('email', email)
setDb('iname', iname)
setDb('fname', fname)
$.post(router_post+router_check_in, {csrf: csrf, oauth: oauth, email: email, phone: phone, password: password, iname: iname, fname: fname}, function (response) {
var data = $.parseJSON(response)
if (data && data.status == 200) window.location = '/'
else if (data.status == 400) OneNotify(data.title, data.text, data.color)
}),
"json"
}
else OneNotify(lang(836), lang(845), 'red')
}

function login() {
$('.error_message').remove()

let req = {}
req.csrf = $("#csrf").val()
req.oauth = 'sign-up'
req.phone = $("#phone").intlTelInput("getNumber")
req.email = $("#email").val()
req.password = $("#password").val()

let phone = checkData('phone', lang(107)+': '+lang(200), phone_expression)
let email = checkData('email', lang(107)+': '+lang(161), email_expression)
let name = checkData('name', lang(107)+': '+lang(58)+' '+lang(57), word_expression)
let code = checkData('code', lang(107)+': '+lang(1007), word_expression)
let passport = checkData('passport', lang(107)+': '+lang(71), word_expression)

if (req && req.csrf && oauth == true && email == true && phone == true && password == true) {
setDb('phone', phone)
setDb('email', email)
$.post(router_post+router_login, {req}, function (res) {
if (res.status == 200) {
if (res.location) window.location.href = res.location
else window.location.reload()
}
else if (res.status == 400) OneNotify(res.title, res.text, res.color)
}),
"json"
}
else OneNotify(lang(836), lang(845), 'red')
}

function logout() {
var csrf = $("#csrf").val()
$.post(router_post+router_logout, {csrf: csrf}, function (data) {
if (data && data.status == 200) {
if (data.location) window.location.href = data.location
else window.location.reload()
}
})
}

function orderCard() {
$('.error_message').remove()
let phone = checkData('phone', lang(107)+': '+lang(200), phone_expression)
let email = checkData('email', lang(107)+': '+lang(161), email_expression)
let name = checkData('name', lang(107)+': '+lang(58)+' '+lang(57), word_expression)

let req = {}
req.csrf = $("#csrf").val()
req.phone = $("#phone").intlTelInput("getNumber")
req.email = $("#email").val()
req.name = $("#name").val()

console.log('phone '+ phone)
console.log('email '+ email)
console.log('name '+ name)

if (req.csrf && phone == true && email == true && name == true) {
    $.post(router_order_card, req, function (res) {
        if (res && res.html) $("#order_card").html(res.html)
		else window.location.reload()
    })
}
}

function cardActivation() {
$('.error_message').remove()
let card = checkData('card', lang(107)+': '+lang(89), word_expression)
let iname = checkData('iname', lang(107)+': '+lang(58), word_expression)
let fname = checkData('fname', lang(107)+': '+lang(57), word_expression)
let phone = checkData('phone', lang(107)+': '+lang(200), phone_expression)
let email = checkData('email', lang(107)+': '+lang(161), email_expression)

let req = {}
req.csrf = $("#csrf").val()
req.card = $("#card").val()
req.iname = $("#iname").val()
req.fname = $("#fname").val()
req.phone = $("#phone").intlTelInput("getNumber")
req.email = $("#email").val()

console.log('phone '+ phone)
console.log('email '+ email)
console.log('iname '+ iname)
console.log('fname '+ fname)
console.log('card '+ card)

if (req.csrf && phone == true && email == true && iname == true && fname == true && card == true) {
	console.log('post '+ router_card_activation)
    $.post(router_card_activation, req, function (res) {
        if (res && res.html) $("#card_activation").html(res.html)
		else window.location.reload()
    })
}
}


function checkCard() {
let card = checkData('card', lang(107)+': '+lang(89), word_expression)
let req = {}
req.csrf = $("#csrf").val()
req.card = $("#card").val()
console.log('card '+ card)
if (req.csrf && card == true) {
	console.log('post '+ router_check_card)
    $.post(router_check_card, req, function (res) {
        if (res && res.html) $("#check_card").html(res.html)
		else window.location.reload()
    })
}
}