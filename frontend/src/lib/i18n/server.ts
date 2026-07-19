import { cookies } from "next/headers";
import { getDictionary, type Lang } from "./dictionaries";

export async function getLang(): Promise<Lang> {
  const store = await cookies();
  const value = store.get("lang")?.value;
  if (value === "kk" || value === "en") return value;
  return "ru";
}

export async function getDict() {
  return getDictionary(await getLang());
}
