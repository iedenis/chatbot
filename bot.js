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

const months = {
  en: [['January', 'February', 'March'], ['April', 'May', 'June'], ['July', 'August', 'September'], ['October', 'November', 'December']],
  ru: [['Январь', 'Февраль', 'Март'], ['Апрель', 'Май', 'Июнь'], ['Июль', 'Август', 'Сентябрь'], ['Октябрь', 'Ноябрь', 'Декабрь']]
}

// const numberOfMonth = (month) => {
//   let monthNumber = 1;
//   for (let i = 0; i < 4; i++) {
//     for (let j = 0; j < 3; monthNumber++ , j++) {
//       if (month === months.en[i][j]) return monthNumber;
//     }
//   }
// }
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
 Дата получение автомобиля: ${customer.pick_up_day} ${customer.pick_up_month} 2020
 Дата возврата автомобиля: ${customer.return_day} ${customer.return_month} 2020
 Класс автомобиля: ${customer.requested_car_class}
 [Заказчик](tg://user?id=${customer.id})
 `
}
const customerOrder = () => {
  return customer.language_code === 'ru' ? `
  Ваш заказ принят и будет рассмотрен в ближайшее время. 
  |*Заказ:*
  | Страна: ${customer.requested_country}
  | Дата получение автомобиля: ${customer.pick_up_day} ${customer.pick_up_month} 2020
  | Дата возврата автомобиля: ${customer.return_day} ${customer.return_month} 2020
  | Класс автомобиля: ${customer.requested_car_class}
  | [Для Связи](tg://user?id=${admin_id})
  `: `
  Your order has been received and will be processed as soon as possible.
  
  |*Order:* 
  |Country: ${customer.requested_country}
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
      `Hello ${user.first_name}. \nPlease choose a country you want to rent a car ⬇️`,
      `Please choose a pick-up month ⬇️`,
      `Please choose a pick-up day ⬇️`,
      `Please choose a return month ⬇️`,
      `Please choose a return day ⬇️`,
      `What car class do you prefer? ⬇️`
    ],

    ru: [
      `Доброго времени суток ${user.first_name}.\nВыберете страну, в которой Вы бы хотели снять машину ⬇️`,
      `Выберете месяц получения автомобиля ⬇️`,
      `Выберете число месяца получения автомобиля ⬇️`,
      `Выберете месяц возврата автомобиля ⬇️`,
      `Выберете число месяца возврата автомобиля ⬇️`,
      `Выберете желаемый класс автомобиля ⬇️`
    ]
  }
  return messages[user.language_code][user.step]
}



bot.onText(/\/start/, msg => {
  customer = msg.from;
  customer.language_code = 'ru'
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

const responseDay = (user, pickup) => {
  bot.sendMessage(user.id, reply(user), {
    reply_markup: {
      inline_keyboard:
        daysButtons(pickup ? user.pick_up_month : user.return_month, user)
    }
  }).catch(err => console.log(err))
}

bot.on('callback_query', query => {
  customer.step++;
  switch (customer.step) {
    case 1: customer.requested_country = query.data;
      responseMonth(customer, true)
      break;
    case 2: customer.pick_up_month = query.data;
      responseDay(customer, true);
      break;
    case 3:
      customer.pick_up_day = query.data;
      responseMonth(customer, false);
      break;
    case 4: customer.return_month = query.data;
      responseDay(customer, false)
      break;
    case 5: customer.return_day = query.data;
      bot.sendMessage(customer.id, reply(customer), {
        reply_markup: {
          inline_keyboard:
            classChoice(customer)
        }
      }).catch(err => console.log(err))
      break;

    case 6: customer.requested_car_class = query.data;
      bot.sendMessage(admin_id, createOrder(), { parse_mode: 'Markdown' }).catch(err => console.log(err));
      bot.sendMessage(customer.id, customerOrder(), { parse_mode: 'Markdown' }).catch(err => console.log(err));

      break;
  }
})

// bot.on('message', msg => {
//   if (customer.id) {
//     switch (customer.step) {
//       case 9: customer.pickup_date = msg.text;
//         customer.step++;
//         bot.sendMessage(customer.id, reply(customer)).catch(err => console.log(err));
//         break;
//       case 8: customer.return_date = msg.text;
//         customer.step++;

//         bot.sendMessage(msg.chat.id, reply(customer), {
//           reply_markup: {
//             inline_keyboard:
//               classChoice(customer)
//           }
//         }).catch(err => console.log(err))
//         break;
//     }
//   }
// })

module.exports = bot;
