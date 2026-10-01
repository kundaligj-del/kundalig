export type PackQuestion = {
  id: string;
  savol: string;
  variantlar: [string, string, string, string];
  togri: number;
  ishora: string;
  izoh: string;
};

export type HomeworkPack = {
  id: string;
  matn: string;
  qiyinlik: "oson" | "o'rta" | "qiyin";
  taxminiyVaqt: number;
  ishoralar: [string, string, string];
  namunaYechim: string;
  tekshirishKaliti: string;
};

export type StudyPack = {
  fan: string;
  mavzu: string;
  testlar: PackQuestion[];
  uyVazifa: HomeworkPack;
};
