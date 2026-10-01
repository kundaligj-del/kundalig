export type TranslatorLanguage = "uz" | "en" | "ru";
export type DictionaryCategory =
  | "English" | "Russian" | "Physics" | "Chemistry" | "Biology"
  | "Informatics" | "Algebra" | "Geometry" | "History";

export type DictionaryEntry = {
  uz: string;
  en: string;
  ru: string;
  fan: DictionaryCategory;
  misol: string;
};

type Term = [uz: string, en: string, ru: string, example: string];

const terms: Record<DictionaryCategory, Term[]> = {
  English: [
    ["olma", "apple", "яблоко", "Olma foydali meva."],
    ["ot", "noun", "имя существительное", "Kitob — ot."],
    ["fe'l", "verb", "глагол", "O'quvchi matnni o'qiydi: o'qiydi — fe'l."],
    ["sifat", "adjective", "имя прилагательное", "Yashil bargdagi yashil — sifat."],
    ["ravish", "adverb", "наречие", "U tez yugurdi: tez — ravish."],
    ["olmosh", "pronoun", "местоимение", "Men — birinchi shaxs olmoshi."],
    ["predlog", "preposition", "предлог", "Ingliz tilida in joyni bildiradi."],
    ["bog'lovchi", "conjunction", "союз", "And ikki so'zni bog'laydi."],
    ["artikl", "article", "артикль", "A book bir dona kitobni anglatadi."],
    ["zamon", "tense", "время глагола", "Yesterday o'tgan zamonni ko'rsatadi."],
    ["hozirgi zamon", "present tense", "настоящее время", "I study — hozirgi zamon."],
    ["o'tgan zamon", "past tense", "прошедшее время", "She played — o'tgan zamon."],
    ["kelasi zamon", "future tense", "будущее время", "We will learn — kelasi zamon."],
    ["ko'plik", "plural", "множественное число", "Books so'zi ko'plikda."],
    ["birlik", "singular", "единственное число", "A pencil birlikdagi ot."],
    ["gap", "sentence", "предложение", "A sentence tugallangan fikr bildiradi."],
    ["savol", "question", "вопрос", "Where are you? — savol gap."],
    ["tarjima", "translation", "перевод", "Word tarjimasi — so'z ma'nosi."],
    ["talaffuz", "pronunciation", "произношение", "Talaffuzni tinglab mashq qil."],
    ["lug'at", "vocabulary", "словарный запас", "Har kuni yangi lug'at so'zini o'rgan."],
    ["ma'no", "meaning", "значение", "Bright so'zining ma'nosi — yorqin."],
  ],
  Russian: [
    ["grammatik jins", "grammatical gender", "род", "Стол — существительное мужского рода."],
    ["kelishik", "case", "падеж", "В предложении слово может менять падеж."],
    ["turlanish", "declension", "склонение", "Склонение показывает изменение существительного."],
    ["tuslanish", "conjugation", "спряжение", "Глагол читать относится к первому спряжению."],
    ["ot", "noun", "имя существительное", "Ученик — имя существительное."],
    ["sifat", "adjective", "имя прилагательное", "Умный — имя прилагательное."],
    ["fe'l", "verb", "глагол", "Писать — глагол."],
    ["olmosh", "pronoun", "местоимение", "Я — личное местоимение."],
    ["ravish", "adverb", "наречие", "Слово быстро — наречие."],
    ["ko'makchi", "preposition", "предлог", "Предлог в стоит перед словом."],
    ["bog'lovchi", "conjunction", "союз", "Союз и соединяет однородные члены."],
    ["ega", "subject", "подлежащее", "В предложении Ученик читает ученик — подлежащее."],
    ["kesim", "predicate", "сказуемое", "Читает — сказуемое."],
    ["gap", "sentence", "предложение", "Предложение выражает законченную мысль."],
    ["ega va kesim", "subject and predicate", "подлежащее и сказуемое", "Грамматическая основа включает главные члены."],
    ["hozirgi zamon", "present tense", "настоящее время", "Я читаю — настоящее время."],
    ["o'tgan zamon", "past tense", "прошедшее время", "Он прочитал — прошедшее время."],
    ["kelasi zamon", "future tense", "будущее время", "Мы будем учиться — будущее время."],
    ["ma'nodosh so'z", "synonym", "синоним", "Смелый и храбрый — синонимы."],
    ["zid ma'noli so'z", "antonym", "антоним", "Высокий и низкий — антонимы."],
  ],
  Physics: [
    ["kuch", "force", "сила", "Kuch jism harakatini o'zgartirishi mumkin."],
    ["tezlik", "speed", "скорость", "Tezlik masofaning vaqtga nisbatidir."],
    ["tezlanish", "acceleration", "ускорение", "Tezlanish tezlikning o'zgarishini ifodalaydi."],
    ["massa", "mass", "масса", "Jism massasi tarozi bilan o'lchanadi."],
    ["og'irlik", "weight", "вес", "Og'irlik gravitatsiya ta'siridagi kuchdir."],
    ["energiya", "energy", "энергия", "Energiya ish bajarish qobiliyatidir."],
    ["ish", "work", "работа", "Kuch siljish hosil qilsa, mexanik ish bajariladi."],
    ["quvvat", "power", "мощность", "Quvvat vaqt birligidagi ishga teng."],
    ["bosim", "pressure", "давление", "Bosim kuchning yuzaga nisbatidir."],
    ["zichlik", "density", "плотность", "Zichlik massa va hajm nisbatidir."],
    ["harorat", "temperature", "температура", "Haroratni termometr o'lchaydi."],
    ["issiqlik", "heat", "теплота", "Issiqlik issiq jismdan sovuq jismga o'tadi."],
    ["to'lqin", "wave", "волна", "Tovush to'lqin orqali tarqaladi."],
    ["chastota", "frequency", "частота", "Chastota bir sekunddagi tebranishlar soni."],
    ["amplituda", "amplitude", "амплитуда", "Amplituda muvozanatdan eng katta og'ishdir."],
    ["elektr toki", "electric current", "электрический ток", "Elektr toki zaryadlarning tartibli harakatidir."],
    ["kuchlanish", "voltage", "напряжение", "Kuchlanish voltlarda o'lchanadi."],
    ["qarshilik", "resistance", "сопротивление", "Elektr qarshilik tokka to'sqinlik qiladi."],
    ["magnit maydon", "magnetic field", "магнитное поле", "Magnit maydon temir jismlarga ta'sir qiladi."],
    ["yorug'lik", "light", "свет", "Yorug'lik vakuumda ham tarqala oladi."],
  ],
  Chemistry: [
    ["atom", "atom", "атом", "Atom moddaning kimyoviy xossalarini saqlaydi."],
    ["molekula", "molecule", "молекула", "Suv molekulasi ikki vodorod atomidan tuzilgan."],
    ["element", "element", "элемент", "Kislorod kimyoviy element hisoblanadi."],
    ["birikma", "compound", "соединение", "Suv vodorod va kislorod birikmasidir."],
    ["aralashma", "mixture", "смесь", "Havo turli gazlar aralashmasidir."],
    ["reaksiya", "reaction", "реакция", "Kimyoviy reaksiya yangi moddalar hosil qiladi."],
    ["reaktant", "reactant", "реагент", "Reaktantlar reaksiya boshida qatnashadi."],
    ["mahsulot", "product", "продукт реакции", "Mahsulot reaksiya natijasida hosil bo'ladi."],
    ["kimyoviy bog'", "chemical bond", "химическая связь", "Kimyoviy bog' atomlarni birlashtiradi."],
    ["valentlik", "valency", "валентность", "Valentlik atomning bog' hosil qilish qobiliyatidir."],
    ["massa", "mass", "масса", "Reaksiyada umumiy massa saqlanadi."],
    ["hajm", "volume", "объём", "Suyuqlik hajmi menzurkada o'lchanadi."],
    ["eritma", "solution", "раствор", "Tuzli suv bir jinsli eritmadir."],
    ["erituvchi", "solvent", "растворитель", "Suv ko'p moddalar uchun erituvchi bo'ladi."],
    ["erigan modda", "solute", "растворённое вещество", "Shakar suvda erigan modda bo'ladi."],
    ["kislota", "acid", "кислота", "Kislota indikator rangini o'zgartiradi."],
    ["asos", "base", "основание", "Asoslar kislotalar bilan reaksiyaga kirishadi."],
    ["pH", "pH", "pH", "pH qiymati eritmaning muhitini ko'rsatadi."],
    ["oksidlanish", "oxidation", "окисление", "Temirning zanglashi oksidlanishdir."],
    ["davriy jadval", "periodic table", "периодическая таблица", "Davriy jadval elementlarni tartiblaydi."],
  ],
  Biology: [
    ["hujayra", "cell", "клетка", "Hujayra tirik organizmning asosiy birligidir."],
    ["to'qima", "tissue", "ткань", "Bir xil hujayralar to'qima hosil qiladi."],
    ["a'zo", "organ", "орган", "Yurak qon aylanish a'zosidir."],
    ["organizm", "organism", "организм", "O'simlik tirik organizmdir."],
    ["o'simlik", "plant", "растение", "O'simlik fotosintez qiladi."],
    ["hayvon", "animal", "животное", "Hayvonlar oziqni tayyor holda oladi."],
    ["fotosintez", "photosynthesis", "фотосинтез", "Fotosintezda o'simlik yorug'likdan foydalanadi."],
    ["nafas olish", "respiration", "дыхание", "Hujayra nafas olishi energiya ajratadi."],
    ["irsiyat", "heredity", "наследственность", "Irsiyat belgilarni avlodga o'tkazadi."],
    ["gen", "gene", "ген", "Gen irsiy axborotning bir qismidir."],
    ["DNK", "DNA", "ДНК", "DNK irsiy axborotni saqlaydi."],
    ["evolyutsiya", "evolution", "эволюция", "Evolyutsiya populyatsiyalarning vaqt davomida o'zgarishidir."],
    ["ekotizim", "ecosystem", "экосистема", "Ko'l tirik va notirik qismlardan iborat ekotizim."],
    ["yashash muhiti", "habitat", "среда обитания", "O'rmon ko'plab turlar yashash muhitidir."],
    ["populyatsiya", "population", "популяция", "Bir hududdagi bir tur vakillari populyatsiya deyiladi."],
    ["tur", "species", "вид", "Bir tur vakillari o'xshash xususiyatlarga ega."],
    ["oziq zanjiri", "food chain", "пищевая цепь", "Oziq zanjiri energiya uzatilishini ko'rsatadi."],
    ["bakteriya", "bacterium", "бактерия", "Bakteriya bir hujayrali mikroorganizmdir."],
    ["zamburug'", "fungus", "гриб", "Zamburug'lar organik moddalarni parchalaydi."],
    ["umurtqali", "vertebrate", "позвоночное", "Baliq umurtqali hayvon hisoblanadi."],
  ],
  Informatics: [
    ["algoritm", "algorithm", "алгоритм", "Algoritm masalani yechish qadamlarini belgilaydi."],
    ["dastur", "program", "программа", "Dastur kompyuter bajaradigan buyruqlardan tuziladi."],
    ["ma'lumot", "data", "данные", "Raqamli ma'lumot faylda saqlanadi."],
    ["o'zgaruvchi", "variable", "переменная", "O'zgaruvchi qiymatni vaqtincha saqlaydi."],
    ["funksiya", "function", "функция", "Funksiya takror ishlatiladigan kod bo'lagidir."],
    ["sikl", "loop", "цикл", "Sikl buyruqlarni takror bajaradi."],
    ["shart", "condition", "условие", "Shart bajarilsa, dastur boshqa yo'lni tanlaydi."],
    ["tarmoq", "network", "сеть", "Kompyuter tarmog'i qurilmalarni bog'laydi."],
    ["internet", "Internet", "интернет", "Internet global axborot tarmog'idir."],
    ["brauzer", "browser", "браузер", "Brauzer veb-sahifalarni ochadi."],
    ["fayl", "file", "файл", "Hujjat fayl ko'rinishida saqlanishi mumkin."],
    ["papka", "folder", "папка", "Papka fayllarni tartibga soladi."],
    ["ma'lumotlar bazasi", "database", "база данных", "Ma'lumotlar bazasi axborotni tuzilmali saqlaydi."],
    ["parol", "password", "пароль", "Kuchli parol hisobni himoya qiladi."],
    ["shifrlash", "encryption", "шифрование", "Shifrlash ma'lumotni begonalardan yashiradi."],
    ["sun'iy intellekt", "artificial intelligence", "искусственный интеллект", "Sun'iy intellekt ma'lumotdan naqshlarni o'rganadi."],
    ["bit", "bit", "бит", "Bit kompyuterdagi eng kichik axborot birligi."],
    ["bayt", "byte", "байт", "Bir bayt odatda sakkiz bitdan iborat."],
    ["operatsion tizim", "operating system", "операционная система", "Operatsion tizim kompyuter resurslarini boshqaradi."],
    ["xato", "bug", "ошибка", "Dasturdagi xato noto'g'ri natija berishi mumkin."],
  ],
  Algebra: [
    ["o'zgaruvchi", "variable", "переменная", "x + 2 ifodada x — o'zgaruvchi."],
    ["ifoda", "expression", "выражение", "3x + 5 algebraik ifodadir."],
    ["tenglama", "equation", "уравнение", "x + 4 = 9 — tenglama."],
    ["ildiz", "root", "корень уравнения", "x = 5 tenglamaning ildizi."],
    ["koeffitsiyent", "coefficient", "коэффициент", "7x ifodada 7 — koeffitsiyent."],
    ["daraja", "exponent", "степень", "x ning kvadrati x² deb yoziladi."],
    ["ko'phad", "polynomial", "многочлен", "x² + 2x + 1 — ko'phad."],
    ["had", "term", "член", "5x + 3 ifodaning hadlari 5x va 3."],
    ["funksiya", "function", "функция", "Funksiya har bir x ga y qiymatni mos qo'yadi."],
    ["grafik", "graph", "график", "Funksiya grafigi koordinata tekisligida chiziladi."],
    ["tengsizlik", "inequality", "неравенство", "x > 2 — tengsizlik."],
    ["kasr", "fraction", "дробь", "1/2 oddiy kasrdir."],
    ["nisbat", "ratio", "отношение", "2:3 ikki miqdor nisbatini bildiradi."],
    ["proporsiya", "proportion", "пропорция", "Ikki nisbat teng bo'lsa, proporsiya hosil bo'ladi."],
    ["modul", "absolute value", "модуль", "|−4| ning qiymati 4."],
    ["ketma-ketlik", "sequence", "последовательность", "2, 4, 6 sonlari ketma-ketlik hosil qiladi."],
    ["arifmetik progressiya", "arithmetic progression", "арифметическая прогрессия", "Arifmetik progressiyada ayirma o'zgarmas."],
    ["geometrik progressiya", "geometric progression", "геометрическая прогрессия", "Geometrik progressiyada maxraj o'zgarmas."],
    ["diskriminant", "discriminant", "дискриминант", "Diskriminant kvadrat tenglama ildizlari sonini aniqlaydi."],
    ["ildiz osti", "square root", "квадратный корень", "√25 ning qiymati 5."],
  ],
  Geometry: [
    ["nuqta", "point", "точка", "Nuqta o'lchamga ega emas."],
    ["to'g'ri chiziq", "line", "прямая", "To'g'ri chiziq ikki tomonga cheksiz davom etadi."],
    ["kesma", "line segment", "отрезок", "Kesmaning ikkita uchi bo'ladi."],
    ["nur", "ray", "луч", "Nurning boshlanish nuqtasi bor."],
    ["burchak", "angle", "угол", "Burchak ikki nur orasida hosil bo'ladi."],
    ["uchburchak", "triangle", "треугольник", "Uchburchakning uchta tomoni bor."],
    ["to'rtburchak", "quadrilateral", "четырёхугольник", "To'rtburchak to'rtta tomonga ega."],
    ["kvadrat", "square", "квадрат", "Kvadratning barcha tomonlari teng."],
    ["to'g'ri to'rtburchak", "rectangle", "прямоугольник", "To'g'ri to'rtburchakning barcha burchaklari to'g'ri."],
    ["aylana", "circle", "окружность", "Aylananing markazidan nuqtalarigacha masofa teng."],
    ["radius", "radius", "радиус", "Radius markazdan aylanagacha chiziladi."],
    ["diametr", "diameter", "диаметр", "Diametr radiusdan ikki baravar uzun."],
    ["perimetr", "perimeter", "периметр", "Perimetr shakl chegarasi uzunliklari yig'indisi."],
    ["yuza", "area", "площадь", "To'g'ri to'rtburchak yuzi bo'yi va enining ko'paytmasi."],
    ["hajm", "volume", "объём", "Kub hajmi qirrasi kubiga teng."],
    ["parallel", "parallel", "параллельный", "Parallel chiziqlar kesishmaydi."],
    ["perpendikulyar", "perpendicular", "перпендикулярный", "Perpendikulyar chiziqlar to'g'ri burchak hosil qiladi."],
    ["diagonal", "diagonal", "диагональ", "Diagonal ko'pburchakning qarama-qarshi uchlarini tutashtiradi."],
    ["koordinata", "coordinate", "координата", "Nuqta koordinata tekisligida juft son bilan belgilanadi."],
    ["simmetriya", "symmetry", "симметрия", "Aylana markaziy simmetriyaga ega."],
  ],
  History: [
    ["sivilizatsiya", "civilization", "цивилизация", "Qadimgi sivilizatsiyalar daryo bo'ylarida rivojlangan."],
    ["arxeologiya", "archaeology", "археология", "Arxeologiya qadimiy buyumlarni o'rganadi."],
    ["manba", "source", "источник", "Yozma manba o'tmish haqida axborot beradi."],
    ["davr", "era", "эпоха", "Bronza davrida bronzadan asboblar yasalgan."],
    ["sulola", "dynasty", "династия", "Sulolada hokimiyat avloddan avlodga o'tadi."],
    ["imperiya", "empire", "империя", "Imperiya ko'plab hududlarni birlashtirgan davlat."],
    ["hukmdor", "ruler", "правитель", "Hukmdor davlatni boshqargan."],
    ["davlat", "state", "государство", "Davlatning hududi va aholisi bo'ladi."],
    ["mustaqillik", "independence", "независимость", "Mustaqillik davlatning o'zini o'zi boshqarishidir."],
    ["inqilob", "revolution", "революция", "Inqilob jamiyatda keskin o'zgarish keltiradi."],
    ["islohot", "reform", "реформа", "Islohot tizimni bosqichma-bosqich o'zgartiradi."],
    ["urush", "war", "война", "Urush davlatlar o'rtasidagi qurolli to'qnashuv."],
    ["tinchlik", "peace", "мир", "Tinchlik davrida jamiyat osoyishta rivojlanadi."],
    ["savdo", "trade", "торговля", "Ipak yo'li uzoq hududlar o'rtasida savdoni kuchaytirgan."],
    ["madaniyat", "culture", "культура", "Madaniyat xalqning urf-odat va qadriyatlarini qamraydi."],
    ["yodgorlik", "monument", "памятник", "Tarixiy yodgorlik o'tmish izlarini saqlaydi."],
    ["xronologiya", "chronology", "хронология", "Xronologiya voqealarni vaqt bo'yicha tartiblaydi."],
    ["qadimgi", "ancient", "древний", "Qadimgi shaharlar ko'pincha qal'a bilan himoyalangan."],
    ["o'rta asrlar", "Middle Ages", "Средние века", "O'rta asrlarda ko'plab qal'alar qurilgan."],
    ["tarixiy shaxs", "historical figure", "историческая личность", "Tarixiy shaxslar jamiyat taraqqiyotiga ta'sir ko'rsatgan."],
  ],
};

