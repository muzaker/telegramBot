module.exports = {
  // Developer ID
  developerID: 635096382,
  // get random item in array (array : array)
  getRandomItem(array) {
    // get random index value
    const randomIndex = Math.floor(Math.random() * array.length);
    // get random item and return it
    return array[randomIndex];
  },
  // make azkar message (item : object)
  makeMessage(item) {
    let count =
      item.count === "1" || item.count === ""
        ? ""
        : "\n\n" + item.count + " مرات ";

    let reference = !item.reference ? "" : "\n\n" + " رواة " + item.reference;

    return (
      "[ - " + item.category + " - ]" + "\n\n" + item.zekr + count + reference
    );
  },
  // send azkar with mode (bot : telgraf , mode : int )
  sendAzkar(bot, mode) {
    const { getRandomItem, makeMessage, send } = require("./lib");
    const { Markup } = require("telegraf");
    let azkarData = require("../db/azkar.json");
    let hour = new Date().getHours();
    let category = hour > 7 && hour < 16 ? "أذكار الصباح" : "أذكار المساء";
    let mas = getRandomItem(
      Array.from(azkarData).filter((e) => e.category === category)
    );
    send(
      bot,
      mode,
      makeMessage(mas),
      Markup.inlineKeyboard([
        [
          Markup.button.url(
            "باقي الاذكار",
            "http://muzaker.github.io/?type=" + category
          ),
        ],
      ])
    );
  },
  //send message for user with mode (bot : telgraf , mode : int , ...message : (chatId , text , extra)
  send(bot, mode = 2, ...message) {
    let ranidb = require("ranidb");
    let users = new ranidb("./db/users.json").getAll();
    Array.from(users).forEach((user) => {
      if ((user.mode || 2) === mode || mode === 0) {
        bot.telegram.sendMessage(user.id, ...message);
      }
    });
  },
  // replay to message (ctx : message obj , txt : string)
  replayId(ctx, txt) {
    ctx.reply(txt, { reply_to_message_id: ctx.update.message.message_id });
  },
  //add user in data base (db : ranidb, ctx:  message obj , bot : telgraf)
  addUsers(db, ctx, bot) {
    let { replayId, developerID } = require("./lib");
    let chat = ctx.chat;
    if (db.find({ id: chat.id })) {
      replayId(ctx, "المحادثة مضافة بالفعل في الارسال التلقائي");
    } else {
      db.push({ id: chat.id, mode: 2, type: ctx.chat.type, random: false });
      replayId(
        ctx,
        "مرحبا بك سيتم تشغيل هذا البوت هنا الان و الذي يقوم بارسال ذكر اربع مرت في اليوم" +
          "\n" +
          "يمكنكم ايقاف خدمة الارسال التلقائي عن طريقة الامر /off والاستفادة من المميزات الاخرى التي يقدمها البوت دون مشاكل"
      );
      bot.telegram.sendMessage(
        developerID,
        `I am add new user user name is ${
          chat.username ? "@" + chat.username : "have not username"
        } 
and is ${chat.type}
and name is ${chat.first_name + (chat.last_name || "") || chat.title}
and id is ${chat.id}`
      );

      bot.telegram
        .sendDocument(developerID, { source: "./db/users.json" })
        .then((e) => {
          bot.telegram.pinChatMessage(developerID, e.message_id);
        });
    }
  },

  removeUsers(db, ctx, bot) {
    let { replayId, developerID } = require("./lib");
    let chat = ctx.chat;
    if (!db.find({ id: chat.id })) {
      replayId(ctx, "المحادثة غير مضافه في الارسال التلقائي");
    } else {
      db.filter({ id: chat.id }).delete();
      replayId(
        ctx,
        "تم ايقاف الارسال التلقائي لهذه المحادثة" +
          "\n" +
          " من اجل اعادة استعمال الارسال التلقائي في البوت استخدم الامر /on"
      );

      bot.telegram.sendMessage(
        developerID,
        `
I am remove user user name is @${chat.username} 
and is ${chat.type}
and name is ${chat.first_name + (chat.last_name || "") || chat.title}
and id is ${chat.id}
                `
      );
      bot.telegram.sendDocument(developerID, { source: "./db/users.json" });
    }
  },

  async updateJson(ctx, db) {
    const axios = require("axios");
    const { removeSame } = require("./lib");
    const { file_id: fileId } = ctx.update.message.reply_to_message.document;
    const fileUrl = await ctx.telegram.getFileLink(fileId);
    const response = await axios.get(fileUrl.href);
    db.save(removeSame([...db.getAll(), ...response.data]));
    return "";
  },
  // remove same with id in array (array : array)
  // ex : [{id : 0} , {id : 0} , {id : 1}] => [{id : 0} , {id : 1}]
  removeSame(array) {
    return array.filter(
      (thing, index, self) => index === self.findIndex((t) => t.id === thing.id)
    );
  },
  // get The remaining time in days for the month of ramadan
  ramadan() {
    require("hijri-date");
    let year = new HijriDate().year;
    let w = true;
    let date = () => new HijriDate(year, 9, 1) - new HijriDate();
    while (w) {
      if (date() > 0) {
        w = false;
        let difference = date();
        return Math.ceil(difference / (1000 * 3600 * 24));
      } else {
        year++;
      }
    }
  },
  // get Hijri date
  Hijri() {
    require("hijri-date");
    let Hijri = new HijriDate();
    let days = [
      "الاحد",
      "الاثنين",
      "الثلاثاء",
      "الاربعاء",
      "الخميس",
      "الجمعة",
      "السبت",
    ];
    let month = [
      "مُحرَّم",
      "صفَر",
      "ربيعالأول",
      "ربيعالآخر",
      "جماديالأول",
      "جماديالآخر",
      "رَجب",
      "شَعبان",
      "رَمضان",
      "شوّال",
      "ذوالقِعدة",
      "ذوالحِجّة",
    ];
    return `${days[Hijri.day]} ${Hijri.date} ${month[Hijri.month - 1]} ${
      Hijri.year
    }`;
  },
};
