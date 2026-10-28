# CVC-Calculator

Open web application for computing Hernández-Nieto's chance-corrected Content Validity Coefficient (CVC).
Live: https://coeficiente-de-validez-de-contenido.vercel.app/

- Version 1.1.0 — see `CHANGELOG.md` and `v1.0_to_v1.1.0.diff`.
- Stack: Angular 18, TypeScript 5.5; no backend; static deployment (Vercel). Anonymous usage counter via Firebase RTDB (no session data transmitted).
- Calculation core: `src/app/core/services/calculos.service.ts` (unit tests: `calculos.service.spec.ts`).
- Verification corpus and pipeline: Figshare deposit "CVC-Calculator verification corpus and results (v1.1.0)".

## Run locally
```
npm install
npm start        # http://localhost:4200
npm test         # Jasmine/Karma unit tests
npm run build    # production build
```
Before publishing the repository, move the Firebase configuration in `src/environments/environment.ts`
to environment variables or keep only the public web-client keys and enable database rules that allow
only the `impacto_calculadora` counter transaction.

## Cite
Paredes Morales AE, Arbulú Ballesteros MA, Arbulú Castillo JC, Cruz Salinas LE, Guzmán Valle MA.
CVC-Calculator: an open web application for computing Hernández-Nieto's chance-corrected Content Validity
Coefficient (v1.1.0) [software]. 2026. Figshare DOI: [to be assigned].

Licence: MIT (see `LICENSE`).
