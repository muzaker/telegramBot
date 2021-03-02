// import Telegraf
const {Telegraf} = require('telegraf');
// import cron
const cron = require('node-cron');
// import ranidb
const ranidb = require('ranidb');
// import function
let {getRandomItem, updateUsers, sendAzkar, send, getApi, replayId} = require("./src/lib");
// import Json Data
let jsonData = require('./db/azkar.json');

const db = new ranidb('./db/users.json' , { idType: "empty" });
// config .env file
require('dotenv').config();
// make new bot
const bot = new Telegraf(process.env.BOT_TOKEN || getApi());

const fetch = require('node-fetch');

let hDate = "";

let ramadan = "";

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

bot.command("date", ctx => {
    ctx.reply(hDate);
})

bot.command("send" , ctx =>{
    if((ctx.message.reply_to_message) && ctx.chat.id === 635096382){
        send(e => {
            bot.telegram.sendMessage(e.id, ctx.message.reply_to_message.text)
        });
    }
})

bot.command("ramadan" , ctx =>{

    ramadan = new Date(new Date().getFullYear(), 3, 12)
    let difference = ramadan.getTime() - new Date().getTime();
    let days = Math.ceil(difference / (1000 * 3600 * 24));
    ctx.reply(" يتبقى على شهر رمضان" + days + " تقريبا ")
})
//send when bot start

bot.launch().then(() => start());

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

cron.schedule('0 7,10,13 * * *', () => {
    sendAzkar(bot, "أذكار الصباح");
    console.log("run");
}, options);

cron.schedule('0 17,20,23 * * *', () => {
    sendAzkar(bot, "أذكار المساء");
}, options);

cron.schedule('0 9 * * 5', () => {
    send(e => {
        bot.telegram.sendMessage(e.id, getRandomItem(require("./db/friDay.json")).zekr)
    });
}, options);

cron.schedule('0 1 * * *', () => {
    getDate();
}, options);

getDate()

async function getDate(){

    const response = await fetch('http://api.aladhan.com/v1/gToH');
    const json = await response.json();
    const date = json.data.hijri;
    hDate = `${date.weekday.ar} ${date.day} ${date.month.ar} ${date.year}`;

}
