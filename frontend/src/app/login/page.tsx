"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "@/lib/auth/actions";
import { useLanguage } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

export default function LoginPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    const result = await signIn({ email, password });
    if (result?.error) {
      setError(t.signInError);
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center py-16">
      <Container className="max-w-sm">
        <Card className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">{t.signInTitle}</h1>
            <p className="text-sm text-muted">{t.signInSubtitle}</p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label={t.email} htmlFor="email">
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Field>
            <Field label={t.password} htmlFor="password" error={error}>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </Field>
            <Button type="submit" disabled={pending}>
              {pending ? t.signingIn : t.signInButton}
            </Button>
          </form>
          <p className="text-sm text-muted">
            {t.newHere}{" "}
            <Link href="/register" className="text-accent">
              {t.registerLink}
            </Link>
          </p>
        </Card>
      </Container>
    </main>
  );
}
