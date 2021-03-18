// import hijri-date
require("hijri-date");
// import Telegraf
const { Telegraf, Markup } = require("telegraf");
// import cron
const cron = require("node-cron");
// import ranidb
const ranidb = require("ranidb");
// import function
let {
  getRandomItem,
  addUsers,
  removeUsers,
  sendAzkar,
  send,
  replayId,
  makeMessage,
  updateJson,
  Supporter,
  ramadan,
  adminID,
  Hijri
} = require("./src/lib");
// import Json Data
let jsonData = require("./db/azkar.json");
const db = new ranidb("./db/users.json", { idType: "empty" });
// config .env file
require("dotenv").config();
// make new bot
const bot = new Telegraf(process.env.BOT_TOKEN || getApi());
// make vars
let sendActive = false;
let about = `بوت عبود هو لنشر اذكار الصباح والمساء بشكل دوري في المجموعات 
البوت مجاني تماما و مفتوح المصدر
لذالك نروج منك دعمنا حتى نستمر
    `;
let reAbout = Markup.inlineKeyboard([
  [Markup.button.callback("رجوع", "about")],
]);

const licenseUrl =
    "https://ojuba.org/waqf-2.0:%D8%B1%D8%AE%D8%B5%D8%A9_%D9%88%D9%82%D9%81_%D8%A7%D9%84%D8%B9%D8%A7%D9%85%D8%A9";

const buttons = Markup.inlineKeyboard([
  [
    Markup.button.url("المطور", "https://t.me/superastorh"),
    Markup.button.url("الرخصة", licenseUrl),
  ],
  [
    Markup.button.callback("ادعمنا", "supportMe"),
    Markup.button.callback("الداعمين", "Supporter"),
  ],
]);

bot.command("about", (ctx) => {
  if (ctx.message.chat.type !== "supergroup") {
    ctx.reply(about, buttons);
  } else {
    ctx.reply(
        "لاتعمل الرساله في المجموعات تواصل معي خاص" + " @" + bot.botInfo.username
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

bot.action("supportMe", (ctx) => {
  action(
      ctx,
      "اذا كنت ترغب بدعمنا نرجو منك التواصل مع مطور البوت لمعرفة التفاضيل الازمة \n مطور البوت : @superastorh",
      reAbout
  );
});

bot.action("about", (ctx) => {
  action(ctx, about, buttons);
});

// when start chat on bot
bot.start((ctx) => addUsers(db, ctx, bot));
// when some one need bot start in this chat
bot.command("on", (ctx) => {
  addUsers(db, ctx, bot);
});
// when some one need bot stop in this chat
bot.command("off", (ctx) => removeUsers(db, ctx, bot));
//get new Message
bot.command("new", (ctx) => {
  let mas = getRandomItem(jsonData);

  replayId(ctx, makeMessage(mas));
});
//get hdate
bot.command("date", (ctx) => {
  ctx.reply(Hijri());
});
//get time
bot.command("ramadan", (ctx) => {
  let days = ramadan();

  let replay;

  if (new HijriDate().month !== 9) {
    replay = " يتبقى على شهر رمضان " + days + " يوم  تقريبا ";
  } else {
    replay = "استغل رمضان الحالي فقد يعود ولاكن بدوننا";
  }
  replayId(ctx, replay);
});

// for admin command
//send message to all users
bot.action("send", (ctx) => {
  action(ctx, "ارسل رسالتك الان", Markup.forceReply());
  sendActive = true;
});
//set json file for users
bot.command("set", (ctx) => {
  if (
      ctx.message.reply_to_message &&
      ctx.chat.id === 635096382 &&
      ctx.message.reply_to_message.document
  ) {
    updateJson(ctx, db)
        .then(() => ctx.reply("تم بنجاح"))
        .catch((err) => {
          ctx.reply("حصل خطاء");
          ctx.reply(err);
        });
  }
});
//update h date
bot.command("setting", (ctx) => {
  if (ctx.chat.id === adminID) {
    ctx.reply(
        "اهلا بك ايها المشرف",
        Markup.inlineKeyboard([
          [Markup.button.callback("قاعدة المستخدمين", "user")],
          [Markup.button.callback("ارسال", "send")],
        ])
    );
  }
});

//get users
bot.action("user", (ctx) =>
    action(ctx, false, {}, { source: "./db/users.json" })
);
bot.action("okSend", (ctx) => {
  action(ctx, false);
  send((e) => {
    sendMessage(e.id, ctx.update.callback_query.message.text);
  });
});
bot.on("text", (ctx) => {
  let reply_to_message = ctx.message.reply_to_message;
  if (
      reply_to_message &&
      reply_to_message.from.id === bot.botInfo.id &&
      reply_to_message.text === "ارسل رسالتك الان" &&
      sendActive
  ) {
    ctx.reply(
        ctx.message.text,
        Markup.inlineKeyboard([Markup.button.callback("ارسال", "okSend")])
    );
    sendActive = false;
  }
});

//send when bot start
bot.launch().then(() => start());

function start() {
  adminSend("اشتغل بوت" + "\n @" + bot.botInfo.username);
}

function stop(stop) {
  if (stop) bot.stop(stop);

  adminSend("تقفل بوت" + "\n @" + bot.botInfo.username);
}

process.once("SIGINT", () => stop("SIGINT"));

process.once("SIGTERM", () => stop("SIGTERM"));

const options = {
  scheduled: true,
  timezone: "Asia/Kuwait",
};

cron.schedule(
    "0 7,13 * * *",
    () => {
      sendAzkar(bot, "أذكار الصباح");
    },
    options
);

cron.schedule(
    "0 17,19 * * *",
    () => {
      sendAzkar(bot, "أذكار المساء");
    },
    options
);

cron.schedule(
    "0 9 * * 5",
    () => {
      send((e) => {
        sendMessage(e.id, getRandomItem(require("./db/friDay.json")).zekr);
      });
    },
    options
);

function adminSend(txt) {
  sendMessage(adminID, txt);
}

function action(ctx, message, extra = {}, doc) {
  let chat = ctx.update.callback_query.message.chat.id;
  let messageId = ctx.update.callback_query.message.message_id;
  deleteMessage(chat, messageId);
  if (message) sendMessage(chat, message, extra);
  if (doc) bot.telegram.sendDocument(chat, doc).then();
}

function deleteMessage(chat_id, message_id) {
  bot.telegram.deleteMessage(chat_id, message_id).then();
}

function sendMessage(chatId, text, extra = {}) {
  bot.telegram.sendMessage(chatId, text, extra).then();
}

function getApi() {
  const prompt = require("prompt-sync")();

  const fs = require("fs");

  const api = prompt("What is your api bot? => ");

  const content = "BOT_TOKEN=" + api;

  fs.writeFile(".env", content, () => {});

  return api;
}