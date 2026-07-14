# Absorbi

Clinical decision support for lumbar disc herniation. Absorbi reads a lumbar spine MRI plus a short clinical form and returns a red flag triage band and a disc resorption likelihood estimate, with mandatory human sign off.

## Structure
- frontend: the Next.js doctor facing application
- backend: Supabase access, the scoring engine, and shared types
- supabase: database migrations and configuration
- docs: project documents

## Run locally
1. Install dependencies: pnpm install
2. Start the app: pnpm dev
3. Open http://localhost:3000
