# Financial Explorer

A production-ready Next.js app for exploring SEC EDGAR company financial data.

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` — start the development server
- `npm run build` — compile the production build
- `npm run start` — start the production server
- `npm run lint` — run Next.js and TypeScript linting

## Project Structure

- `app/` — Next.js App Router pages and API routes
- `components/` — reusable UI components
- `context/` — React context providers and state management
- `lib/` — shared utilities and business logic
- `types/` — TypeScript domain models and shape definitions

## Notes

- The SEC API proxy is implemented in `app/api/sec/route.ts`.
- Search, data visualization, and CSV export are available from the dashboard.
- Tailwind CSS scans the `app`, `components`, `context`, and `lib` folders.

## Deployment

This app is compatible with Vercel and standard Next.js hosting platforms.

See [Next.js Deployment](https://nextjs.org/docs/app/building-your-application/deploying) for deployment details.
