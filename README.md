# linkfund.eu

A link-in-bio platform where creators share all their links on one page and accept tips from fans via Mollie payments.

## Features

- **Link pages** — Create a public profile at `/<username>` with all your important links
- **Tipping with Mollie** — Visitors can send tips (€2 / €5 / €10 / €25) processed through Mollie's hosted checkout
- **Auth** — Sign up / sign in via Supabase Auth; profile auto-created on signup
- **Dashboard** — Manage your links and profile from `/dashboard`

## Tech Stack

- **Frontend** — React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend** — Supabase (Postgres, Auth, Edge Functions)
- **Payments** — Mollie Payments API v2

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Mollie](https://mollie.com) account with an API key

### Install

```sh
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
```

Set the Mollie API key as a Supabase secret (used by Edge Functions):

```sh
supabase secrets set MOLLIE_API_KEY=test_xxxxxxxxxxxxxxxxxx
```

### Database

Push migrations to your Supabase project:

```sh
supabase db push
```

This creates the `profiles`, `links`, and `tips` tables with Row Level Security policies.

### Edge Functions

Deploy the payment Edge Functions:

```sh
supabase functions deploy create-tip-payment
supabase functions deploy mollie-webhook
```

| Function | Purpose |
|---|---|
| `create-tip-payment` | Creates a tip record + Mollie payment, returns the checkout URL |
| `mollie-webhook` | Receives Mollie webhook callbacks, updates tip status |

### Run

```sh
npm run dev
```

## Tipping Flow

1. Visitor clicks "Tip" on a profile page and picks an amount
2. Frontend calls the `create-tip-payment` Edge Function
3. Edge Function inserts a `tips` row (status: `pending`) and creates a Mollie payment
4. Visitor is redirected to Mollie's checkout page
5. After payment, Mollie calls the `mollie-webhook` Edge Function which updates the tip status to `paid`
6. Visitor is redirected to `/tip/return` which shows the result

## Project Structure

```
src/
  pages/
    Index.tsx          Landing page
    Auth.tsx           Sign in / sign up
    Dashboard.tsx      Manage profile & links
    ProfilePage.tsx    Public profile with tip button
    TipReturn.tsx      Post-payment return page
    DemoProfile.tsx    Static demo profile
  integrations/
    supabase/          Supabase client & generated types
  components/
    ui/                shadcn/ui components
supabase/
  migrations/          SQL migrations
  functions/
    create-tip-payment/  Payment creation Edge Function
    mollie-webhook/      Webhook handler Edge Function
    _shared/             Shared utilities (CORS headers)
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |
