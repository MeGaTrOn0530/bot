const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const TOKEN = process.env.TOKEN;

const bot = new TelegramBot(TOKEN, { polling: true });

let users = {}; // Foydalanuvchilar ma'lumotlarini saqlash uchun obyekt

bot.setMyCommands([
  {
    command: '/start',
    description: "Bot haqida ma'lumot",
  },
  {
    command: '/info',
    description: "O'zingiz haqingizda ma'lumot",
  },
]);

bot.on('message', async msg => {
  const text = msg.text;
  const chatId = msg.chat.id;

  if (text === '/info') {
    return bot.sendMessage(
      chatId,
      `Bu bot Samarqand Iqtisodiyot va Servis Institutining Raqamli Ta'lim Texnalogiyalari Markazi tamonidan ishlab chiqilgan bo'lib asosiy vazifasi masofadan turib institut xududidagi wi-fi tarmoqlaridan foydalanish uchun login parol olish va olingan login parolni tiklash uchun xizmat qiladi.

      Siz botni ishga tushirib kerakli ma'lumotlarni tanlashingiz va shaxsingizni tasdiqlash uchun pasport rasmini yuklashingiz kerak. Institut ishchi xodimlar tamonidan 24 soat ichida sizga login parol beriladi, login parolni institut xududidagi wi-fi tarmog'iga ulanishingiz va internet browser https://172.17.0.22:4080 terishingiz kerak chiqqan oynaga esa sizga taqdim etilgan login parolni joylashtirsangiz internetingiz ishlashni boshlaydi.`
    );
  }
});

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    'Assalomu alaykum! Botimizga xush kelibsiz. Telefon raqamingizni yuboring.',
    {
      reply_markup: {
        keyboard: [
          [
            {
              text: '📞 Telefon raqamni yuborish',
              request_contact: true,
            },
          ],
        ],
        resize_keyboard: true,
      },
    }
  );
});

bot.on('contact', (msg) => {
  const chatId = msg.chat.id;
  const userFullName = msg.from.first_name + ' ' + msg.from.last_name;
  const phoneNumber = msg.contact.phone_number;

  users[chatId] = {
    fullName: userFullName,
    phoneNumber: phoneNumber,
    state: 'phone',
  };

  bot.sendMessage(
    chatId,
    `Assalomu alaykum, ${userFullName}!\nSizning telefon raqamingiz: ${phoneNumber}\nLogin va parol olish yoki tiklash uchun quyidagi tugmalardan birini tanlang:`,
    {
      reply_markup: {
        keyboard: [
          [
            {
              text: '🔐 Login va parolni tiklash',
            },
            {
              text: '📝 Login va parol olish',
            },
          ],
          [
            {
              text: '❌ Bekor qilish',
            },
          ],
        ],
        resize_keyboard: true,
      },
    }
  );
});

bot.onText(/📞 Telefon raqamni yuborish/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    'Raqamingizni yuboring:',
    {
      reply_markup: {
        keyboard: [
          [
            {
              text: '❌ Bekor qilish',
            },
          ],
        ],
        resize_keyboard: true,
      },
    }
  );
});

bot.onText(/❌ Bekor qilish/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(
    chatId,
    'Amal bekor qilindi. Raqamni yuborishni qaytadan boshlang:',
    {
      reply_markup: {
        keyboard: [
          [
            {
              text: '📞 Telefon raqamni yuborish',
              request_contact: true,
            },
          ],
        ],
        resize_keyboard: true,
      },
    }
  );
});

bot.onText(/📝 Login va parol olish/, (msg) => {
  const chatId = msg.chat.id;

  if (users[chatId]?.state === 'phone') {
    users[chatId].state = 'loginPassword';
    bot.sendMessage(
      chatId,
      'Sizining mavqeyingizdagi qaysi tugmaga tog\'ri keladi',
      {
        reply_markup: {
          keyboard: [
            ['Xodim', 'Talaba', 'O\'qituvchi'],
            [
              {
                text: '❌ Bekor qilish',
              },
            ],
          ],
          resize_keyboard: true,
        },
      }
    );
  }
});

