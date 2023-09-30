// import Telegraf
const { Telegraf, Markup } = require("telegraf");
// import Keyboard lib
const { Keyboard, Key } = require("telegram-keyboard");
// import cron
const cron = require("node-cron");
// import ranidb
const ranidb = require("ranidb");
// import function from lib.js
let {
  developerID,
  about,
  getRandomItem,
  addUsers,
  removeUsers,
  sendAzkar,
  send,
  sendType,
  replayId,
  makeMessage,
  updateJson,
  action,
  Hijri,
} = require("./src/lib");
// import azkarData from json Data
let azkarData = require("./db/azkar.json");
// Filter the morning Azkar
let mAzkar = Array.from(azkarData.filter((e) => e.category === "أذكار الصباح"));
// Filter the evening Azkar
let nAzkar = Array.from(azkarData.filter((e) => e.category === "أذكار المساء"));
// create or import user data
const db = new ranidb("./db/users.json", { idType: "empty" });
// config .env file
require("dotenv").config();
// make new bot
const bot = new Telegraf(process.env.BOT_TOKEN || getApi());
// make some vars
let sendActive = false;
let owner = ["FLOSSit", "x0x3b"];
// add own bot to action function
action = action.bind({ bot });
//add isAdmin in ctx for messges
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
// when one send /start to bot
bot.start((ctx) => {
  admins(ctx, (e) => addUsers(db, ctx, bot));
});
// when some one need know about from bot
bot.command("about", (ctx) => {
  replayId(ctx , 
    "نبذه قصيرة عن بوت مذكر \n " +
    " هو بوت مجاني ومفتوح المصدر من تطوير @salemkode يعمل على إرسال الأذكار بشكل دوري حسب تفضيلات المستخدمين \n" +
    ` للمزيد من المعلومات واكتشاف المميزات الأخرى يرجع الاطلاع علي <a href="${about}">مقالة تعريفية عن بوت مذكر</a>`
    )
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
bot.command("new", (ctx) => {
  let mas = getRandomItem(azkarData);

  replayId(ctx, makeMessage(mas));
});
//get hdate
bot.command("date", (ctx) => {
  ctx.reply(Hijri());
});
//get version
bot.command("version", (ctx) => {
  ctx.reply(require("./package.json").version);
});
//start orderly azkar
bot.command("zkr", (ctx) => {
  ctx.reply(
    "اذكار الصباح و المساء بشكل مرتب للمحادثات",
    Keyboard.inline([
      Key.callback("اذكار المساء", "N-zkr-0"),
      Key.callback("اذكار الصباح", "D-zkr-0"),
    ])
  );
});
bot.command("quran" , ctx=>{
  let mes = ctx.message.text.split(" ");
  console.log(mes)
  let index = mes[1];
  if(mes.length === 1){
    ctx.reply(
      "قراة القران الكريم من خلال بوت مذكر",
      Keyboard.inline([
        Key.callback("ابدأ الان", "quran-1"),
      ])
    );
  } else if(parseInt(index) !== NaN){
    if(!(index <= 604)){
      ctx.reply("عدد صفحات القران 604")
    }else if (!(index >= 1)) {
      ctx.reply("لايوجد صفحة قبل 1")
    }else {
      quran(ctx.chat.id , index)
    }
  }
})
//set number of messages per day for chat
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

bot.command("toggleReminderBook", (ctx) => {
  const user = db.find({ id: ctx.chat.id })
  user.put({ toggleReminderBook: !user.toggleReminderBook });
  const activeMessage = (!user.toggleReminderBook ? "تم تفعيل" : "تم ايقاف");
  ctx.reply(`${activeMessage} تذكير اذكار الصباح والمساء`);
})
//get admin bot or owner setting
bot.command("setting", (ctx) => {
  if (!(ctx.chat.id === developerID || owner.indexOf(ctx.chat.username) !== -1))
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
//send message to all users
bot.action("send", async (ctx) => {
  let chat = await action(ctx, "");
  sendMessage(chat , "ارسل رسالتك الان " , Markup.forceReply())
  sendActive = true;
});
//user Summary Length
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
//update bot  (if used pm2)
bot.action("update", async (ctx) => {
  if (!ctx.chat.id === developerID) return;
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
//restart bot (if used pm2)
bot.action("restart", async (ctx) => {
  if (!ctx.chat.id === developerID) return;
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
//check if bot added in new groub
bot.on("new_chat_members", (ctx) => {
  if (ctx.message.new_chat_members[0].username !== bot.botInfo.username) return;
  addUsers(db, ctx, bot);
});
/* orderly azkar */
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
for (let i = 1; i !== 605; i++) {
  bot.action("quran-" + i , async ctx=>{
    let chat = await action(ctx , "");
    quran(chat , i)
  })
}
function quran(chat , i){
  let index = ("000").substring(0, 3 - (i +"").length) + i;
  let next = i === 604 ? 1 : (i - 1);
  let prev = i === 1 ? 604 : (i + 1);
  let button = [
    Key.text(i),
    Key.callback("الصفحة التالية◀️ ", "quran" + "-" + prev),
    Key.callback("▶️الصفحة السابقة", "quran" + "-" + next)
  ];
  bot.telegram.sendPhoto(chat , "https://mp3quran.net/api/quran_pages_arabic/" + index + ".png" , Keyboard.inline(button ,
   {
    pattern:[1,2]
    } )
    )
}
//mode message callback
bot.action(["message-1", "message-2", "message-3"], (ctx) => {
  let name = ctx.update.callback_query.data;
  let set = (e) => db.find({ id: ctx.chat.id }).put({ mode: e });
  let mode = parseInt(name[name.length - 1]);
  set(mode);
  action(ctx, `تم تغير عدد الرسائل الى ${mode * 2}`);
});
//get users.json
bot.action("user", (ctx) =>
  action(ctx, false, {}, { source: "./db/users.json" })
);
// 2- confirmation send message for all user
bot.action(["send-P","send-G","send-all"], (ctx) => {
  let name = ctx.update.callback_query.data;
  let indexs = ["send-P","send-G","send-all"];
  let index = indexs.indexOf(name)
  let type = index ===  0 ? "private" : index ===  1 ? "group" : "all";
  action(ctx, false);
  sendType(bot, type , ctx.update.callback_query.message.text);
});
//fix user.json and add mode and type for chat
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
  // 1- confirmation send message for all user
  let reply = ctx.message.reply_to_message;
  if (
    reply &&
    reply.from.id === bot.botInfo.id &&
    reply.text === "ارسل رسالتك الان" &&
    sendActive
  ) {
    let keybord = Keyboard.inline(
      [
        Key.callback("المحاداثات الخاصه", "send-P"),
        Key.callback("المجموعات", "send-G"),
        Key.callback("الكل", "send-all"),
      ]
      );
    adminSend(ctx.message.text, keybord);
    sendActive = false;
  }
});

/* confirmation launch bot */
process.once("SIGINT", () => stop("SIGINT"));
process.once("SIGTERM", () => stop("SIGTERM"));
process.on("uncaughtException", (err) => {
  adminSend("error \n" + JSON.stringify(err));
  console.error(err);
});
bot.launch().then(() => start());

/* cron timer */
const options = {
  scheduled: true,
  timezone: "Asia/Kuwait",
};

// send morning and evening azkar reminder
cron.schedule(
  "* 6,18 * * *",
  () => {
    const ranidb = require("ranidb");
    const users = new ranidb("./db/users.json").getAll();
    Array.from(users).forEach((user) => {
      if (user.azkarSunAndMon) {
        bot.telegram.sendMessage(user.id,
          "اذكار الصباح و المساء بشكل مرتب للمحادثات",
          Keyboard.inline([
            Key.callback("اذكار المساء", "N-zkr-0"),
            Key.callback("اذكار الصباح", "D-zkr-0"),
          ])
        );
      }
    });
  },
  options
);

// mode 1 (2 Message in day)
cron.schedule(
  "0 */4 * * *",
  () => {
    sendAzkar(bot, 3);
  },
  options
);
// mode 2 (4 Message in day)
cron.schedule(
  "0 */6 * * *",
  () => {
    sendAzkar(bot, 2);
  },
  options
);
//mode 3 (6 Message in day)
cron.schedule(
  "0 */12 * * *",
  () => {
    sendAzkar(bot, 1);
  },
  options
);
//Friday message
cron.schedule(
  "0 9 * * 5",
  () => send(bot, 0, getRandomItem(require("./db/friDay.json")).zekr),
  options
);
/* functions */
//send Message to admin with is
function adminSend(...msg) {
  sendMessage(developerID, ...msg);
}
//send Message short function
function sendMessage(chatId, text, extra = {}) {
  bot.telegram.sendMessage(chatId, text, extra).then();
}
//get api key for bot
function getApi() {
  const prompt = require("prompt-sync")();
  const fs = require("fs");
  const api = prompt("What is your api bot? => ");
  const content = "BOT_TOKEN=" + api;
  fs.writeFile(".env", content, () => {});
  return api;
}
//start bot function
async function start() {
  adminSend("اشتغل بوت" + "\n @" + bot.botInfo.username);
  console.log(`bot is start @${bot.botInfo.username}`);
}
//stop bot function
function stop(stop) {
  if (stop) bot.stop(stop);

  adminSend("تقفل بوت" + "\n @" + bot.botInfo.username);
}
//admin in groub or privet chat
function admins(ctx, callBack = (e) => {}) {
  if (ctx.from.isAdmin || ctx.chat.id === ctx.from.id || ctx.from.username == "GroupAnonymousBot") {
    callBack();
    return true;
  } else {
    ctx.reply("هذا امر مخصص للمشرفين");
    return false;
  }
}
