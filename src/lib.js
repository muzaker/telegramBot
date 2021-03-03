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

        const content = 'BOT_TOKEN=' + api ;

        fs.writeFile('./.env', content , err => {});

        return api;

    }
    ,

    addUsers( db , ctx , bot ) {

        let {replayId} = require("./lib");

        let chat = ctx.chat;

        if (db.find({id: chat.id})) {
            replayId(ctx, "المحادثة مضافة بالفعل في الارسال التلقائي");
        } else {
            db.push({id : chat.id});
            replayId(ctx, "تم اضافة المحادثة الى الارسال التلقائي");

            bot.telegram.sendMessage("635096382",
                `
I am add new user user name is @${chat.username} 
and is ${chat.type}
and name is ${(chat.first_name + chat.last_name) || chat.title}
                `
            );

            bot.telegram.sendDocument("635096382", {source: "./db/users.json"});
        }
    },

    removeUsers( db , ctx , bot ) {

        let {replayId} = require("./lib");

        let chat = ctx.chat;

        if (!db.find({id: chat.id})) {
            replayId(ctx, "المحادثة غير مضافه في الارسال التلقائي");
        } else {
            db.filter({id : chat.id}).delete();
            replayId(ctx, "تم ايقاف الارسال التلقائي لهذه المحادثة");

            bot.telegram.sendMessage("635096382",
                `
I am remove user user name is @${chat.username} 
and is ${chat.type}
and name is ${(chat.first_name + chat.last_name) || chat.title}
                `
            );

            bot.telegram.sendDocument("635096382", {source: "./db/users.json"});
        }
    }

    ,
    async updateJson(ctx , db) {
        const axios = require('axios');
        const {file_id: fileId} = ctx.update.message.reply_to_message.document;
        const fileUrl = await ctx.telegram.getFileLink(fileId);
        const response = await axios.get(fileUrl.href);
        db.save(response.data);
        return "";
    }
}
