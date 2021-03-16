module.exports = {
  adminID: 635096382,

  getRandomItem(arr) {
    // get random index value
    const randomIndex = Math.floor(Math.random() * arr.length);

    // get random item and return it
    return arr[randomIndex];
  },
  makeMessage(mas) {
    let count =
      mas.count === "1" || mas.count === ""
        ? ""
        : "\n\n" + mas.count + " مرات ";

    let reference = !mas.reference ? "" : "\n\n" + " رواة " + mas.reference;

    return (
      "[ - " + mas.category + " - ]" + "\n\n" + mas.zekr + count + reference
    );
  },
  sendAzkar(bot, type) {
    const { getRandomItem, makeMessage, send } = require("./lib");
    const jsonData = require("../db/azkar.json");
    const { Markup } = require("telegraf");

    let mas = getRandomItem(
      Array.from(jsonData).filter((e) => e.category === type)
    );

    send((user) => {
      bot.telegram
        .sendMessage(
          user.id,
          makeMessage(mas),
          Markup.inlineKeyboard([
            [
              Markup.button.url(
                "باقي الاذكار",
                "http://muzaker.github.io/?type=" + type
              ),
            ],
          ])
        )
        .then();
    });
  },
  send(fun) {
    let users = require("../db/users.json");

    Array.from(users).forEach(fun);
  },
  replayId(ctx, txt) {
    ctx.reply(txt, { reply_to_message_id: ctx.update.message.message_id });
  },
  addUsers(db, ctx, bot) {
    let { replayId, adminID } = require("./lib");

    let chat = ctx.chat;

    if (db.find({ id: chat.id })) {
      replayId(ctx, "المحادثة مضافة بالفعل في الارسال التلقائي");
    } else {
      db.push({ id: chat.id });

      replayId(ctx, "تم اضافة المحادثة الى الارسال التلقائي");

      bot.telegram.sendMessage(
        adminID,
        `
I am add new user user name is @${chat.username} 
and is ${chat.type}
and name is ${chat.first_name + chat.last_name || chat.title}
                `
      );

      bot.telegram
        .sendDocument(adminID, { source: "./db/users.json" })
        .then((e) => {
          bot.telegram.pinChatMessage(adminID, e.message_id);
        });
    }
  },

  removeUsers(db, ctx, bot) {
    let { replayId, adminID } = require("./lib");

    let chat = ctx.chat;

    if (!db.find({ id: chat.id })) {
      replayId(ctx, "المحادثة غير مضافه في الارسال التلقائي");
    } else {
      db.filter({ id: chat.id }).delete();
      replayId(ctx, "تم ايقاف الارسال التلقائي لهذه المحادثة");

      bot.telegram.sendMessage(
        adminID,
        `
I am remove user user name is @${chat.username} 
and is ${chat.type}
and name is ${chat.first_name + chat.last_name || chat.title}
                `
      );

      bot.telegram.sendDocument(adminID, { source: "./db/users.json" });
    }
  },

  async updateJson(ctx, db) {
    const axios = require("axios");
    const { push, removeSame } = require("./lib");
    const { file_id: fileId } = ctx.update.message.reply_to_message.document;
    const fileUrl = await ctx.telegram.getFileLink(fileId);
    const response = await axios.get(fileUrl.href);
    db.save(removeSame([...db.getAll(), ...response.data]));
    return "";
  },
  Supporter() {
    const supporter = {
      x0x3b: "xMan",
    };
    let text = "";
    for (let support in supporter) {
      text += supporter[support] + " : @" + support + "\n";
    }
    return text;
  },
  push(db, ...items) {
    items.forEach((item) => db.push(item));
  },

  removeSame(arr) {
    return arr.filter(
      (thing, index, self) => index === self.findIndex((t) => t.id === thing.id)
    );
  },
  ramadan(){
    require("hijri-date");

    let year = new HijriDate().year;

    let w = true;

    let date = ()=> new HijriDate(year, 9, 1) - new HijriDate();
    while (w){
      if (date() > 0){
        w = false;
        let difference = date();
        return Math.ceil(difference / (1000 * 3600 * 24));
      }else {
        year++;
      }
    }
  }
};
