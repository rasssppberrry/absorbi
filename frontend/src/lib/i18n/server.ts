import { cookies } from "next/headers";
import { getDictionary, type Lang } from "./dictionaries";

export async function getLang(): Promise<Lang> {
  const store = await cookies();
  return store.get("lang")?.value === "kk" ? "kk" : "ru";
}

export async function getDict() {
  return getDictionary(await getLang());
}
