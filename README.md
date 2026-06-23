# SPMS — Student Progress Management System

A multi-role student progress tracking web application built with React, Vite, TypeScript, Tailwind CSS, and Supabase.

## Roles

| Role | Description |
|------|-------------|
| **Student** | View goals, evaluations, reports, notifications |
| **Instructor** | Manage assigned students, approve goals, submit evaluations |
| **Guardian** | Read-only view of linked student progress |
| **Super Admin** | User management, student/instructor oversight, analytics |
| **Manager** | Executive dashboard, approve final evaluations and performance records, audit logs, exports |

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, React Router v6
- **Backend**: Supabase (Auth, PostgreSQL, Storage)
- **Charts**: Recharts
- **Export**: jsPDF, SheetJS (xlsx)
- **Icons**: lucide-react
- **i18n**: Arabic (RTL) + English

## Setup

### 1. Prerequisites
- Node.js 18+
- A Supabase project

### 2. Clone and install

```bash
git clone https://github.com/your-org/SPMS.git
cd SPMS
npm install
```

### 3. Environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and set your Supabase credentials:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run in development

```bash
npm run dev
```

### 5. Build for production

```bash
npm run build
```

Output goes to `dist/`.

## Deploying to GitHub Pages

1. Push to GitHub
2. Enable GitHub Pages in repo settings → set source to `gh-pages` branch
3. Add GitHub Actions workflow (`.github/workflows/deploy.yml`):

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as repository secrets.

## Project Structure

```
src/
├── components/
│   ├── charts/       # Recharts wrappers
│   ├── layout/       # Sidebar, TopBar, DashboardLayout, AuthLayout
│   ├── permission/   # RequireAuth, RequireRole, Can
│   └── ui/           # Shared UI components (cards, dialogs, toast)
├── contexts/
│   ├── AuthContext   # Supabase auth + role management
│   └── LanguageContext # i18n (en/ar) + RTL switching
├── i18n/
│   ├── en.json
│   └── ar.json
├── pages/
│   ├── auth/
│   ├── student/
│   ├── instructor/
│   ├── guardian/
│   ├── super-admin/
│   └── manager/
├── services/         # Supabase service layer
└── types/            # TypeScript interfaces
```

## Supabase Schema (required tables)

- `users` (public profile, extends auth.users)
- `roles` (id, name)
- `user_roles` (user_id, role_id)
- `programs` (id, name, is_active, ...)
- `program_weeks` (id, program_id, week_number, is_current, ...)
- `students` (id, user_id, program_id, level, dob, ...)
- `student_instructor_assignments`
- `student_guardian_assignments`
- `weekly_goals`
- `evaluation_categories`
- `evaluations`
- `evaluation_scores`
- `recommendations`
- `performance_records`
- `final_evaluations`
- `notifications`
- `audit_logs`
