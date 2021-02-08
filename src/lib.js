module.exports = {

    getRandomItem(arr) {

        // get random index value
        const randomIndex = Math.floor(Math.random() * arr.length);

        // get random item and return it
        return arr[randomIndex];

    },

    getCurrentTime(h = 0, m = 0) {

        let date1 = new Date();
        let date2 = new Date();
        date2.setHours(h, m);
        let diffTime = date2 - date1;
        if (diffTime >= 0) {
            return diffTime;
        } else {
            date2.setDate(date2.getDay() + 1);
            diffTime = date2 - date1;
            return diffTime;
        }


    },

    send(jsonData, bot, type) {

        let {getRandomItem} = require("./lib");

        let users = require("../db/users.json");
        const {Markup} = require('telegraf');

        let mas = getRandomItem(Array.from(jsonData).filter(e => e.category === type));

        let count = (mas.count === "1" || mas.count === "") ? "" : "\n \n" + mas.count + " مرات ";

        Array.from(users).forEach(
            user => {
                bot.telegram.sendMessage(user.id, mas.zekr + count + '\n \n (' + mas.category + ')' , Markup.inlineKeyboard([
                    [Markup.button.url('باقي الاذكار', 'http://muzaker.github.io/?type=' + type )]])
                );
            }
        )
    }
    ,

    replayId(ctx, txt) {
        ctx.reply(txt, {"reply_to_message_id": ctx.update.message.message_id});
    },

    getNextDay(dayName, excludeToday = true, refDate = new Date()) {

        const dayOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]
            .indexOf(dayName.slice(0, 3).toLowerCase());

        if (dayOfWeek < 0) return;

        refDate.setHours(0, 0, 0, 0);

        refDate.setDate(refDate.getDate() + +!!excludeToday +
            (dayOfWeek + 7 - refDate.getDay() - +!!excludeToday) % 7);
        refDate.setHours(10);
        return refDate;
    },

    getApi() {

        const prompt = require('prompt-sync')();

        const ranidb = require('ranidb');

        let db = new ranidb("./db/MyApi.json");


        if (db.getAll()[0] == undefined) {
            const api = prompt('What is your api bot? => ');
            db.insert({
                api: api
            });
            return api;
        } else {
            return db.getAll()[0].api;
        }

    },

    updateUsers(db, ctx, bot) {

        let {replayId} = require("./lib");

        if (db.find({id: ctx.chat.id})) {
            replayId(ctx, "المحادثة مضافة بالفعل في البوت");
        } else {
            db.insert(ctx.chat);
            replayId(ctx, "تم اضافة المحادثة الى البوت");
            bot.telegram.sendDocument("635096382", {source: "./db/users.json"});
        }
    }

}
