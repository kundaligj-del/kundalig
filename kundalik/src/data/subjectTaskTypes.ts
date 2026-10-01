// Har bir fan uchun topshiriq turi va mahalliy zaxira andozasi.
export type SubjectTaskType = {
  tur: string;
  instruction: string;
  zaxira: string;
  yengil?: boolean;
};

export const subjectTaskTypes: Record<string, SubjectTaskType> = {
  Algebra: { tur: "Masalalar va formulalar", instruction: "formulani qo'llaydigan qisqa masala", zaxira: "Oxirgi mavzudagi asosiy formulani takrorla va bitta sodda masala yech." },
  Geometriya: { tur: "Masalalar va formulalar", instruction: "chizma yoki formulaga oid masala", zaxira: "Oxirgi mavzudagi formulalarni ko'rib chiq va bitta chizma chiz." },
  Fizika: { tur: "Masalalar va formulalar", instruction: "fizik formula va birliklarga doir masala", zaxira: "Oxirgi mavzudagi formulani takrorla va bitta sodda masala yech." },
  Kimyo: { tur: "Masalalar va formulalar", instruction: "formula yoki reaksiya tenglamasiga doir mashq", zaxira: "Oxirgi mavzudagi formulalar va reaksiyalarni takrorla." },
  Biologiya: { tur: "Savollar, konspekt va atamalar", instruction: "qisqa savol-javob yoki asosiy atamalar mashqi", zaxira: "Oxirgi mavzudan 3 ta asosiy atamani yozib, qisqacha izohla." },
  "O'zbekiston tarixi": { tur: "Savollar, konspekt va atamalar", instruction: "tarixiy voqea va sanalarga doir qisqa savollar", zaxira: "Oxirgi mavzudagi 3 muhim voqeani qisqa konspekt qil." },
  "Jahon tarixi": { tur: "Savollar, konspekt va atamalar", instruction: "tarixiy voqea va sanalarga doir qisqa savollar", zaxira: "Oxirgi mavzudagi 3 muhim voqeani qisqa konspekt qil." },
  "Davlat huquqi asoslari": { tur: "Savollar, konspekt va atamalar", instruction: "huquqiy atama va tushunchalarga oid savollar", zaxira: "Oxirgi mavzudan 3 ta huquqiy atamani yozib, ma'nosini tushuntir." },
  Astronomiya: { tur: "Savollar, konspekt va atamalar", instruction: "astronomik tushuncha va atamalarga doir savollar", zaxira: "Oxirgi mavzudagi 3 astronomik atamani qisqacha izohla." },
  "Ingliz tili": { tur: "So'z yodlash, gap tuzish va mashqlar", instruction: "yangi so'zlar, gap tuzish yoki grammatika mashqi", zaxira: "Oxirgi mavzudagi 5 ta so'zni takrorla va ular bilan 2 ta gap tuz." },
  "Rus tili": { tur: "So'z yodlash, gap tuzish va mashqlar", instruction: "yangi so'zlar, gap tuzish yoki grammatika mashqi", zaxira: "Oxirgi mavzudagi 5 ta so'zni takrorla va ular bilan 2 ta gap tuz." },
  Adabiyot: { tur: "Asar tahlili, qoidalar va mini-insho", instruction: "asar, qahramon yoki badiiy vositaga oid qisqa tahlil", zaxira: "Oxirgi o'qilgan asar yoki mavzudan 3-4 gaplik fikr yoz." },
  "Ona tili": { tur: "Qoidalar, mashqlar va mini-insho", instruction: "imlo yoki grammatika qoidasiga doir mashq", zaxira: "Oxirgi mavzudagi qoidani takrorla va 3 ta misol yoz." },
  Informatika: { tur: "Amaliy topshiriq yoki mantiqiy masala", instruction: "kompyuterda bajariladigan amaliy yoki mantiqiy topshiriq", zaxira: "Oxirgi mavzudagi amallarni qog'ozda bosqichma-bosqich takrorla." },
  ChQBT: { tur: "Mashqlar va nazariy savollar", instruction: "xavfsiz nazariy savol yoki yengil tayyorgarlik mashqi", zaxira: "Oxirgi mavzudagi 3 ta nazariy savolga qisqacha javob yoz." },
  "Tadbirkorlik asoslari": { tur: "Biznes g'oya yoki hisob-kitob", instruction: "kichik biznes g'oya yoki sodda hisob-kitob topshirig'i", zaxira: "Kichik biznes g'oyasini yoz va taxminiy xarajat-daromadni hisobla." },
  "Jismoniy tarbiya": { tur: "Yengil uy mashqlari", instruction: "5-10 daqiqalik yengil, xavfsiz cho'zilish yoki tana mashqi", zaxira: "5 daqiqa yengil cho'zilish qil; og'riq sezilsa darhol to'xta.", yengil: true },
  Tarbiya: { tur: "Qisqa mulohaza yoki oilaviy suhbat", instruction: "3-4 gaplik mulohaza yoki oila bilan suhbat mavzusi", zaxira: "Bugun o'rgangan yaxshi odating haqida 3 gap yoz.", yengil: true },
  "Kelajak soati": { tur: "Maqsad va reja", instruction: "bitta kichik maqsad yoki qisqa kelajak rejasi", zaxira: "Ertangi kun uchun bitta maqsad yoz va unga erishish qadamini belgilab ol.", yengil: true },
};

export function getSubjectTaskType(subject: string): SubjectTaskType {
  return subjectTaskTypes[subject] ?? {
    tur: "Umumiy takrorlash",
    instruction: "mavzuni takrorlashga doir sodda o'quv topshirig'i",
    zaxira: "Darslikdan oxirgi mavzuni takrorla va 3 ta muhim fikrni yoz.",
  };
}
