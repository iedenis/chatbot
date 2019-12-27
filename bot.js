const token = process.env.TOKEN;
const API_KEY = process.env.API_KEY;

const Bot = require('node-telegram-bot-api');
const fetch = require('node-fetch')
let bot;

if (process.env.NODE_ENV === 'production') {
  bot = new Bot(token);
  bot.setWebHook(process.env.HEROKU_URL + bot.token);
}
else {
  bot = new Bot(token, { polling: true });
}

console.log('Bot server started in the ' + process.env.NODE_ENV + ' mode');

var customer = {}
var airports = [];

const admin_id = process.env.ADMIN_ID
const url = 'https://raw.githubusercontent.com/algolia/datasets/master/airports/airports.json'

const getAirportByCityName = async city => {

  return airports.filter(airport => airport.city === city);
}



//getCitiesByCountryName("Israel")
const countries = {
  en: [['Austria', 'Germany', 'Greece'], ['Israel', 'Island', 'Spain'], ['Italy', 'Canada', 'Cyprus'], ['Poland', 'Portugal', 'USA'], ['Turkey', 'France', 'Finland'], ['Montenegro', 'Czech Rep', 'Switzerland'], ['Another country']],
  ru: [['Австрия', 'Германия', 'Греция'], ['Израиль', 'Исландия', 'Испания'], ['Италия', 'Канада', 'Кипр'], ['Польша', 'Португалия', 'США'], ['Турция', 'Франция', 'Финляндия'], ['Черногория', 'Чехия', 'Швейцария'], ['Другая страна']]
}

const car_classes = {
  en: [['Mini', 'Small', 'Medium '], ['Large', 'Exclusive', 'Luxury '], ['Sport ', 'Multi purpose', 'SUV']],
  ru: [['Мини', 'Эконом', 'Компакт'], ['Универсал', 'Паркетник', 'Стандарт'], ['Люкс', 'Минивены', "Спорткар"]]
}

const months = {
  en: [['January', 'February', 'March'], ['April', 'May', 'June'], ['July', 'August', 'September'], ['October', 'November', 'December']],
  ru: [['Январь', 'Февраль', 'Март'], ['Апрель', 'Май', 'Июнь'], ['Июль', 'Август', 'Сентябрь'], ['Октябрь', 'Ноябрь', 'Декабрь']]
}

const errorMessage = (err) => {
  console.log(err)
  bot.sendMessage(customer.id, customer.language_code === 'ru' ?
    'Что-то пошло не так. Начните заказ сначала набрав /start' :
    'Something went wrong. Please restart the order by typing /start',
    {
      reply_markup: {
        keyboard: [['/start']]
      }
    }
  ).catch(err => console.log(err))
}

const daysInMonth = (month, year) => {
  let monthNumber = 1;
  let counter = 1;
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 3; counter++ , j++) {
      if (month === months[customer.language_code][i][j]) monthNumber = counter;
    }
  } return new Date(year, monthNumber, 0).getDate();
}



//date regexp ^(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d$
const createOrder = () => {
  return `*Получен новый заказ:* \n
 Страна: ${customer.requested_country}
 Город: ${customer.requested_city}
 Дата получение автомобиля: ${customer.pick_up_day} ${customer.pick_up_month} 2020
 Дата возврата автомобиля: ${customer.return_day} ${customer.return_month} 2020
 Класс автомобиля: ${customer.requested_car_class}
 [Заказчик](tg://user?id=${customer.id})
 `
}
const customerOrder = () => {
  customer.isFinished = true;
  return customer.language_code === 'ru' ? `
  Ваш заказ принят и будет рассмотрен в ближайшее время. 
  |*Заказ:*
  | Страна: ${customer.requested_country}
  | Город: ${customer.requested_city}
  | Дата получение автомобиля: ${customer.pick_up_day} ${customer.pick_up_month} 2020
  | Дата возврата автомобиля: ${customer.return_day} ${customer.return_month} 2020
  | Класс автомобиля: ${customer.requested_car_class}
  | [Для Связи](tg://user?id=${admin_id})
  `: `
  Your order has been received and will be processed as soon as possible.
  
  |*Order:* 
  |Country: ${customer.requested_country}
  |City: ${customer.requested_city}
  |Pick up date: ${customer.pick_up_day} ${customer.pick_up_month} 2020
  |Return date: ${customer.return_day} ${customer.return_month} 2020
  |Car class: ${customer.requested_car_class}
  |[For more details](tg://user?id=${admin_id})
  `
}


