# Local Supabase Development Setup

This project is now configured to use a local Supabase instance for development, separate from your production Supabase (Lovable Cloud).

## Prerequisites

1. **Docker Desktop** - Must be installed and running
   - Download from: https://www.docker.com/products/docker-desktop
   - Make sure Docker Desktop is running before starting Supabase

2. **Node.js & npm** - Already installed ✓

## Quick Start

### 1. Install Dependencies (if not already done)
```bash
npm install
```

### 2. Start Docker Desktop
Make sure Docker Desktop is running on your machine.

### 3. Start Local Supabase
```bash
npm run supabase:start
```

This will:
- Download and start Docker containers for Supabase
- Start PostgreSQL database on port 54322
- Start Supabase API on port 54321
- Start Supabase Studio on port 54323
- Apply all migrations from `supabase/migrations/`

**Note**: First run may take a few minutes as Docker images are downloaded.

### 4. Access Supabase Studio
Open your browser to: http://localhost:54323

This is a web UI where you can:
- View and edit your database tables
- Run SQL queries
- Manage authentication
- View logs

### 5. Start Your Development Server
```bash
npm run dev
```

Your app will automatically use the local Supabase instance (configured in `.env.local`).

## Available Commands

```bash
# Start local Supabase
npm run supabase:start

# Stop local Supabase
npm run supabase:stop

# Reset database (apply all migrations)
npm run supabase:reset

# Check Supabase status
npm run supabase:status

# Create a new migration
npm run supabase:migrate migration_name

# Open Supabase Studio
npm run supabase:studio

# Start dev server (uses local Supabase)
npm run dev
```

## Environment Variables

### Local Development (`.env.local`)
- **VITE_SUPABASE_URL**: `http://localhost:54321`
- **VITE_SUPABASE_PUBLISHABLE_KEY**: Local anon key (automatically generated)

### Production (Lovable Cloud)
Your production environment variables are set in Lovable's environment settings and are separate from local development.

## Database Migrations

All migrations are stored in `supabase/migrations/` and are shared between:
- Local development (applied when you run `supabase:reset`)
- Production (apply manually via Lovable or Supabase Dashboard)

### Creating a New Migration

1. Create migration file:
   ```bash
   npm run supabase:migrate add_column_to_table
   ```

2. Edit the generated SQL file in `supabase/migrations/`

3. Apply locally:
   ```bash
   npm run supabase:reset
   ```

4. For production, apply via:
   - Lovable Cloud interface, or
   - Supabase Dashboard SQL Editor, or
   - Supabase CLI: `supabase db push --project-ref your-project-ref`

## Switching Between Local and Production

### Use Local (Development)
- Make sure `.env.local` exists with local credentials
- Run `npm run dev` - it automatically uses `.env.local`

### Use Production (Lovable)
- Remove or rename `.env.local`
- Set production env vars in Lovable Cloud settings
- Your app will use production Supabase

## Troubleshooting

### Docker Not Running
**Error**: `Cannot connect to the Docker daemon`

**Solution**: Start Docker Desktop and wait for it to fully start, then try again.

### Port Already in Use
**Error**: `port 54321 is already in use`

**Solution**: 
- Check if Supabase is already running: `npm run supabase:status`
- Stop it: `npm run supabase:stop`
- Or change ports in `supabase/config.toml`

### Migration Errors
**Error**: Migration fails to apply

**Solution**:
- Check migration SQL syntax
- Ensure migrations are in correct order
- Reset database: `npm run supabase:reset`

### Database Connection Issues
**Error**: Cannot connect to local Supabase

**Solution**:
- Verify Supabase is running: `npm run supabase:status`
- Check `.env.local` has correct URL: `http://localhost:54321`
- Restart Supabase: `npm run supabase:stop && npm run supabase:start`

## Local Supabase Credentials

When you run `supabase start`, you'll see output like:

```
API URL: http://localhost:54321
GraphQL URL: http://localhost:54321/graphql/v1
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
Studio URL: http://localhost:54323
anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The default anon key for local development is:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

## Next Steps

1. ✅ Install Docker Desktop
2. ✅ Run `npm run supabase:start`
3. ✅ Verify Supabase Studio at http://localhost:54323
4. ✅ Run `npm run dev` to start your app
5. ✅ Test creating an account - it will be stored locally!

## Important Notes

- **Local data is isolated** - Changes in local Supabase don't affect production
- **Migrations are shared** - Migration files apply to both local and production
- **Production is separate** - Your Lovable Cloud Supabase remains untouched
- **Docker required** - Local Supabase runs in Docker containers
- **Ports used**: 
  - 54321: API
  - 54322: PostgreSQL
  - 54323: Studio

## Resources

- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Local Development Guide](https://supabase.com/docs/guides/cli/local-development)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)

