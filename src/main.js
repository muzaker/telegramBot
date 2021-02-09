let {getRandomItem, updateUsers ,sendAzkar , send , getCurrentTime, getNextDay , getApi ,replayId} = require("./lib");

const {Telegraf} = require('telegraf'),
    bot = new Telegraf(process.env.BOT_TOKEN || getApi());
const ranidb = require('ranidb');

let jsonData = require('../db/azkar.json'),
    db = new ranidb("./db/users.json");

bot.on('text', (ctx) => {
        let txt = ctx.update.message.text;

        console.log(txt);

        if (txt === "فذكر" || txt === "ذكر") {

            let mas = getRandomItem(jsonData);

            let count = (mas.count === "1" || mas.count === "") ? "" : "\n \n" + mas.count + " مرات ";

            replayId( ctx , mas.zekr + count + '\n \n (' + mas.category + ')');

        } else if (txt.startsWith("/on") || txt.startsWith("/start")) {

            updateUsers( db , ctx , bot)

        }

    });


addTimers();

bot.launch();


process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));


function addTimers() {

    setTimeout(
        () => {

            sendAzkar( bot , "أذكار الصباح");

            setInterval(
                () => sendAzkar(jsonData, bot, "أذكار الصباح")
                ,
                (24 * 60 * 60 * 1000)
            )
        }

        ,

        getCurrentTime(8 , 0)

    )

    setTimeout(
        () => {

            sendAzkar(bot , "أذكار المساء");

            setInterval(
                () => sendAzkar(jsonData, bot, "أذكار المساء")
                ,
                (24 * 60 * 60 * 1000)
            )
        }

        ,
        getCurrentTime(8 + 12 , 0)
    )
    setTimeout(
        () => {
           let mas = require("../db/friDay.json");
           /* اضف حل لانة التهاني غير موجوده*/
            send(
                e=>{
                    bot.telegram.sendMessage(e.id , getRandomItem(require("../db/friDay.json")))
                }
            );
        }
        ,

        getNextDay("fri") - new Date()
    )

}