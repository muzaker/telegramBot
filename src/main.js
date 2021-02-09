// import Telegraf
const {Telegraf} = require('telegraf');
// import cron
const cron = require('node-cron');
// import ranidb
const ranidb = require('ranidb');
// import function
let {getRandomItem, updateUsers, sendAzkar, send , getApi, replayId} = require("./lib");
// import Json Data
let jsonData = require('../db/azkar.json');
const db = new ranidb("./db/users.json");
// config .env file
require('dotenv').config();
// make new bot
const bot = new Telegraf( process.env.BOT_TOKEN || getApi() );
// when start bot
bot.start((ctx) => updateUsers(db, ctx, bot));
// when you need bot start
bot.command("on", ctx =>
    updateUsers(db, ctx, bot)
);
//get new Message
bot.command("new", (ctx) => {

    let mas = getRandomItem(jsonData);

    let count = (mas.count === "1" || mas.count === "") ? "" : "\n \n" + mas.count + " مرات ";

    replayId(ctx, mas.zekr + count + '\n \n (' + mas.category + ')');

})

bot.launch().then(r => {});


process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

const options = {
    scheduled: true,
    timezone: "Asia/Kuwait"
};

cron.schedule('* * 8 * *', () => {
    sendAzkar(bot, "أذكار الصباح");
},options );
cron.schedule('* * 20 * *', () => {
    sendAzkar(bot, "أذكار المساء");
} , options);
cron.schedule('* * 9 * 5', () => {
    send(e=>{
            bot.telegram.sendMessage(e.id , getRandomItem(require("../db/friDay.json")).zekr)
        });
} , options);
