import Link from "next/link";
import { signOut } from "@/lib/auth/actions";
import { Container } from "@/components/ui/container";

export function TopBar({
  name,
  hospital,
}: {
  name: string;
  hospital: string;
}) {
  return (
    <header className="border-b border-border">
      <Container className="flex h-16 max-w-6xl items-center justify-between">
        <Link
          href="/dashboard"
          className="text-lg font-semibold tracking-tight"
        >
          Absorbi
        </Link>
        <div className="flex items-center gap-6">
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
              Sign out
            </button>
          </form>
        </div>
      </Container>
    </header>
  );
}
