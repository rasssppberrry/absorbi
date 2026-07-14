"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

export default function LoginPage() {
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
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center py-16">
      <Container className="max-w-sm">
        <Card className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
            <p className="text-sm text-muted">Access your Absorbi workspace.</p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field label="Email" htmlFor="email">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
            <Field label="Password" htmlFor="password" error={error}>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>
            <Button type="submit" disabled={pending}>
              {pending ? "Signing in" : "Sign in"}
            </Button>
          </form>
          <p className="text-sm text-muted">
            New here?{" "}
            <Link href="/register" className="text-accent">
              Register with your hospital code
            </Link>
          </p>
        </Card>
      </Container>
    </main>
  );
}
