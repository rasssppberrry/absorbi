"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabasePublic } from "@/lib/supabase/public";
import { registerDoctor } from "@/lib/auth/actions";
import { useLanguage } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

type City = { id: string; name: string };
type Hospital = { id: string; name: string; city_id: string };

export default function RegisterPage() {
  const { t } = useLanguage();
  const [step, setStep] = useState<1 | 2>(1);
  const [cities, setCities] = useState<City[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [cityId, setCityId] = useState("");
  const [hospitalId, setHospitalId] = useState("");
  const [code, setCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    async function load() {
      const [{ data: cityData }, { data: hospitalData }] = await Promise.all([
        supabasePublic.from("cities").select("id, name").order("name"),
        supabasePublic.from("hospitals").select("id, name, city_id").order("name"),
      ]);
      setCities(cityData ?? []);
      setHospitals(hospitalData ?? []);
    }
    load();
  }, []);

  const hospitalsInCity = hospitals.filter((h) => h.city_id === cityId);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    const { data, error: rpcError } = await supabasePublic.rpc("verify_hospital_code", {
      p_hospital_id: hospitalId,
      p_code: code,
    });
    setPending(false);
    if (rpcError) {
      setError(t.codeCheckError);
      return;
    }
    if (!data) {
      setError(t.codeWrong);
      return;
    }
    setStep(2);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    const result = await registerDoctor({ hospitalId, code, fullName, email, password });
    if (result?.error) {
      setError(t.registerError);
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center py-16">
      <Container className="max-w-sm">
        <Card className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">{t.registerTitle}</h1>
            <p className="text-sm text-muted">
              {step === 1 ? t.registerStep1Sub : t.registerStep2Sub}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleVerify} className="flex flex-col gap-4">
              <Field label={t.city} htmlFor="city">
                <Select
                  id="city"
                  value={cityId}
                  onChange={(e) => {
                    setCityId(e.target.value);
                    setHospitalId("");
                  }}
                  required
                >
                  <option value="" disabled>
                    {t.selectCity}
                  </option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={t.hospital} htmlFor="hospital">
                <Select
                  id="hospital"
                  value={hospitalId}
                  onChange={(e) => setHospitalId(e.target.value)}
                  required
                  disabled={!cityId}
                >
                  <option value="" disabled>
                    {t.selectHospital}
                  </option>
                  {hospitalsInCity.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={t.accessCode} htmlFor="code" error={error}>
                <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} required />
              </Field>
              <Button type="submit" disabled={pending || !hospitalId}>
                {pending ? t.checking : t.continueButton}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <Field label={t.fullName} htmlFor="fullName">
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </Field>
              <Field label={t.hospitalEmail} htmlFor="email" hint={t.hospitalEmailHint}>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </Field>
              <Field label={t.password} htmlFor="password" hint={t.passwordHint} error={error}>
                <Input id="password" type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
              </Field>
              <Button type="submit" disabled={pending}>
                {pending ? t.creatingAccount : t.createAccount}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError("");
                }}
                className="text-sm text-muted"
              >
                {t.back}
              </button>
            </form>
          )}

          <p className="text-sm text-muted">
            {t.alreadyRegistered}{" "}
            <Link href="/login" className="text-accent">
              {t.signInLink}
            </Link>
          </p>
        </Card>
      </Container>
    </main>
  );
}