const existingDictionary: DictionaryEntry[] = Object.entries(terms).flatMap(([fan, entries]) =>
  entries.map(([uz, en, ru, misol]) => ({
    uz, en, ru, fan: fan as DictionaryCategory, misol,
  })),
);

const additionalEntries: DictionaryEntry[] = [
  { uz: "kitob", en: "book", ru: "книга", fan: "English", misol: "Men har hafta bitta kitob o'qiyman." },
  { uz: "maktab", en: "school", ru: "школа", fan: "English", misol: "Maktabim uyimga yaqin." },
  { uz: "do'st", en: "friend", ru: "друг", fan: "English", misol: "Do'stim menga yordam berdi." },
  { uz: "o'qituvchi", en: "teacher", ru: "учитель", fan: "English", misol: "O'qituvchimiz yangi mavzuni tushuntirdi." },
  { uz: "bilim", en: "knowledge", ru: "знание", fan: "English", misol: "Bilim — eng katta boylik." },
  { uz: "savol", en: "question", ru: "вопрос", fan: "English", misol: "Menda bitta savol bor." },
  { uz: "ko'cha", en: "street", ru: "улица", fan: "Russian", misol: "Bu ko'cha juda uzun." },
  { uz: "oila", en: "family", ru: "семья", fan: "Russian", misol: "Mening oilam katta." },
  { uz: "shahar", en: "city", ru: "город", fan: "Russian", misol: "Toshkent katta shahar." },
  { uz: "yozmoq", en: "to write", ru: "писать", fan: "Russian", misol: "Men daftarga yozaman." },
  { uz: "o'qimoq", en: "to read", ru: "читать", fan: "Russian", misol: "U kitob o'qiyapti." },
  { uz: "tezlik", en: "velocity", ru: "скорость", fan: "Physics", misol: "Mashinaning tezligi soatiga 60 km." },
  { uz: "kuch", en: "force", ru: "сила", fan: "Physics", misol: "Kuch Nyutonda o'lchanadi." },
  { uz: "massa", en: "mass", ru: "масса", fan: "Physics", misol: "Jismning massasi kilogrammda o'lchanadi." },
  { uz: "energiya", en: "energy", ru: "энергия", fan: "Physics", misol: "Quyosh energiyasi toza energiya manbai." },
  { uz: "bosim", en: "pressure", ru: "давление", fan: "Physics", misol: "Chuqurlik oshgani sari suv bosimi ortadi." },
  { uz: "tok kuchi", en: "electric current", ru: "электрический ток", fan: "Physics", misol: "Tok kuchi amperda o'lchanadi." },
  { uz: "atom", en: "atom", ru: "атом", fan: "Chemistry", misol: "Atom yadro va elektronlardan iborat." },
  { uz: "molekula", en: "molecule", ru: "молекула", fan: "Chemistry", misol: "Suv molekulasi H2O formulasiga ega." },
  { uz: "kislota", en: "acid", ru: "кислота", fan: "Chemistry", misol: "Limonda kislota bor." },
  { uz: "asos", en: "base", ru: "основание", fan: "Chemistry", misol: "Asos kislota bilan reaksiyaga kirishadi." },
  { uz: "tuz", en: "salt", ru: "соль", fan: "Chemistry", misol: "Osh tuzi NaCl formulasiga ega." },
  { uz: "element", en: "element", ru: "элемент", fan: "Chemistry", misol: "Kislorod — kimyoviy element." },
  { uz: "hujayra", en: "cell", ru: "клетка", fan: "Biology", misol: "Hujayra tirik organizmning asosiy birligi." },
  { uz: "yurak", en: "heart", ru: "сердце", fan: "Biology", misol: "Yurak qonni haydaydi." },
  { uz: "o'pka", en: "lung", ru: "лёгкое", fan: "Biology", misol: "O'pka nafas olishda ishtirok etadi." },
  { uz: "qon", en: "blood", ru: "кровь", fan: "Biology", misol: "Qon tomirlar bo'ylab oqadi." },
  { uz: "o'simlik", en: "plant", ru: "растение", fan: "Biology", misol: "O'simlik quyosh nuriga muhtoj." },
  { uz: "fotosintez", en: "photosynthesis", ru: "фотосинтез", fan: "Biology", misol: "Fotosintezda o'simlik kislorod chiqaradi." },
  { uz: "kompyuter", en: "computer", ru: "компьютер", fan: "Informatics", misol: "Kompyuterda dastur yozaman." },
  { uz: "dastur", en: "program", ru: "программа", fan: "Informatics", misol: "Bu dastur juda tez ishlaydi." },
  { uz: "fayl", en: "file", ru: "файл", fan: "Informatics", misol: "Faylni papkaga saqladim." },
  { uz: "parol", en: "password", ru: "пароль", fan: "Informatics", misol: "Parolingizni hech kimga bermang." },
  { uz: "tarmoq", en: "network", ru: "сеть", fan: "Informatics", misol: "Kompyuterlar tarmoqqa ulangan." },
  { uz: "ma'lumot", en: "data", ru: "данные", fan: "Informatics", misol: "Ma'lumotlar bazada saqlanadi." },
  { uz: "tenglama", en: "equation", ru: "уравнение", fan: "Algebra", misol: "Bu tenglamani yeching." },
  { uz: "funksiya", en: "function", ru: "функция", fan: "Algebra", misol: "Funksiya grafigini chizing." },
  { uz: "ildiz", en: "root", ru: "корень", fan: "Algebra", misol: "9 ning kvadrat ildizi 3 ga teng." },
  { uz: "daraja", en: "power", ru: "степень", fan: "Algebra", misol: "2 ning 3-darajasi 8 ga teng." },
  { uz: "tengsizlik", en: "inequality", ru: "неравенство", fan: "Algebra", misol: "Tengsizlikning yechimini toping." },
  { uz: "uchburchak", en: "triangle", ru: "треугольник", fan: "Geometry", misol: "Uchburchakning uchta tomoni bor." },
  { uz: "aylana", en: "circle", ru: "окружность", fan: "Geometry", misol: "Aylananing markazini belgilang." },
  { uz: "burchak", en: "angle", ru: "угол", fan: "Geometry", misol: "To'g'ri burchak 90 gradusga teng." },
  { uz: "yuza", en: "area", ru: "площадь", fan: "Geometry", misol: "Kvadratning yuzasini hisoblang." },
  { uz: "hajm", en: "volume", ru: "объём", fan: "Geometry", misol: "Kubning hajmi tomonining kubiga teng." },
  { uz: "davlat", en: "state", ru: "государство", fan: "History", misol: "Davlat qonunlar asosida boshqariladi." },
  { uz: "inqilob", en: "revolution", ru: "революция", fan: "History", misol: "Inqilob jamiyatni o'zgartirdi." },
  { uz: "urush", en: "war", ru: "война", fan: "History", misol: "Urush katta talofatlar keltirdi." },
  { uz: "tinchlik", en: "peace", ru: "мир", fan: "History", misol: "Hamma tinchlikni xohlaydi." },
  { uz: "mustaqillik", en: "independence", ru: "независимость", fan: "History", misol: "O'zbekiston mustaqilligini 1991-yilda qo'lga kiritdi." },
];

