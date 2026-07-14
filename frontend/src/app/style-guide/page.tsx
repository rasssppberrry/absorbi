import { ArrowRight, Upload, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";

function Swatch({ name, className }: { name: string; className: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className={`h-16 w-24 rounded-[2px] border border-border ${className}`} />
      <span className="text-xs text-muted">{name}</span>
    </div>
  );
}

export default function StyleGuide() {
  return (
    <main className="min-h-screen py-16">
      <Container className="flex flex-col gap-12">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Absorbi design system
          </h1>
          <p className="text-sm text-muted">
            Internal reference. The visual foundation every screen is built from.
          </p>
        </header>

        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
            Typography
          </h2>
          <h1 className="text-4xl font-semibold tracking-tight">Heading one</h1>
          <h2 className="text-2xl font-semibold tracking-tight">Heading two</h2>
          <h3 className="text-lg font-medium">Heading three</h3>
          <p className="max-w-2xl text-sm leading-relaxed text-foreground">
            Body text set in Manrope. Absorbi reads a lumbar spine MRI plus a
            short clinical form and returns a red flag triage band and a disc
            resorption likelihood estimate.
          </p>
          <p className="text-sm text-muted">
            Muted text for secondary information.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
            Color
          </h2>
          <div className="flex flex-wrap gap-4">
            <Swatch name="Foreground" className="bg-foreground" />
            <Swatch name="Accent" className="bg-accent" />
            <Swatch name="Border" className="bg-border" />
            <Swatch name="Danger" className="bg-danger" />
            <Swatch name="Warning" className="bg-warning" />
            <Swatch name="Success" className="bg-success" />
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
            Buttons
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary">
              Primary action
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="secondary">
              <Upload className="h-4 w-4" />
              Secondary
            </Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="primary" disabled>
              Disabled
            </Button>
          </div>
        </section>

        <section className="grid max-w-xl gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
            Form controls
          </h2>
          <Field
            label="Full name"
            htmlFor="name"
            hint="As it appears on your hospital record"
          >
            <Input id="name" placeholder="Enter your name" />
          </Field>
          <Field label="Hospital" htmlFor="hospital">
            <Select id="hospital" defaultValue="">
              <option value="" disabled>
                Select a hospital
              </option>
              <option>National Centre for Neurosurgery</option>
              <option>University Medical Center</option>
            </Select>
          </Field>
          <Field label="Clinical note" htmlFor="note" error="This field is required">
            <Textarea id="note" placeholder="Short clinical summary" />
          </Field>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
            Card
          </h2>
          <Card className="max-w-md">
            <div className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 text-success" />
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-medium">Card surface</h3>
                <p className="text-sm text-muted">
                  White surface with a thin border and sharp corners. No heavy
                  shadows.
                </p>
              </div>
            </div>
          </Card>
        </section>
      </Container>
    </main>
  );
}
