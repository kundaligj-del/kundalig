import { algebraPacks } from "./algebra";
import { physicsPacks } from "./physics";
import type { StudyPack } from "./types";

// Yangi fan faylini import qilib, shu ro'yxatga qo'shish kifoya.
export const allPacks: StudyPack[] = [...algebraPacks, ...physicsPacks];

export function packsForSubject(subject: string): StudyPack[] {
  return allPacks.filter((pack) => pack.fan === subject);
}

export function findPack(subject: string, topic: string): StudyPack | undefined {
  return allPacks.find((pack) => pack.fan === subject && pack.mavzu === topic);
}
