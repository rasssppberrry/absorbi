# Absorbi Project Rules

## Design
- Light theme only. White background. Never a dark mode.
- Colors: black and white, plus one accent color which is blue (provisional value #2563EB, to be finalized in Phase 2).
- No gradients.
- Sharp corners. Border radius 0 to 2 pixels maximum.
- Icons: lucide-react only. No other icon sets, no random SVGs.
- No emojis anywhere in the interface.
- No hyphens in user facing interface text.
- Typography: a geometric, high legibility Google Font chosen in Phase 2. Never Roboto or Inter.
- Absolute minimalism. Vercel native restraint. No visual clutter.

## Engineering
- Package manager: pnpm workspace (frontend, backend).
- Secrets live in .env.local and are never committed.
- The scoring engine is built behind a fixed contract. Every prediction is labeled with a model_version (for now, "rules-v0"). This lets a real machine learning model replace the transparent engine later without changing the frontend.
- Safety: the red flag gate is fail safe. It over refers rather than under refers, and a doctor always signs off. It is never an autonomous decision.
- The audit and sign off records are append only (from Phase 10).

## Attribution
- All commits are authored solely by Adiya Etmakhambetova.
- Never add Co-Authored-By, never add any AI tool name, never add a Generated with line, never list any AI as a contributor.
