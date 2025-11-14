# Supabase Setup Instructions

## Step 1: Run Database Migration

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **SQL Editor** (in the left sidebar)
4. Click **New Query**
5. Copy and paste the following SQL:

```sql
-- Add new columns to classes table
ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS who_for TEXT,
  ADD COLUMN IF NOT EXISTS prerequisites TEXT,
  ADD COLUMN IF NOT EXISTS walk_away_with TEXT,
  ADD COLUMN IF NOT EXISTS what_to_bring TEXT,
  ADD COLUMN IF NOT EXISTS photo_urls TEXT[] DEFAULT '{}';

-- Update default cost_credits to 10
ALTER TABLE public.classes
  ALTER COLUMN cost_credits SET DEFAULT 10;
```

6. Click **Run** (or press Cmd/Ctrl + Enter)
7. Verify the migration succeeded (you should see "Success. No rows returned")

## Step 2: Create Storage Bucket for Photos

1. In your Supabase Dashboard, navigate to **Storage** (in the left sidebar)
2. Click **New bucket**
3. Configure the bucket:
   - **Name**: `class-photos`
   - **Public bucket**: ✅ **Enable this** (check the box)
   - **File size limit**: Leave default or set to your preference (e.g., 5MB)
   - **Allowed MIME types**: Leave empty or add `image/*` to restrict to images only
4. Click **Create bucket**

## Step 3: Set Storage Policies (if needed)

If you want to restrict uploads to authenticated users only:

1. Go to **Storage** → **Policies** → `class-photos`
2. Click **New Policy**
3. Select **For full customization**
4. Add a policy for INSERT:
   - **Policy name**: `Allow authenticated users to upload`
   - **Allowed operation**: `INSERT`
   - **Policy definition**:
   ```sql
   (bucket_id = 'class-photos'::text) AND (auth.role() = 'authenticated'::text)
   ```
5. Click **Review** then **Save policy**

## Step 4: Verify Changes

1. Go to **Table Editor** → `classes` table
2. Verify you can see the new columns:
   - `who_for`
   - `prerequisites`
   - `walk_away_with`
   - `what_to_bring`
   - `photo_urls`
3. Check that `cost_credits` default is now 10

## That's it!

After completing these steps, your application will be ready to use the new class creation fields. The form will now include:
- ✅ Class Title
- ✅ Who The Class is For
- ✅ Prerequisite / You Should Already Know
- ✅ What You Will Walk Away With
- ✅ Description
- ✅ What to Bring
- ✅ Location
- ✅ Date + Time
- ✅ Photos (upload to Supabase Storage)
- ✅ Seats (max 10)
- ✅ Price (auto: 10 credits)

