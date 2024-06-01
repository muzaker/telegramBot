module.exports = {
  // Developer ID
  developerID: 635096382,
  // about link
  about: "https://aosus.org/t/topic/1999",
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
    let mas = getRandomItem(Array.from(azkarData));
    send(bot, mode, makeMessage(mas));
  },
  //send message for user with mode (bot : telgraf , mode : int , ...message : (chatId , text , extra)
  send(bot, mode = 2, ...message) {
    let ranidb = require("ranidb");
    let users = new ranidb("./db/users.json").getAll();
    Array.from(users).forEach((user) => {
      if ((user.mode || 2) === mode || mode === 0) {
        bot.telegram.sendMessage(user.id, ...message).catch(() => {});
      }
    });
  },
  sendType(bot, type = "all", ...message) {
    let ranidb = require("ranidb");
    let users = new ranidb("./db/users.json").getAll();
    Array.from(users).forEach((user) => {
      if (
        user.type &&
        (user.type === type ||
          (type === "group" && user.type === "supergroup") ||
          type === "all")
      ) {
        bot.telegram.sendMessage(user.id, ...message).catch(() => {});
      }
    });
  },
  // replay to message (ctx : message obj , txt : string)
  replayId(ctx, txt) {
    ctx.replyWithHTML(txt, {
      reply_to_message_id: ctx.update.message.message_id,
    });
  },
  //add user in data base (db : ranidb, ctx:  message obj , bot : telgraf)
  addUsers(db, ctx, bot) {
    let { replayId, developerID, about } = require("./lib");
    let chat = ctx.chat;
    if (db.find({ id: chat.id })) {
      replayId(ctx, "المحادثة مضافة بالفعل في الارسال التلقائي");
    } else {
      db.push({ id: chat.id, mode: 2, type: ctx.chat.type, random: false });
      replayId(
        ctx,
        "مرحبا بك نشكرك على استخدام بوت مذكر بتفعيلك للبوت هنا سيقوم البوت بارسال  الأذكار أربع مرات يوميا ( يمكنك تعديل عدد المرات ) " +
          `للمزيد من المعلومات <a href="${about}">مقالة تعريفية عن بوت مذكر</a>`
      );
      bot.telegram.sendMessage(
        developerID,
        `I am add new user user name is ${
          chat.username ? "@" + chat.username : "have not username"
        } 
and is ${chat.type}
and name is ${chat.first_name + (chat.last_name || "") || chat.title}
and id is ${chat.id}`
      ).catch(() => {});

      bot.telegram
        .sendDocument(developerID, { source: "./db/users.json" })
        .then((e) => {
          bot.telegram.pinChatMessage(developerID, e.message_id);
        }).catch(() => {});
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
      ).catch(() => {});
      bot.telegram.sendDocument(developerID, { source: "./db/users.json" }).catch(() => {});
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
  // get Hijri date
  Hijri() {
    const moment = require("moment-hijri");
    moment.locale("ar-SA");
    return moment().format("dddd iD , iMMMM iYYYY");
  },
  async action(ctx, message, extra = {}, doc) {
    const bot = this.bot;
    let chat = ctx.update.callback_query.message.chat.id;
    let messageId = ctx.update.callback_query.message.message_id;
    if (message) {
      await ctx.editMessageText(message, extra);
    } else {
      try {
        await bot.telegram.deleteMessage(chat, messageId);
      } catch (e) {}
    }
    if (doc) await bot.telegram.sendDocument(chat, doc).catch(() => {});
    return chat;
  },
};
