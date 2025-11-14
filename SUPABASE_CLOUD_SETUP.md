# Supabase Cloud Development Setup (No Docker Required)

This setup uses a **separate Supabase Cloud project** for development, which means:
- ✅ **No Docker required**
- ✅ Separate from production (Lovable Cloud)
- ✅ Full Supabase features (Auth, Storage, Database)
- ✅ Free tier available
- ✅ Easy to reset/clean up
- ✅ Access via Supabase Dashboard

## Step 1: Create a Development Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: `commonfolk-connect-dev` (or any name you prefer)
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is fine for development
4. Click **"Create new project"**
5. Wait 2-3 minutes for the project to be created

## Step 2: Get Your Project Credentials

1. In your new project, go to **Settings** → **API**
2. Copy the following:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Step 3: Get Your Project Reference ID

1. Go to **Settings** → **General**
2. Copy the **Reference ID** (looks like: `abcdefghijklmnop`)

## Step 4: Configure Environment Variables

Update `.env.local` with your dev project credentials:

```bash
# Development Supabase Project (Cloud)
VITE_SUPABASE_URL=https://YOUR_DEV_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-dev-project-anon-key
```

Replace:
- `YOUR_DEV_PROJECT_REF` with your project reference ID
- `your-dev-project-anon-key` with your anon key from Step 2

## Step 5: Link Your Project (Optional but Recommended)

This allows you to use Supabase CLI to push migrations:

```bash
# Link to your dev project
npm run db:link
# Or manually:
npx supabase link --project-ref YOUR_DEV_PROJECT_REF
```

You'll need your database password when linking.

## Step 6: Apply Migrations to Dev Project

Apply your existing migrations to the dev project:

### Option A: Using Supabase Dashboard (Easiest)

1. Go to your dev project in [Supabase Dashboard](https://app.supabase.com)
2. Go to **SQL Editor**
3. Copy and paste the contents of each migration file from `supabase/migrations/`
4. Run them in order (oldest first):
   - `20251031133931_85b8c9c5-d7a7-4165-a997-0d3180f1e096.sql`
   - `20251031135545_a677496b-2187-43f5-885b-427d7d485ae0.sql`
5. Click **"Run"** for each migration

### Option B: Using Supabase CLI (After Linking)

```bash
# Push all migrations to dev project
npm run db:push:dev
# Or manually:
npx supabase db push --project-ref YOUR_DEV_PROJECT_REF
```

## Step 7: Start Development

```bash
# Start your app (will use dev project from .env.local)
npm run dev
```

Your app will now use your dev Supabase project!

## Available Commands

```bash
# Create a new migration
npm run db:migrate migration_name

# Push migrations to dev project (after linking)
npm run db:push:dev

# Link to dev project
npm run db:link

# Generate TypeScript types from dev database
npm run db:types

# Start dev server (uses dev project from .env.local)
npm run dev
```

## Environment Setup

### Development (`.env.local`)
- Uses your separate dev Supabase Cloud project
- Safe to test and reset
- Completely isolated from production

### Production (`.env` or Lovable Cloud settings)
- Uses production Supabase from Lovable
- Never modified during development
- Protected and separate

## Switching Between Dev and Production

### Use Dev Project (Development)
- Make sure `.env.local` exists with dev project credentials
- Run `npm run dev` - it automatically uses `.env.local`
- Your app connects to dev Supabase Cloud project

### Use Production (Deployment)
- Remove or rename `.env.local`
- Set production env vars in Lovable Cloud settings
- Your app will use production Supabase

## Creating New Migrations

1. **Create migration file**:
   ```bash
   npm run db:migrate add_new_feature
   ```
   This creates a new file in `supabase/migrations/`

2. **Edit the migration file** with your SQL changes

3. **Apply to dev project**:
   - **Option A**: Copy SQL to Supabase Dashboard SQL Editor
   - **Option B**: Use CLI (after linking): `npm run db:push:dev`

4. **Apply to production** (when ready):
   - Copy SQL to Lovable Cloud SQL Editor
   - Or use Supabase CLI: `npx supabase db push --project-ref production-project-ref`

## Resetting Dev Database

If you need to reset your dev database:

1. **Via Dashboard**:
   - Go to your dev project
   - Settings → Database → Reset database
   - Re-run all migrations

2. **Via CLI** (after linking):
   ```bash
   npm run db:reset
   ```

## Accessing Supabase Studio

Your dev project has its own Supabase Studio:
- Go to [Supabase Dashboard](https://app.supabase.com)
- Select your dev project
- Click **"Table Editor"** or **"SQL Editor"**
- Full access to database, auth, storage, etc.

## Benefits of Cloud Setup (vs Docker)

✅ **No Docker required** - No need to install or run Docker Desktop
✅ **Always available** - Access from anywhere, no local setup needed
✅ **Easy sharing** - Team members can use the same dev project
✅ **Free tier** - No cost for development
✅ **Production-like** - Same environment as production
✅ **Easy reset** - Reset database with one click
✅ **Managed** - Supabase handles backups, scaling, etc.

## Troubleshooting

### Migration Errors
**Error**: Migration fails to apply

**Solution**:
- Check SQL syntax in migration file
- Ensure migrations are run in order
- Check Supabase Dashboard logs for detailed error messages

### Connection Issues
**Error**: Cannot connect to Supabase

**Solution**:
- Verify `.env.local` has correct URL and key
- Check Supabase Dashboard - is project active?
- Verify network connection

### Project Not Found
**Error**: Project reference not found

**Solution**:
- Double-check project reference ID in `.env.local`
- Verify project exists in Supabase Dashboard
- Make sure you're using the correct credentials

## Next Steps

1. ✅ Create dev Supabase project
2. ✅ Copy credentials to `.env.local`
3. ✅ Apply migrations to dev project
4. ✅ Run `npm run dev` to start development
5. ✅ Test creating an account - it will be stored in dev project!

## Important Notes

- **Dev project is separate** - Changes don't affect production
- **Migrations are shared** - Same migration files for dev and production
- **Free tier limits** - Free tier has limits, but enough for development
- **Production is protected** - Never modify production directly
- **Backup dev data** - Export data if needed before resetting

## Resources

- [Supabase Dashboard](https://app.supabase.com)
- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Database Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Free Tier Limits](https://supabase.com/pricing)

