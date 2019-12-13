const token = process.env.TOKEN;
const Bot = require('node-telegram-bot-api');
let bot;

if (process.env.NODE_ENV === 'production') {
  bot = new Bot(token);
  bot.setWebHook(process.env.HEROKU_URL + bot.token);
}
else {
  bot = new Bot(token, { polling: true });
}

console.log('Bot server started in the ' + process.env.NODE_ENV + ' mode');

var customer = {

}
const admin_id = process.env.ADMIN_ID

const countries = {
  en: [['Austria', 'Germany', 'Greece'], ['Israel', 'Island', 'Spain'], ['Italy', 'Canada', 'Cyprus'], ['Poland', 'Portugal', 'USA'], ['Turkey', 'France', 'Finland'], ['Montenegro', 'Czech Rep', 'Switzerland']],
  ru: [['Австрия', 'Германия', 'Греция'], ['Израиль', 'Исландия', 'Испания'], ['Италия', 'Канада', 'Кипр'], ['Польша', 'Португалия', 'США'], ['Турция', 'Франция', 'Финляндия'], ['Черногория', 'Чехия', 'Швейцария']]
}

const car_classes = {
  en: [['A - mini cars', 'B - small cars'], ['C - medium cars', 'D - large cars'], ['E - exclusive cars'], ['F - luxury cars'], ['J - sport utility cars'], ['M - multi purpose'], ['S - sport cars']],
  ru: [['A - Микроавтомобили'], ['B - малые автомобили', 'C - средний класс'], ['D - большие автомобили'], ['E - бизнес класс'], ['F - представительские'], ['J - внедорожники'], ['M - минивены и УВП'], ['S - спорткупе']]
}

const createOrder = () => {
  return `Получен новый заказ: \n
 Страна: ${customer.requested_country}
 Дата получение автомобиля: ${customer.pickup_date}
 Дата возврата автомобиля: ${customer.drop_off_date}
 Класс автомобиля: ${customer.requested_car_class}
 [Заказчик](tg://user?id=${customer.id})
 `
}
const customerOrder = () => {
  return customer.language_code === 'ru' ? `
  Ваш заказ принят и будет рассмотрен в ближайшее время. 
  Заказ:
  Страна: ${customer.requested_country}
  Дата получение автомобиля: ${customer.pickup_date}
  Дата возврата автомобиля: ${customer.drop_off_date}
  Класс автомобиля: ${customer.requested_car_class}
  [Для Связи](tg://user?id=${admin_id})
  `: `
  Your order has been received and will be processed as soon as possible.
  Order: 
  Country: ${customer.requested_country}
  Pick up date: ${customer.pickup_date}
  Return date: ${customer.drop_off_date}
  Car class: ${customer.requested_car_class}
  [For more details](tg://user?id=${admin_id})
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

const reply = (user) => {
  const messages = {
    en: [
      `Hello ${user.first_name}. \nPlease choose a country you want to rent a car`,
      `Please insert a pick-up date`,
      `Please insert a drop-off date`,
      `What class car do you prefer?` // Inline classes
    ],

    ru: [
      `Доброго времени суток ${user.first_name}.\nВыберете страну, в которой Вы бы хотели снять машину `,
      `Введите, пожалуйста, дату получения автомобиля`,
      `Введите, пожалуйста, дату возврата автомобиля`,
      `Выберете желаемый класс автомобиля`
    ]
  }
  return messages[user.language_code][user.step]
}



bot.onText(/\/start/, msg => {
  customer = msg.from;
  //customer.language_code='ru'
  customer.step = 0;
  bot.sendMessage(msg.chat.id, reply(customer), {
    reply_markup: {
      inline_keyboard:
        replyContries(customer)
    }
  }).catch(err => console.log(err))
})

bot.on('callback_query', query => {
  switch (customer.step) {
    case 0: customer.requested_country = query.data;
      customer.step++;
      bot.sendMessage(customer.id, reply(customer))
        .catch(err => console.log(err.response.body))
      break;

    case 3: customer.requested_car_class = query.data;
      bot.sendMessage(admin_id, createOrder(), { parse_mode: 'Markdown' }).catch(err => console.log(err));
      bot.sendMessage(admin_id, customerOrder(), { parse_mode: 'Markdown' }).catch(err => console.log(err));

      break;
  }
})

bot.on('message', msg => {
  if (customer.id) {
    switch (customer.step) {
      case 1: customer.pickup_date = msg.text;
        customer.step++;
        bot.sendMessage(customer.id, reply(customer)).catch(err => console.log(err));
        break;
      case 2: customer.drop_off_date = msg.text;
        customer.step++;

        bot.sendMessage(msg.chat.id, reply(customer), {
          reply_markup: {
            inline_keyboard:
              classChoice(customer)
          }
        }).catch(err => console.log(err))
        break;
    }
  }
})

module.exports = bot;