function normalizeTerm(value: string): string {
  return value.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[ʻ’‘`]/g, "'").replace(/[^\p{L}\p{N}]+/gu, " ").trim().replace(/\s+/g, " ");
}

const seenPairs = new Set(existingDictionary.map((entry) =>
  `${normalizeTerm(entry.uz)}|${normalizeTerm(entry.en)}`,
));

export const dictionary: DictionaryEntry[] = [
  ...existingDictionary,
  ...additionalEntries.filter((entry) => {
    const pair = `${normalizeTerm(entry.uz)}|${normalizeTerm(entry.en)}`;
    if (seenPairs.has(pair)) return false;
    seenPairs.add(pair);
    return true;
  }),
];

export const dictionaryCategories = Object.keys(terms) as DictionaryCategory[];

function normalize(value: string): string {
  return value.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[ʻ’‘`]/g, "'").replace(/[^\p{L}\p{N}]+/gu, " ").trim().replace(/\s+/g, " ");
}

export function matchDictionary(
  text: string,
  source: TranslatorLanguage,
  target: TranslatorLanguage,
): DictionaryEntry | undefined {
  const query = normalize(text);
  if (!query) return undefined;
  const exact = dictionary.find((entry) => normalize(entry[source]) === query
    && normalize(entry[target]) !== query);
  if (exact) return exact;
  if (query.includes(" ") || query.length < 4) return undefined;
  return dictionary.find((entry) => {
    const term = normalize(entry[source]);
    return !term.includes(" ") && term.length >= 4
      && Math.abs(term.length - query.length) <= 1
      && distance(term, query) <= 1
      && normalize(entry[target]) !== query;
  });
}

function distance(left: string, right: string): number {
  const row = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let i = 1; i <= left.length; i += 1) {
    let diagonal = row[0];
    row[0] = i;
    for (let j = 1; j <= right.length; j += 1) {
      const previous = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, diagonal + (left[i - 1] === right[j - 1] ? 0 : 1));
      diagonal = previous;
    }
  }
  return row[right.length];
}
