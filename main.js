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
  ramadan,
  adminID,
  Hijri,
} = require("./src/lib");
let { about, init, action } = require("./src/about");
// import Json Data
let jsonData = require("./db/azkar.json");
const db = new ranidb("./db/users.json", { idType: "empty" });
// config .env file
require("dotenv").config();
// make new bot
const bot = new Telegraf(process.env.BOT_TOKEN || getApi());
// make vars
let sendActive = false;

bot.use(function (ctx, next) {
  /// or other chat types...
  if (ctx.chat.id > 0) return next();
  /// need to cache this result ( variable or session or ....)
  /// because u don't need to call this method
  /// every message
  return bot.telegram
    .getChatAdministrators(ctx.chat.id)
    .then(function (data) {
      if (!data || !data.length) return;
      ctx.chat._admins = data;
      ctx.from.isAdmin = data.some((adm) => adm.user.id === ctx.from.id);
    })
    .catch(console.log)
    .then((_) => next(ctx));
});
let owner = ["FLOSSit", "x0x3b"];
function admins(ctx, callBack) {
  if (ctx.from.isAdmin || ctx.chat.type === "private") {
    callBack();
  } else {
    ctx.reply("هذا امر مخصص للمشرفين");
  }
}

action = action.bind({ bot });

// when start chat on bot
bot.start((ctx) => {
  admins(ctx, (e) => addUsers(db, ctx, bot));
});

init(bot);

bot.command("about", (ctx) => {
  if (ctx.message.chat.type !== "supergroup") {
    ctx.reply(...about());
  } else {
    ctx.reply(
      "لاتعمل الرساله في المجموعات تواصل معي خاص" + " @" + bot.botInfo.username
    );
  }
});
// when some one need bot start in this chat
bot.command("on", (ctx) => {
  admins(ctx, (e) => addUsers(db, ctx, bot));
});
// when some one need bot stop in this chat
bot.command("off", (ctx) => {
  admins(ctx, (e) => removeUsers(db, ctx, bot));
});
//get new Message
about();
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

/* for admin command */
//send message to all users
bot.action("send", (ctx) => {
  action(ctx, "ارسل رسالتك الان", Markup.forceReply());
  sendActive = true;
});
bot.action("userLength", (ctx) => {
  action(ctx, "عدد المستخدمين هم \n" + db.getAll().length);
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
        ctx.reply("حصل خطأ");
        ctx.reply(err);
      });
  }
});

bot.action("update", (ctx) => {
  if (!ctx.chat.id === adminID) return;
  const util = require("util");
  const exec = util.promisify(require("child_process").exec);

  async function command(command) {
    try {
      const { stdout, stderr } = await exec(command);
      await action(
        ctx,
        "Error () \n" + stderr + "\n result () \n" + stdout
      ).catch((e) => {});
    } catch (err) {
      await action(ctx, "catch () \n" + err);
    }
  }
  command("git pull").then(() => command("pm2 restart main.js"));
});

bot.on("new_chat_members", (ctx) => {
  if (!ctx.message.new_chat_members.username === bot.botInfo.username) return;
  addUsers(db, ctx, bot);
});

//zaker
/*
bot.command("zkr", (ctx) => {
  if (db.find({ id: ctx.from.id })) ctx.reply("انت مسجل معنا");
  let morning = require("./db/azkar.json").filter(
    (e) => (e.category = "أذكار الصباح")
  );
  ctx.reply(
    morning[0].zekr,
    Markup.inlineKeyboard([Markup.button.callback("التالي", "next")])
  );
});
*/

//update h date
bot.command("setting", (ctx) => {
  if (ctx.chat.id === adminID || owner.indexOf(ctx.chat.username) !== -1) {
    ctx.reply(
      "اهلا بك ايها المشرف يمكنك الاستفاده من هذة الاوامر",
      Markup.inlineKeyboard([
        [Markup.button.callback("قاعدة المستخدمين", "user")],
        [Markup.button.callback("ارسال", "send")],
        [Markup.button.callback("عدد المستخدمين", "userLength")],
        [Markup.button.callback("تحديث", "update")],
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
    bot.telegram.sendMessage(
      adminID,
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