// "Xodim", "Talaba" yoki "O\'qituvchi" tanlanda javob berish
bot.onText(/Xodim/, (msg) => {
  const chatId = msg.chat.id;
  const userRole = msg.text.toLowerCase();

  bot.sendMessage(
    chatId,
    `Iltimos, ism va familyangizni kiriting (masalan: Azizbek Avalov):`,
    {
      reply_markup: {
        remove_keyboard: true,
      },
    }
  );

  bot.once('message', (msg) => {
    const userFullName = msg.text;
    bot.sendMessage(
      chatId,
      `Iltimos, Lavozimingiz kiriting (masalan: Muxandis dasturchi):`,
      {
        reply_markup: {
          remove_keyboard: true,
        },
      }
    );

    bot.once('message', (msg) => {
      const userGroup = msg.text;
      bot.sendMessage(
        chatId,
        `Pasport rasmingizni tashlang`,
        {
          reply_markup: {
            remove_keyboard: true,
          },
        }
      );

      bot.once('message', (msg) => {
        if (msg.text) {
          // Fayl matn shaklida bo'lsa
          bot.sendMessage(chatId, `Rasm korinishda yuboring, iltimos.`);
        } else if (msg.photo) {
          // Fayl photo formatda bo'lsa
          bot.sendMessage(
            chatId,
            `Sizga login va parol tez orada yuboriladi`,
            {
              reply_markup: {
                remove_keyboard: true,
              },
            }
          );
        }
      });
    });
  });
});

bot.onText(/O\'qituvchi/, (msg) => {
  const chatId = msg.chat.id;
  const userRole = msg.text.toLowerCase();

  bot.sendMessage(
    chatId,
    `Iltimos, ism va familyangizni kiriting (masalan: Azizbek Avalov):`,
    {
      reply_markup: {
        remove_keyboard: true,
      },
    }
  );

  bot.once('message', (msg) => {
    const userFullName = msg.text;
    bot.sendMessage(
      chatId,
      `Iltimos, Faningizni kiriting (masalan: Informatika):`,
      {
        reply_markup: {
          remove_keyboard: true,
        },
      }
    );

    bot.once('message', (msg) => {
      const userGroup = msg.text;
      bot.sendMessage(
        chatId,
        `Pasport rasmingizni tashlang`,
        {
          reply_markup: {
            remove_keyboard: true,
          },
        }
      );

      bot.once('message', (msg) => {
        if (msg.photo) {
          // Fayl photo formatda bo'lsa
          bot.sendMessage(
            chatId,
            `Sizga login va parol tez orada yuboriladi`,
            {
              reply_markup: {
                remove_keyboard: true,
              },
            }
          );
        } else if (msg.text) {
          // Fayl matn shaklida bo'lsa
          bot.sendMessage(chatId, `Rasm korinishda yuboring, iltimos.`);
        }
      });
    });
  });
});

bot.onText(/Talaba/, (msg) => {
  const chatId = msg.chat.id;
  const userRole = msg.text.toLowerCase();

  bot.sendMessage(
    chatId,
    `Iltimos, ism va familyangizni kiriting (masalan: Azizbek Avalov):`,
    {
      reply_markup: {
        remove_keyboard: true,
      },
    }
  );

  bot.once('message', (msg) => {
    const userFullName = msg.text;
    bot.sendMessage(
      chatId,
      `Iltimos, Guruhingizni kiriting (masalan: 103-BH):`,
      {
        reply_markup: {
          remove_keyboard: true,
        },
      }
    );

    bot.once('message', (msg) => {
      const userGroup = msg.text;
      bot.sendMessage(
        chatId,
        `Pasport rasmingizni tashlang`,
        {
          reply_markup: {
            remove_keyboard: true,
          },
        }
      );

      bot.once('message', (msg) => {
        if (msg.photo) {
          // Fayl photo formatda bo'lsa
          bot.sendMessage(
            chatId,
            `Sizga login va parol tez orada yuboriladi`,
            {
              reply_markup: {
                remove_keyboard: true,
              },
            }
          );
        } else if (msg.text) {
          // Fayl matn shaklida bo'lsa
          bot.sendMessage(chatId, `Rasm korinishda yuboring, iltimos.`);
        }
      });
    });
  });
});

bot.onText(/🔐 Login va parolni tiklash/, (msg) => {
  const chatId = msg.chat.id;

  if (users[chatId]?.state === 'phone') {
    users[chatId].state = 'loginPassword';
    bot.sendMessage(
      chatId,
      'Iltimos, ism va familyangizni kiriting (masalan: Azizbek Avalov):',
      {
        reply_markup: {
          resize_keyboard: true,
          remove_keyboard: true,
        },
      }
    );
    bot.once('message', (msg) => {
      const userGroup = msg.text;
      bot.sendMessage(
        chatId,
        `Tez orada login parol tiklab sizga habar yuboriladi`,
        {
          reply_markup: {
            remove_keyboard: true,
            resize_keyboard: true,
          },
        }
      );
    });
  }
});

bot.onText(/./, (msg) => {
  const chatId = msg.chat.id;

  if (users[chatId]?.state === 'loginPassword') {
    users[chatId].state = 'done';
    const userState = users[chatId].state;
  }
});
