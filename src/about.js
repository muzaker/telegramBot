const { Keyboard, Key } = require("telegram-keyboard");

module.exports = {
  Supporter() {
    const supporter = {
      x0x3b: "xMan",
      FLOSSit: "معتز المصري",
    };
    let text = "";
    for (let support in supporter) {
      text += supporter[support] + " : @" + support + "\n";
    }
    return text;
  },

  init(bot) {
    const { about, Supporter } = require("./about");

    let a = require("./about").action;

    let action = a.bind({ bot });
    let secBord = [
      Key.callback("ادعمنا", "supportMe"),
      Key.callback("رجوع", "about"),
    ];
    bot.action("Supporter", (ctx) => {
      const text =
        "الداعمين هم السبب الرائيسي في عمل البوت الخاص بنا وهم\n\n" +
        Supporter();
      action(ctx, text, Keyboard.inline([...secBord], { columns: 2 }));
    });

    bot.action("myBots", (ctx) => {
      const text = "البوتات الاخرى التي تم صنعناها وهي من تطوير @superastorh";
      action(
        ctx,
        text,
        Keyboard.inline(
          [Key.url("بوت عبود للشاي", "https://t.me/artea_bot"), ...secBord],
          { pattern: [1, 2] }
        )
      );
    });

    bot.action("supportMe", (ctx) => {
      let keyBord = Keyboard.inline([
        [
          Key.url("باتريون", "https://www.patreon.com/superastorh"),
          Key.callback("رجوع", "about"),
        ],
      ]);
      let text =
        "نرجو منك التواصل مع مطور البوت لمعرفة التفاصيل الازمة\n" +
        "مطور البوت : @superastorh\n" +
        "او دعمنا على احد المنصات التاليه";

      action(ctx, text, keyBord);
    });

    bot.action("about", (ctx) => {
      action(ctx, ...about());
    });
  },

  async action(ctx, message, extra = {}, doc) {
    const bot = this.bot;
    let chat = ctx.update.callback_query.message.chat.id;
    let messageId = ctx.update.callback_query.message.message_id;
    try {
      await bot.telegram.deleteMessage(chat, messageId);
    } catch (e) {}
    if (message) await bot.telegram.sendMessage(chat, message, extra);
    if (doc) await bot.telegram.sendDocument(chat, doc);
  },

  about() {
    const licenseUrl = "https://ojuba.org/waqf-2.0:رخصة_وقف_العامة";

    let about =
      "بوت مذكر هو بوت لنشر اذكار الصباح والمساء بشكل دوري في تيلجرام \n" +
      "البوت مجاني و مرخص برخصة وقف العامة" +
      "\n نرجو منكم دعمنا لنستمر";
    const buttons = Keyboard.inline(
      [
        Key.url("المطور", "https://t.me/superastorh"),
        Key.url("الرخصة", licenseUrl),
        Key.callback("ادعمنا", "supportMe"),
        Key.callback("الداعمين", "Supporter"),
        Key.callback("بوتات اخرى من صنعنا", "myBots"),
      ],
      { columns: 2 }
    );
    return [about, buttons];
  },
};
