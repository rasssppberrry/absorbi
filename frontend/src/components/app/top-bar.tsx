import Link from "next/link";
import { signOut } from "@/lib/auth/actions";
import { Container } from "@/components/ui/container";
import { LanguageToggle } from "@/components/app/language-toggle";
import { getDict } from "@/lib/i18n/server";

export async function TopBar({
  name,
  hospital,
}: {
  name: string;
  hospital: string;
}) {
  const t = await getDict();
  return (
    <header className="border-b border-border">
      <Container className="flex h-16 max-w-6xl items-center justify-between">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
          Absorbi
        </Link>
        <div className="flex items-center gap-6">
          <LanguageToggle />
          <div className="flex flex-col items-end">
            <span className="text-sm text-foreground">{name}</span>
            {hospital ? (
              <span className="text-xs text-muted">{hospital}</span>
            ) : null}
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {t.signOut}
            </button>
          </form>
        </div>
      </Container>
    </header>
  );
}
