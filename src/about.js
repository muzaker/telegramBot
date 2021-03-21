module.exports = {
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

  about(bot) {
    const licenseUrl =
      "https://ojuba.org/waqf-2.0:%D8%B1%D8%AE%D8%B5%D8%A9_%D9%88%D9%82%D9%81_%D8%A7%D9%84%D8%B9%D8%A7%D9%85%D8%A9";
    const { Markup } = require("telegraf");
    const { action, Supporter } = require("./about");

    let about = `بوت مذكر هو لنشر اذكار الصباح والمساء بشكل دوري في المجموعات 
البوت مجاني تماما و مفتوح المصدر
لذالك نروج منك دعمنا حتى نستمر
`;
    const buttons = Markup.inlineKeyboard([
      [
        Markup.button.url("المطور", "https://t.me/superastorh"),
        Markup.button.url("الرخصة", licenseUrl),
      ],
      [
        Markup.button.callback("ادعمنا", "supportMe"),
        Markup.button.callback("الداعمين", "Supporter"),
      ],
      [Markup.button.callback("بوتات اخرى من صنعنا", "myBots")],
    ]);

    bot.command("about", (ctx) => {
      if (ctx.message.chat.type !== "supergroup") {
        ctx.reply(about, buttons);
      } else {
        ctx.reply(
          "لاتعمل الرساله في المجموعات تواصل معي خاص" +
            " @" +
            bot.botInfo.username
        );
      }
    });

    bot.action("Supporter", (ctx) => {
      let keyBord = Markup.inlineKeyboard([
        [
          Markup.button.callback("ادعمنا", "supportMe"),
          Markup.button.callback("رجوع", "about"),
        ],
      ]);
      action(
        ctx,
        "الداعمين هم السبب الرائيسي في عمل البوت الخاص بنا وهم" +
          "\n\n" +
          Supporter(),
        keyBord
      );
    });

    bot.action("myBots", (ctx) => {
      let keyBord = Markup.inlineKeyboard([
        [Markup.button.url("بوت عبود للشاي", "https://t.me/artea_bot")],
        [
          Markup.button.callback("ادعمنا", "supportMe"),
          Markup.button.callback("رجوع", "about"),
        ],
      ]);
      action(
        ctx,
        "البوتات الاخرى التي تم صنعناها وهي من تطوير @superastorh",
        keyBord
      );
    });

    bot.action("supportMe", (ctx) => {
      let keyBord = Markup.inlineKeyboard([
        [
          Markup.button.url("باتريون", "https://www.patreon.com/superastorh"),
          Markup.button.callback("رجوع", "about"),
        ],
      ]);
      action(
        ctx,
        "نرجو منك التواصل مع مطور البوت لمعرفة التفاضيل الازمة  \n" +
          "مطور البوت : @superastorh\n" +
          "او دعمنا على احد المنصات التاليه",
        keyBord
      );
    });

    bot.action("about", (ctx) => {
      action(ctx, about, buttons);
    });
  },
  action(ctx, message, extra = {}, doc, Bot) {
    let chat = ctx.update.callback_query.message.chat.id;
    let messageId = ctx.update.callback_query.message.message_id;
    Bot.telegram.deleteMessage(chat, messageId).then();
    if (message) Bot.telegram.sendMessage(chat, message, extra).then();
    if (doc) Bot.telegram.sendDocument(chat, doc).then();
  },
};
