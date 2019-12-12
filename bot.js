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

const countries = {
  en: [['Austria', 'Germany', 'Greece'], ['Israel', 'Island', 'Spain'], ['Italy', 'Canada', 'Cyprus'], ['Poland', 'Portugal', 'USA'], ['Turkey', 'France', 'Finland'], ['Montenegro', 'Czech Rep', 'Switzerland']],
  ru: [['Австрия', 'Германия', 'Греция'], ['Израиль', 'Исландия', 'Испания'], ['Италия', 'Канада', 'Кипр'], ['Польша', 'Португалия', 'США'], ['Турция', 'Франция', 'Финляндия'], ['Черногория', 'Чехия', 'Швейцария']]
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
      `Hello ${user.first_name}. \nPlease choose a country you want to rent a car`
    ],

    ru: [
      `Доброго времени суток ${user.first_name}.\nВыберете страну, в которой Вы бы хотели снять машину `
    ]
  }
  return messages[user.language_code][user.step]
}



bot.onText(/\/start/, msg => {
  //let step = 0;
  customer = msg.from;
  customer.step = 0;
  bot.sendMessage(msg.chat.id, reply(customer), {
    reply_markup: {
      inline_keyboard:
        replyContries(customer)
    }
  })
})

bot.on('callback_query', query => {
  switch(customer.step){
    case 0 :  customer.requested_country=query.data; customer.step++; break;
  }
  bot.sendMessage(363747387, customer.requested_country)
})
//  bot.on('message', (msg) => {
//    const name = msg.from.first_name;
//    console.log("message", msg)
//   bot.sendMessage(msg.chat.id, 'Hello, ' + name + '!').then(() => {
//      // reply sent!
//    });
//  });

module.exports = bot;
