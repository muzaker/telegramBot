const { Keyboard, Key } = require("telegram-keyboard");
module.exports = {
  // sponsors message creator
  sponsors() {
    const sponsors = {
      x0x3b: "xMan",
      FLOSSit: "معتز المصري",
    };
    let message = "";
    for (let support in sponsors) {
      message += sponsors[support] + " : @" + support + "\n";
    }
    return message;
  },
  // add action for button in bot
  init(bot) {
    // import function from this file
    const { about, sponsors } = require("./about");
    // set action function to bot
    let action = require("./about").action.bind({ bot });
    // back and be support button
    let sponsorsButton = [
      Key.callback("ادعمنا", "be-sponsors"),
      Key.callback("رجوع", "about"),
    ];
    // get name for sponsors
    bot.action("sponsors", (ctx) => {
      const text =
        "الداعمين هم السبب الرائيسي في عمل البوت الخاص بنا وهم\n\n" +
        sponsors();
      action(ctx, text, Keyboard.inline([...sponsorsButton], { columns: 2 }));
    });
    // show own bot
    bot.action("myBots", (ctx) => {
      const text = "البوتات الاخرى التي تم صنعناها وهي من تطوير @superastorh";
      action(
        ctx,
        text,
        Keyboard.inline(
          [
            Key.url("بوت عبود للشاي", "https://t.me/artea_bot"),
            ...sponsorsButton,
          ],
          { pattern: [1, 2] }
        )
      );
    });
    // be sponsors for this bot
    bot.action("be-sponsors", (ctx) => {
      let button = Keyboard.inline(
        [
          [
            Key.url("patreon", "https://www.patreon.com/superastorh"),
            Key.url("ko-fi", "http://Ko-fi.com/superastorh"),
            Key.callback("رجوع", "about"),
          ],
        ],
        {
          columns: 2,
        }
      );
      let message =
        "يمكنك دعم مذكر ماليا لضمان استمرار استضافته و تطويره يمكنك دعمنا على محافظ العملات الرقمية ادناه \n" +
        "usdt trc20 : TTWXHrhqjBT16mggpQsHoxMRrf7xjv4KWg \n\n" +
        "bch : bitcoincash:qzu099u6uuvwhjactalynhdyfmkqa6u0dg9ak7nkkj \n\n" +
        "اطلب ارسال عمله اخر من مطور البوت @superastorh \n" +
        "او ارسل الى احد المنصات التاليه";
      action(ctx, message, button);
    });
    // for back button
    bot.action("about", (ctx) => {
      action(ctx, ...about());
    });
  },
  // short way to call action
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
    if (doc) await bot.telegram.sendDocument(chat, doc);
  },
  // return about message and button it
  about() {
    const licenseUrl = "https://ojuba.org/waqf-2.0:رخصة_وقف_العامة";
    let message =
      "بوت مذكر هو بوت لنشر الاذكار بشكل دوري و العديد من المميزات الاخرى " +
      "البوت مجاني و مفتوحة المصدر و يحترم خصوصية المستخدمين";
    const button = Keyboard.inline(
      [
        Key.url("المطور", "https://t.me/superastorh"),
        Key.url("الرخصة", licenseUrl),
        Key.callback("ادعمنا", "be-sponsors"),
        Key.callback("الداعمين", "sponsors"),
        Key.callback("بوتات اخرى من صنعنا", "myBots"),
      ],
      { columns: 2 }
    );
    return [message, button];
  },
};
