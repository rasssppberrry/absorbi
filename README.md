# Absorbi

Clinical decision support for lumbar disc herniation. Absorbi reads a lumbar spine MRI and a short clinical form and returns a red flag triage band and a disc resorption likelihood estimate, with mandatory human sign off. The current engine, version rules-v0, is a transparent, evidence based scoring model. It is decision support, not a diagnosis.

## Structure

- frontend: the Next.js application, including the engine and the Supabase access layer
- backend: reserved for the future machine learning service
- supabase: database migrations and configuration
- docs: project documents and rules

## Requirements

- Node.js 20 or newer
- pnpm

## Environment

Create a file at frontend/.env.local containing:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Run locally

1. pnpm install
2. pnpm dev
3. Open http://localhost:3000

## Deploy

The frontend deploys to Vercel with the Root Directory set to frontend and the three environment variables above configured in the Vercel project settings.
