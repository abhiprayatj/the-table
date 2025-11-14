# Quick Start: Supabase Cloud Setup (No Docker)

## 🚀 Quick Setup (5 minutes)

### 1. Create Dev Supabase Project
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click **"New Project"**
3. Name it: `commonfolk-connect-dev`
4. Choose **Free tier**
5. Create project (takes 2-3 minutes)

### 2. Get Credentials
1. In your project, go to **Settings** → **API**
2. Copy:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### 3. Update `.env.local`
Edit `.env.local` and replace with your dev project credentials:

```bash
VITE_SUPABASE_URL=https://YOUR_DEV_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
```

### 4. Apply Migrations
Go to your dev project → **SQL Editor** and run these migrations in order:

1. Copy content from `supabase/migrations/20251031133931_85b8c9c5-d7a7-4165-a997-0d3180f1e096.sql`
2. Paste and run in SQL Editor
3. Copy content from `supabase/migrations/20251031135545_a677496b-2187-43f5-885b-427d7d485ae0.sql`
4. Paste and run in SQL Editor

### 5. Start Development
```bash
npm run dev
```

Done! Your app now uses your dev Supabase project.

## 📝 What Changed?

- ✅ **No Docker needed** - Using Supabase Cloud instead
- ✅ **Separate dev project** - Isolated from production
- ✅ **Free tier** - No cost for development
- ✅ **Easy setup** - Just create project and add credentials

## 🔄 Daily Workflow

```bash
# Start development (uses dev project from .env.local)
npm run dev

# Create new migration
npm run db:migrate migration_name

# Apply migrations (via Supabase Dashboard SQL Editor)
# Or link project and use: npm run db:push:dev
```

## 📚 Full Documentation

See `SUPABASE_CLOUD_SETUP.md` for detailed instructions.

## 🆘 Need Help?

- **Create project**: [Supabase Dashboard](https://app.supabase.com)
- **Get credentials**: Settings → API
- **Apply migrations**: SQL Editor in Dashboard
- **Full docs**: See `SUPABASE_CLOUD_SETUP.md`

