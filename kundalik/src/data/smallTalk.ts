export type SmallTalkTopic = {
  nomi: string;
  kalitlar: string[];
  javoblar: string[];
};

// Bu javoblar internet talab qilmaydi; {ism} o'quvchi ismi bilan almashtiriladi.
export const smallTalk: SmallTalkTopic[] = [
  { nomi: "Salomlashish", kalitlar: ["salom", "assalomu alaykum", "hayrli tong", "xayrli tong", "hayrli kun", "xayrli kun", "hayrli kech", "xayrli kech"], javoblar: ["Salom, {ism}! Bugun nimani o'rganamiz?", "Assalomu alaykum, {ism}! Men tayyorman, sen-chi?", "Xayrli kun, {ism}! Birga ajoyib natija qilamiz!"] },
  { nomi: "Hol-ahvol", kalitlar: ["qalaysan", "ishlar qalay", "nima gap", "yaxshimisan", "ahvoling qalay"], javoblar: ["Yaxshi, rahmat, {ism}! Senga qanday yordam beray?", "A'lo! Yangi bilimlar uchun tayyorman. O'zing qalaysan?", "Hammasi joyida, {ism}. Bugun kichik bir g'alaba qilamizmi?"] },
  { nomi: "Kimligi", kalitlar: ["sen kimsan", "isming nima", "seni kim yaratdi", "nima qila olasan", "o'zing haqingda ayt"], javoblar: ["Men Mittichaman — darslarda hamrohing. Test, mavzu, vazifa va tarjimada yordam beraman.", "Mening ismim Mitticha! Men shu ilovadagi offline o'quv yordamchingman.", "Men internetga ulanmayman; savollar banki va lug'at bilan ishlaydigan Mittichaman."] },
  { nomi: "Minnatdorchilik", kalitlar: ["rahmat", "tashakkur", "katta rahmat", "raxmat", "minnatdorman"], javoblar: ["Arzimaydi, {ism}! Yana kerak bo'lsam shu yerdaman.", "Marhamat! Sen uddalading, men faqat yo'l ko'rsatdim.", "Doim yordam beraman, {ism}. Omad!"] },
  { nomi: "Xayrlashish", kalitlar: ["xayr", "ko'rishguncha", "hozircha", "yaxshi qol", "keyin ko'rishamiz"], javoblar: ["Xayr, {ism}! Yana ko'rishguncha!", "Hozircha! Daftarlaring seni kutyapti 😊", "Yaxshi qol, {ism}. Keyingi safar yana bilim yig'amiz!"] },
  { nomi: "Motivatsiya", kalitlar: ["charchadim", "zerikdim", "o'qigim kelmayapti", "qiyin ekan", "uddalay olmayman", "ko'nglim yo'q"], javoblar: ["Charchash tabiiy, {ism}. 5 daqiqa tanaffus qil, suv ich, keyin bitta kichik qadamdan boshlaymiz.", "Qiyin tuyulsa, vazifani mayda qismlarga bo'lamiz. Birinchi qadamni birga topamiz!", "Hozir hammasini birdan qilish shart emas. 10 daqiqa diqqat bilan ishlash ham yaxshi boshlanish.", "Zerikdingmi? Keling, buni kichik test yoki qiziqarli misolga aylantiramiz!"] },
  { nomi: "Maqtov", kalitlar: ["zo'rsan", "ofarin", "yaxshi", "rahmat mitticha", "aqllisan"], javoblar: ["Rahmat, {ism}! Sen ham zo'rsan — harakat qilayotganingning o'zi yutuq.", "Ofarin senga! Birga ishlasak, qiyin mavzu ham kichrayib qoladi.", "Rahmat 😊 Endi bilimlaringni yana bir pog'ona oshiramizmi?"] },
  { nomi: "Jadval", kalitlar: ["bugun qanday darslar bor", "bugun nima bor", "ertaga nima bor", "ertangi darslar", "keyingi dars qaysi", "bugungi jadval"], javoblar: ["Jadvalni ko'ryapman...", "Hozir darslaringni tekshiraman...", "Taqvimga qarab aniq aytaman..."] },
  { nomi: "Vaqt va sana", kalitlar: ["soat nechchi", "soat nechi", "bugun nechanchi sana", "bugun sana", "haftaning qaysi kuni", "bugun qaysi kun"], javoblar: ["Hozir soat {soat}, {sana}.", "Bugun {kun}, {sana}. Hozirgi vaqt {soat}.", "Taqvimga qarasam, bugun {kun}, {sana}; soat esa {soat}."] },
  { nomi: "Hazil", kalitlar: ["hazil ayt", "qiziq gap ayt", "kuldir", "hazil qil", "qiziqarli fakt"], javoblar: [
    "Matematika kitobi nega xafa? Chunki unda juda ko'p muammo bor ekan!",
    "Nega kompyuter sovqotibdi? Oynalari ochiq qolibdi!",
    "Daftar qalamga dedi: «Meni chiziqdan chiqarma!»",
    "Nega geometriya darsi burchakda turibdi? Chunki u burchaklarni o'rganyapti!",
    "Fiziklar nega zinadan tushishda ehtiyot bo'lishadi? Potensial energiya kamayadi!",
    "Kitobning eng sevimli joyi qayer? Muqovasi — hamma uni o'sha yerdan taniydi!",
    "Nega soat maktabga kechikmaydi? Chunki u vaqtni biladi!",
    "Qalamning eng yaxshi do'sti kim? O'chirg'ich — xatolarni kechiradi!",
    "Nega uchburchak hech qachon yolg'iz qolmaydi? Uning uchta tomoni bor!",
    "Biologiya kitobi nega yashil? Ichida juda ko'p bargli mavzular bor!",
    "Informatika o'quvchisi parolni unutibdi. Kompyuter: «Tanish emasmiz», debdi!",
    "Nega algebra xotirjam? Chunki x ni baribir topishadi!",
    "Darsdan keyin quyosh nima dedi? «Bugun ham yorqin fikrlar bo'ldi!»",
    "Qaysi fan doim sayohatda? Geografiya — xaritalarni kezadi!",
    "Nega kitoblar sport zaliga borishibdi? Muqovalarini chiniqtirish uchun!",
    "Telefon matematikadan nimani so'rabdi? «Meni hisobga qo'shasanmi?»",
    "Nega tarix daftarida ko'p sana bor? U o'tmishni eslab yuradi!",
    "Astronomiya o'quvchisi nega xursand? Uning orzulari yulduzlarga yetadi!",
    "O'qituvchi: «Kim javob beradi?» Sinf: «Savolni avval eshittiring!»",
    "Qiziq fakt: sakkizoyoqning uchta yuragi bor. Demak, imtihonda hammasi birga hayajonlanadi!",
  ] },
  { nomi: "Yordam", kalitlar: ["yordam ber", "menga yordam kerak", "qanday yordam", "nimalarda yordamlashasan", "yordam"], javoblar: ["Quyidagi tugmalardan birini tanla: test tuzaman, mavzuni tushuntiraman, kunlik vazifa beraman yoki xatolarni qaytaramiz.", "Men Algebra testlari, mavzu tushuntirishlari, uy vazifalari, jadval va tarjimada yordam bera olaman. Tugmani tanla!"] },
];