const classChoice = (user) => {
  return car_classes[user.language_code].map(sub_car_class => {
    return sub_car_class.map(car_class => {
      return {
        text: car_class,
        callback_data: car_class
      }
    })
  })
}
const replyContriesKeyboard = (user) => {
  return countries[user.language_code].map(subcountries => {
    return subcountries.map(country => { return country })
  })
}

const replyContries = (user) => {
  return countries[user.language_code].map(subcountries => {
    return subcountries.map(country => {
      return {
        text: country,
        callback_data: country
      }
    })
  })
  return buttons
}

const responseWithCitities = async (user, country) => {
  if (country !== undefined) {
    const cities = await getCitiesByCountryName(country);
    let displayCities = [];
    let temp = []
    while (cities.length > 0) {
      displayCities.push(cities.splice(0, 3))
    }

    bot.sendMessage(user.id, reply(user), {
      reply_markup: {
        inline_keyboard:
          displayCities.map(city => {
            return city.map(subCity => {
              return {
                text: subCity,
                callback_data: subCity
              }
            })
          })
      }
    })
  }
  else {
    errorMessage('country is undefined')
  }

}

const daysButtons = (month, user) => {
  const numberOfDays = daysInMonth(month, 2020);
  const arrayOfbuttons = []
  let tempArray = [];
  for (let i = 1; i <= numberOfDays; i++) {
    const day = { text: i, callback_data: i }
    if (i % 8 !== 0) {
      tempArray.push(day);
    }
    else {
      arrayOfbuttons.push(tempArray);
      tempArray = []
      tempArray.push(day)
    }
  }
  arrayOfbuttons.push(tempArray)
  return arrayOfbuttons;
}
const reply = (user) => {
  const messages = {
    en: [
      `Hello ${user.first_name}. \n⬇️Please choose a country you want to rent a car ⬇️`,
      `🏢 Please choose a city ⬇️`,
      `📅 Please choose a pick-up month ⬇️`,
      `📅 Please choose a pick-up day ⬇️`,
      `📅 Please choose a return month ⬇️`,
      `📅 Please choose a return day ⬇️`,
      `🚗 What car class do you prefer? ⬇️`
    ],

    ru: [
      `⬇️ Доброго времени суток ${user.first_name}.\nВыберете страну, в которой Вы бы хотели снять машину ⬇️`,
      `🏢 Выберете город`,
      `📅 Выберете месяц получения автомобиля ⬇️`,
      `📅 Выберете число месяца получения автомобиля ⬇️`,
      `📅 Выберете месяц возврата автомобиля ⬇️`,
      `📅 Выберете число месяца возврата автомобиля ⬇️`,
      `🚗 Выберете желаемый класс автомобиля ⬇️`
    ]
  }
  return messages[user.language_code][user.step]
}

const partialOrder = (user) => {
  return ` 
  Частичный заказ:
    \n ${user.requested_country !== undefined ? `Страна ${user.requested_country}` : ``}
      ${user.requested_city !== undefined ? `Город: ${user.requested_city}` : ``}
     ${(user.pick_up_day !== undefined) && (user.pick_up_month != undefined) ? (`Дата получение автомобиля: ${user.pick_up_day} ${user.pick_up_month}`) : ``} 2020
 ${ (user.return_day !== undefined) && (user.return_month !== undefined) ? (`Дата возврата автомобиля: ${user.return_day}  ${user.return_month}`) : ``} 2020
 [Для Связи](tg://user?id=${user.id}`

}


