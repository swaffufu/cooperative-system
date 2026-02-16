# Cooperative Management System

A comprehensive web application for managing cooperative member data, transactions, dividends, and reports.

## Features

- **Member Management** - Add, edit, view, and delete cooperative members
- **Transaction Tracking** - Record deposits, withdrawals, dividends, and fees
- **Financial Reports** - View share growth charts and member statistics
- **Dividend Management** - Calculate and distribute dividends to members
- **Dashboard** - Real-time overview of cooperative performance

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript
- **UI**: React 19 + Tailwind CSS + Radix UI
- **Database**: Supabase (PostgreSQL)
- **State Management**: TanStack React Query v5
- **Charts**: Recharts
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cooperative-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── actions/           # Server actions (API logic)
│   ├── members/           # Member management pages
│   ├── transactions/      # Transaction pages
│   ├── dividends/         # Dividend management
│   └── ...
├── components/            # React components
│   └── ui/               # Reusable UI components
├── lib/                   # Utility functions
│   ├── supabase.ts       # Supabase client
│   ├── types.ts          # TypeScript types
│   └── validation.ts     # Zod validation schemas
└── public/               # Static assets
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |

## Testing

This project uses Vitest for testing. Tests are located in `__tests__` directories alongside the code they test.

```bash
# Run tests in watch mode
npm test

# Run tests once
npm run test:run
```

### Test Coverage

- **Unit Tests**: Validation schemas (`lib/validation.ts`), utility functions (`lib/utils.ts`)
- **Integration Tests**: Server actions (`app/actions/members.ts`)

## Recent Updates (v0.2.0)

### Security Improvements
- Added server-side input validation using Zod
- Implemented balance check to prevent negative withdrawals
- Added unique member number validation
- Proper timestamp handling (`created_at`, `updated_at`)

### Bug Fixes
- Fixed peer dependency conflicts with React 19
- Fixed recharts `react-is` dependency issue
- Fixed DatePicker for react-day-picker v9 compatibility
- Fixed Badge component variants (success, warning)
- Fixed TypeScript strict mode compliance

### Performance & UX
- Added React Query retry logic (3 attempts, 5min stale time)
- Dynamic year selector (current year + 9 previous)
- Improved loading and error states
- Added pagination support for members and transactions

### Dependencies Upgraded
- Next.js: 15.2.4 → 16.1.6
- react-day-picker: 8.10.1 → 9.5.0
- recharts: latest → 2.14.1
- @supabase/supabase-js: latest → 2.47.0
- @tanstack/react-query: latest → 5.62.0
- date-fns: latest → 4.1.0

### New Files
- `.eslintrc.json` - ESLint configuration
- `.env.example` - Environment variable template
- `lib/validation.ts` - Zod validation schemas

## Database Schema

### Members Table
| Field | Type | Description |
|-------|------|-------------|
| id | serial | Primary key |
| member_no | text | Unique member number |
| full_name | text | Member's full name |
| national_id | text | National ID number |
| status | text | active/resigned/deceased |
| share_balance | numeric | Current share balance |
| bonus_balance | numeric | Current bonus balance |
| total_balance | numeric | Total balance |

### Transactions Table
| Field | Type | Description |
|-------|------|-------------|
| id | serial | Primary key |
| member_id | integer | Foreign key to members |
| transaction_date | date | Transaction date |
| amount_in | numeric | Deposit amount |
| amount_out | numeric | Withdrawal amount |
| share_balance | numeric | Balance after transaction |

## License

MIT
