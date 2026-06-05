# Tin Tuc Next.js

A Next.js news-style front-end built with TypeScript and Tailwind CSS.

## Scripts

- `pnpm dev` - start the development server
- `pnpm build` - create a production build
- `pnpm start` - run the production server
- `pnpm typecheck` - run the TypeScript compiler without emitting files

## Project Notes

- App routes live in `app/`.
- Shared UI components live in `components/`.
- Frontend data access lives in `lib/api/`.
- Shared frontend/backend data shapes live in `lib/types/`.
- Mock content remains in `lib/mockData.ts`.
- Mock layout settings for navbar/footer live in `lib/mockSiteSettings.ts`.
- Backend integration contract is documented in `docs/frontend-api-contract.md`.

## Data Source

Mock data is enabled by default.

To call backend APIs instead, create a local `.env` file:

```bash
NEXT_PUBLIC_USE_MOCKS=false
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api
```
