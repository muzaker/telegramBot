// import hijri-date
require("hijri-date");
// import Telegraf
const { Telegraf, Markup } = require("telegraf");
// import Keyboard lib
const { Keyboard, Key } = require("telegram-keyboard");
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
// import about function
let { about, init, action } = require("./src/about");
// import Json Data
let jsonData = require("./db/azkar.json");
let mAzkar = Array.from(jsonData.filter((e) => e.category === "أذكار الصباح"));
let nAzkar = Array.from(jsonData.filter((e) => e.category === "أذكار المساء"));
const db = new ranidb("./db/users.json", { idType: "empty" });
// config .env file
require("dotenv").config();
// make new bot
const bot = new Telegraf(process.env.BOT_TOKEN || getApi());
// make vars
let sendActive = false;

process.on("uncaughtException", (err) => {
  adminSend("error \n" + JSON.stringify(err));
  console.error(err);
});

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

function admins(ctx, callBack = (e) => {}) {
  if (ctx.from.isAdmin || ctx.chat.type === "private") {
    callBack();
    return true;
  } else {
    ctx.reply("هذا امر مخصص للمشرفين");
    return false;
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
  admins(ctx, () => addUsers(db, ctx, bot));
});
// when some one need bot stop in this chat
bot.command("off", (ctx) => {
  admins(ctx, () => removeUsers(db, ctx, bot));
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
    replay = "تقبل الله طاعاتكم و بارك اللهم لكم في شهر رمضان";
  }
  replayId(ctx, replay);
});
bot.command("version", (ctx) => {
  ctx.reply(require("./package.json").version);
});
/* for admin command */
//send message to all users
bot.action("send", (ctx) => {
  action(ctx, "ارسل رسالتك الان", Markup.forceReply());
  sendActive = true;
});
bot.action("userLength", (ctx) => {
  let users = db.getAll();
  let length = (...e) => db.filter(...e).length;
  let mes = `
users length is
├ all user :  ${users.length} 
├ unset (4)  :  ${length((e) => !e.mode)}
├ 2 messges  :  ${length({ mode: 1 })}
├ 4 messges  :  ${length({ mode: 2 })}
├ 6 messges  :  ${length({ mode: 3 })}
├ Private       :  ${length({ type: "private" })}
└ Group        :  ${length({ type: "group" }) + length({ type: "supergroup" })}
`;
  action(ctx, mes);
});
//set json file for users
bot.command("set", (ctx) => {
  if (
    !(
      ctx.message.reply_to_message &&
      ctx.chat.id === 635096382 &&
      ctx.message.reply_to_message.document
    )
  )
    return;
  updateJson(ctx, db)
    .then(() => ctx.reply("تم بنجاح"))
    .catch((err) => {
      ctx.reply("حصل خطأ");
      ctx.reply(err);
    });
});

bot.action("update", async (ctx) => {
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
  await command("git pull");
  await command("npm i");
  command("pm2 restart main.js");
});

bot.action("restart", async (ctx) => {
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
  command("pm2 restart main.js");
});

bot.on("new_chat_members", (ctx) => {
  if (ctx.message.new_chat_members[0].username !== bot.botInfo.username) return;
  addUsers(db, ctx, bot);
});

bot.command("zkr", (ctx) => {
  ctx.reply(
    "اذكار الصباح و المساء بشكل مرتب للمحادثات",
    Keyboard.inline([
      Key.callback("اذكار المساء", "N-zkr-0"),
      Key.callback("اذكار الصباح", "D-zkr-0"),
    ])
  );
});

mAzkar.forEach((elm, index, array) => zkr("D-zkr", elm, index, array));

nAzkar.forEach((elm, index, array) => zkr("N-zkr", elm, index, array));