bot.onText(/\/start/, msg => {
  customer = msg.from;
  customer.isFinished = false;

  setTimeout(() => {
    if (!customer.isFinished) {
      bot.sendMessage(admin_id,
        partialOrder(customer),
        { parse_mode: 'Markdown' })
    }
  }, 600000);
  //customer.language_code = 'ru'
  customer.language_code = customer.language_code === 'ru' ? 'ru' : 'en'
  customer.step = 0;
  bot.sendMessage(msg.chat.id, reply(customer), {
    reply_markup: {
      inline_keyboard:
        replyContries(customer)
      //'keyboard': replyContries(customer)
    }
  }).catch(err => console.log(err))
})

const replyMonth = (user) => {
  return months[user.language_code].map(submonth => {
    return submonth.map(month => {
      return {
        text: month,
        callback_data: month
      }
    })
  })
}
const responseMonth = (user) => {
  bot.sendMessage(user.id, reply(user), {
    reply_markup: {
      inline_keyboard:
        replyMonth(user)
    }
  }).catch(err => console.log(err));
}

const translate = async (word) => {
  const translateUrl = `https://translate.yandex.net/api/v1.5/tr.json/translate?key=${API_KEY}&text=${word}&lang=en`
  const encodeUrl = encodeURI(translateUrl);
  let response, data;
  try {
    response = await fetch(encodeUrl)
    data = await response.json();
  }
  catch (err) {
    errorMessage(err)
    return undefined;
  }
  return data.text[0];
}

const getCitiesByCountryName = async country => {
  //console.log(country)
  const response = await fetch(url);
  const data = await response.json();
  airports = data.filter(airport => airport.country === country)
  const cities = [...new Set(airports.map((airport => airport.city)))]
  return cities.slice(0, 9);
}


const responseDay = (user, pickup) => {
  bot.sendMessage(user.id, reply(user), {
    reply_markup: {
      inline_keyboard:
        daysButtons(pickup ? user.pick_up_month : user.return_month, user)
    }
  }).catch(err => console.log(err))
}

bot.on('callback_query', async query => {
  customer.step++;
  const lang = customer.language_code;
  switch (customer.step) {
    case 1:
      if (query.data === countries[lang][countries[lang].length - 1][0]) {
        //customer.step--;
        bot.sendMessage(customer.id, lang === 'en' ?
          'Please write the country where you want to rent a car' :
          'Пожалуйста напишите страну, в которой вы хотите снять машину')
      } else {
        customer.requested_country = query.data;
        translate(query.data)
          .then(country => responseWithCitities(customer, country))
          .catch(err => console.log(err));
      }
      break;
    case 2: customer.requested_city = await query.data
      // consoleconsole.log(customer.requested_city)
      responseMonth(customer, true)
      break;
    case 3: customer.pick_up_month = query.data;
      responseDay(customer, true);
      break;
    case 4:
      customer.pick_up_day = query.data;
      responseMonth(customer, false);
      break;
    case 5: customer.return_month = query.data;
      responseDay(customer, false)
      break;
    case 6: customer.return_day = query.data;
      bot.sendMessage(customer.id, reply(customer), {
        reply_markup: {
          inline_keyboard:
            classChoice(customer)
        }
      }).catch(err => console.log(err))
      break;

    case 7: customer.requested_car_class = query.data;
      bot.sendMessage(admin_id, createOrder(), { parse_mode: 'Markdown' }).catch(err => console.log(err));
      bot.sendMessage(customer.id, customerOrder(), { parse_mode: 'Markdown' }).catch(err => console.log(err));
      break;
  }
})

bot.on('message', async msg => {
  if (customer.step !== undefined) {

    if (customer.step === 1) {
      customer.requested_country = msg.text;
      //responseMonth(customer, true)
      const translatedCountry = await translate(msg.text)
      responseWithCitities(customer, translatedCountry)
    }
    else {
      bot.sendMessage(msg.chat.id, customer.language_code === 'en' ? 'Something went wrong. Please restart the process' : 'Что-то пошло не так. Начните сначала', {
        reply_markup: {

          keyboard: [['/start']]
        }
      }).catch(err => console.log(err))
    }
  }
})

module.exports = bot;
