import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/provider";
import type { Lang } from "@/lib/i18n/dictionaries";

const manrope = Manrope({
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Absorbi",
  description: "Clinical decision support for lumbar disc herniation.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = await cookies();
  const value = store.get("lang")?.value;
  const lang: Lang = value === "kk" || value === "en" ? value : "ru";

  return (
    <html lang={lang} className={manrope.variable}>
      <body>
        <LanguageProvider lang={lang}>{children}</LanguageProvider>
      </body>
    </html>
  );
}