function zkr(name, elm, index, array) {
  let length = array.length;
  let num = index + 1;
  let button = [];
  if (num !== 1) button.push(Key.callback("السابق", name + "-" + (index - 1)));
  if (num !== length)
    button.push(Key.callback("التالي", name + "-" + (index + 1)));
  bot.action(name + "-" + index, (ctx) => {
    action(
      ctx,
      makeMessage(elm) + "\n" + num + "/" + length,
      Keyboard.inline(button)
    );
  });
}
//update h date
bot.command("setting", (ctx) => {
  if (!(ctx.chat.id === adminID || owner.indexOf(ctx.chat.username) !== -1))
    return;
  const keyboard = Keyboard.inline(
    [
      Key.callback("ارسال", "send"),
      Key.callback("تحديث", "update"),
      Key.callback("عدد المستخدمين", "userLength"),
      Key.callback("قاعدة المستخدمين", "user"),
      Key.callback("ضبط المستخدمين", "fixed"),
      Key.callback("اعادة تشغيل", "restart"),
    ],
    {
      columns: 2,
    }
  );

  ctx.reply("اهلا بك ايها المشرف يمكنك الاستفاده من هذة الاوامر", keyboard);
});

bot.command("mode", (ctx) => {
  let id = ctx.chat.id;
  let user = db.find({ id });
  if (!admins(ctx)) return;
  if (!user) {
    ctx.reply("يجب عليك الستجيل في البوت داخل هذة المحادئة باستخدام الامر /on");
    return;
  }
  let mode = (user.mode || 2) - 1;
  let keybord = ["رسالتين", "اربع رسائل", "ست رسائل"];
  keybord = keybord.map((elm, index) => {
    if (mode === index) elm += " (مفعل)";
    return Key.callback(elm, "message-" + (index + 1));
  });
  const board = Keyboard.inline(keybord, {
    columns: 1,
  });
  ctx.reply("اختر عدد الرسائل التي تريدان يرسلها البوت تلقائيا", board);
});

bot.action(["message-1", "message-2", "message-3"], (ctx) => {
  let name = ctx.update.callback_query.data;
  let set = (e) => db.find({ id: ctx.chat.id }).put({ mode: e });
  let mode = parseInt(name[name.length - 1]);
  set(mode);
  action(ctx, `تم تغير عدد الرسائل الى ${mode * 2}`);
});

//get users
bot.action("user", (ctx) =>
  action(ctx, false, {}, { source: "./db/users.json" })
);

bot.action("okSend", (ctx) => {
  action(ctx, false);
  send(bot, 0, ctx.update.callback_query.message.text);
});

bot.action("fixed", async (ctx) => {
  action(ctx, "بداية ضيط قاعدة البيانات");
  async function fil(item) {
    try {
      item.mode = item.mode || 2;
      let chat = await bot.telegram.getChat(item.id);
      item.type = chat.type;
      chat.username ? (item.username = chat.username) : "";
      return item;
    } catch (err) {
      return item;
    }
  }
  //const getData = async () => Promise.all(db.getAll().map((item) => map(item)));
  let array = db.getAll();
  for (let i in array) {
    array[i] = await fil(array[i]);
  }
  db.save(array);
  action(ctx, "تم بنجاح");
});

bot.on("text", (ctx) => {
  let reply = ctx.message.reply_to_message;
  if (
    !(
      reply &&
      reply.from.id === bot.botInfo.id &&
      reply.text === "ارسل رسالتك الان" &&
      sendActive
    )
  )
    return;

  let keybord = Keyboard.inline([Key.callback("ارسال", "okSend")]);
  bot.telegram.sendMessage(adminID, ctx.message.text, keybord);
  sendActive = false;
});

//send when bot start
bot.launch().then(() => start());

async function start() {
  adminSend("اشتغل بوت" + "\n @" + bot.botInfo.username);
  console.log(`bot is start @${bot.botInfo.username}`);
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
  "0 */4 * * *",
  () => {
    sendAzkar(bot, 3);
  },
  options
);

cron.schedule(
  "0 */6 * * *",
  () => {
    sendAzkar(bot, 2);
  },
  options
);

cron.schedule(
  "0 */12 * * *",
  () => {
    sendAzkar(bot, 1);
  },
  options
);

cron.schedule(
  "0 9 * * 5",
  () => send(bot, 0, getRandomItem(require("./db/friDay.json")).zekr),
  options
);

function adminSend(...msg) {
  sendMessage(adminID, ...msg);
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
