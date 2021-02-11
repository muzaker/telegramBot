// import Telegraf
const {Telegraf} = require('telegraf');
// import cron
const cron = require('node-cron');
// import ranidb
const ranidb = require('ranidb');
// import function
let {getRandomItem, updateUsers, sendAzkar, send, getApi, replayId} = require("./lib");
// import Json Data
let jsonData = require('../db/azkar.json');

const db = new ranidb("./db/users.json");
// config .env file
require('dotenv').config();
// make new bot
const bot = new Telegraf(process.env.BOT_TOKEN || getApi());
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

//send when bot start

bot.launch().then(r => start());

function start(){
    bot.telegram.sendMessage("635096382", "اشتغل بوت" + "\n @" + bot.botInfo.username);
}
function stop(stop){
    if (stop) bot.stop(stop);
    bot.telegram.sendMessage("635096382", "تقفل بوت" + "\n @" + bot.botInfo.username);
}
process.once('SIGINT', () => stop('SIGINT'));

process.once('SIGTERM', () => stop('SIGTERM'));

const options = {
    scheduled: true,
    timezone: "Asia/Kuwait"
};

cron.schedule('0 7 * * *', () => {
    sendAzkar(bot, "أذكار الصباح");
    console.log("run");
}, options);
cron.schedule('0 20 * * *', () => {
    sendAzkar(bot, "أذكار المساء");
}, options);
cron.schedule('* 9 * * 5', () => {
    send(e => {
        bot.telegram.sendMessage(e.id, getRandomItem(require("../db/friDay.json")).zekr)
    });
}, options);
