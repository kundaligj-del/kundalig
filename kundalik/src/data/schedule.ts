// Haftalik darslar va fanlarning ko'rinishi shu faylda saqlanadi.
export type Subject = {
  nomi: string;
  rang: string;
  ikonka: string;
  darslikUrl: string;
  pdfUrl: string;
};

export const defaultBookUrl = "https://infoedu.uz/darsliklar/11";
export const defaultPdfUrl = "https://infoedu.uz/darsliklar/11";

export const subjects: Record<string, Subject> = {
  "Kelajak soati": { nomi: "Kelajak soati", rang: "violet", ikonka: "sparkles", darslikUrl: defaultBookUrl, pdfUrl: defaultPdfUrl },
  Algebra: { nomi: "Algebra", rang: "blue", ikonka: "calculator", darslikUrl: defaultBookUrl, pdfUrl: defaultPdfUrl },
  Kimyo: { nomi: "Kimyo", rang: "emerald", ikonka: "flask", darslikUrl: defaultBookUrl, pdfUrl: defaultPdfUrl },
  Geometriya: { nomi: "Geometriya", rang: "cyan", ikonka: "triangle", darslikUrl: defaultBookUrl, pdfUrl: defaultPdfUrl },
  "Jismoniy tarbiya": { nomi: "Jismoniy tarbiya", rang: "orange", ikonka: "dumbbell", darslikUrl: defaultBookUrl, pdfUrl: defaultPdfUrl },
  "Tadbirkorlik asoslari": { nomi: "Tadbirkorlik asoslari", rang: "amber", ikonka: "briefcase", darslikUrl: defaultBookUrl, pdfUrl: defaultPdfUrl },
  ChQBT: { nomi: "ChQBT", rang: "rose", ikonka: "shield", darslikUrl: defaultBookUrl, pdfUrl: defaultPdfUrl },
  Fizika: { nomi: "Fizika", rang: "orange", ikonka: "atom", darslikUrl: defaultBookUrl, pdfUrl: defaultPdfUrl },
  Biologiya: { nomi: "Biologiya", rang: "lime", ikonka: "leaf", darslikUrl: defaultBookUrl, pdfUrl: defaultPdfUrl },
  "Ingliz tili": { nomi: "Ingliz tili", rang: "indigo", ikonka: "languages", darslikUrl: defaultBookUrl, pdfUrl: defaultPdfUrl },
  Informatika: { nomi: "Informatika", rang: "sky", ikonka: "laptop", darslikUrl: defaultBookUrl, pdfUrl: defaultPdfUrl },
  "O'zbekiston tarixi": { nomi: "O'zbekiston tarixi", rang: "red", ikonka: "landmark", darslikUrl: defaultBookUrl, pdfUrl: defaultPdfUrl },
  "Rus tili": { nomi: "Rus tili", rang: "pink", ikonka: "languages", darslikUrl: defaultBookUrl, pdfUrl: defaultPdfUrl },
  Adabiyot: { nomi: "Adabiyot", rang: "fuchsia", ikonka: "book-open", darslikUrl: defaultBookUrl, pdfUrl: defaultPdfUrl },
  "Davlat huquqi asoslari": { nomi: "Davlat huquqi asoslari", rang: "slate", ikonka: "scale", darslikUrl: defaultBookUrl, pdfUrl: defaultPdfUrl },
  "Ona tili": { nomi: "Ona tili", rang: "teal", ikonka: "book-open", darslikUrl: defaultBookUrl, pdfUrl: defaultPdfUrl },
  "Jahon tarixi": { nomi: "Jahon tarixi", rang: "yellow", ikonka: "globe", darslikUrl: defaultBookUrl, pdfUrl: defaultPdfUrl },
  Tarbiya: { nomi: "Tarbiya", rang: "pink", ikonka: "heart", darslikUrl: defaultBookUrl, pdfUrl: defaultPdfUrl },
  Astronomiya: { nomi: "Astronomiya", rang: "purple", ikonka: "orbit", darslikUrl: defaultBookUrl, pdfUrl: defaultPdfUrl },
};

export const week = [
  { kun: "Dushanba", qisqa: "Du", fanlar: ["Kelajak soati", "Algebra", "Kimyo", "Geometriya", "Jismoniy tarbiya"] },
  { kun: "Seshanba", qisqa: "Se", fanlar: ["Tadbirkorlik asoslari", "ChQBT", "Geometriya", "Fizika", "Kimyo", "Biologiya"] },
  { kun: "Chorshanba", qisqa: "Chor", fanlar: ["Ingliz tili", "Informatika", "Jismoniy tarbiya", "O'zbekiston tarixi"] },
  { kun: "Payshanba", qisqa: "Pay", fanlar: ["Ingliz tili", "ChQBT", "Rus tili", "Adabiyot", "Davlat huquqi asoslari", "Ona tili"] },
  { kun: "Juma", qisqa: "Ju", fanlar: ["Rus tili", "Informatika", "Algebra", "Fizika", "Biologiya", "Jahon tarixi"] },
  { kun: "Shanba", qisqa: "Sha", fanlar: ["Algebra", "Ona tili", "Adabiyot", "Tarbiya", "Astronomiya"] },
];
