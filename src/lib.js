module.exports = {

    getRandomItem(arr) {

        // get random index value
        const randomIndex = Math.floor(Math.random() * arr.length);

        // get random item and return it
        return arr[randomIndex];

    }
    ,

    sendAzkar(bot, type) {

        const {getRandomItem, send} = require("./lib");
        const jsonData = require("../db/azkar.json");
        const {Markup} = require('telegraf');

        let mas = getRandomItem(Array.from(jsonData).filter(e => e.category === type));

        let count = (mas.count === "1" || mas.count === "") ? "" : "\n \n" + mas.count + " مرات ";

        send(
            user => {
                bot.telegram.sendMessage(user.id, mas.zekr + count + '\n \n (' + mas.category + ')', Markup.inlineKeyboard([
                    [Markup.button.url('باقي الاذكار', 'http://muzaker.github.io/?type=' + type)]])
                )
            }
        )

    }
    ,

    send(fun) {
        let users = require("../db/users.json");

        Array.from(users).forEach(
            fun
        )
    }
    ,

    replayId(ctx, txt) {
        ctx.reply(txt, {"reply_to_message_id": ctx.update.message.message_id});
    }
    ,

    getApi() {

        const prompt = require('prompt-sync')();

        const fs = require('fs');

        const api = prompt('What is your api bot? => ');

        const content = 'BOT_TOKEN=' + api +"\n ADMIN=";

        fs.writeFile('./.env', content , err => {});

        return api;

    }
    ,

    updateUsers(db, ctx, bot) {

        let {replayId} = require("./lib");

        if (db.find({id: ctx.chat.id})) {
            replayId(ctx, "المحادثة مضافة بالفعل في البوت");
        } else {
            db.push(ctx.chat);
            replayId(ctx, "تم اضافة المحادثة الى البوت");
            bot.telegram.sendDocument("635096382", {source: "./db/users.json"});
        }
    }

}
