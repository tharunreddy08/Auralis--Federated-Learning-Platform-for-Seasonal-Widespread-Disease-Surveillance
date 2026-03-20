# Fix Federated Learning "Backend Not Running" Error

## Problem
When clicking "Run Federated Learning", you get the error: **"Failed to run federated learning. Make sure the backend is running."**

The actual issue is **Row Level Security (RLS) policies are missing** in your Supabase database.

## Root Cause
The database tables have `DELETE` permission missing from their RLS policies. When the backend tries to:
1. Delete old model from previous rounds
2. Insert new trained model

It fails with RLS violation because the `DELETE` permission is not granted.

## Solution

### Step 1: Apply the RLS Policy Fix in Supabase

1. Go to your **Supabase Dashboard** → **Project** → **SQL Editor**
2. Open the file: `supabase/fix_rls_policies.sql` (in your project)
3. Copy all the SQL code
4. Paste it into the Supabase SQL Editor
5. Click **Run**

This adds the missing:
- `DELETE` policy for `global_models` table
- `DELETE` policy for `model_updates` table

### Step 2: Clear Old Data (If Needed)

If you ran federated learning before and got errors, there might be duplicate data:

```sql
-- Run this in Supabase SQL Editor to clear old training data
DELETE FROM global_models WHERE round_number = 1;
DELETE FROM model_updates WHERE round_number = 1;
```

### Step 3: Test It Works

1. Verify the backend is running: `python main.py` in the `backend/` directory
2. Open the app in your browser
3. Go to **Hospital Simulation** page  
4. Click **"Run Federated Learning"**
5. ✅ It should now work! Watch the training progress.

## Technical Details

### What Changed in the Code

**File**: `backend/federated_learning.py`
- Changed from `upsert()` (requires UPDATE permission) to `delete() + insert()` pattern
- This approach uses only DELETE and INSERT permissions, which are already granted

### Why This Matters

The original code used:
```python
supabase.table('global_models').upsert(global_model_data, on_conflict='round_number').execute()
```

This requires UPDATE permission on the table. For federated learning across multiple rounds, the code now:
1. Deletes the old model for that round
2. Inserts the new trained model

This is cleaner and avoids RLS update conflicts.

## File References

- **Backend code fix**: `backend/federated_learning.py` - Now uses delete+insert instead of upsert
- **Database fix**: `supabase/fix_rls_policies.sql` - Contains the RLS policy statements to apply
- **Migration file**: `supabase/migrations/20260319122634_create_auralis_schema.sql` - Updated with DELETE policies

## Troubleshooting

### Still getting "Backend not running" error?

1. **Check backend is actually running**:
   ```bash
   cd backend
   python main.py
   ```
   You should see: `Application startup complete`

2. **Check if RLS policies were applied**:
   - In Supabase Dashboard → Tables → `global_models`
   - Click **RLS Config** tab
   - You should see policies for SELECT, INSERT, and **DELETE**

3. **Check for duplicate data**:
   ```sql
   SELECT * FROM global_models;
   ```
   If there are multiple rows with `round_number = 1`, delete the old ones:
   ```sql
   DELETE FROM global_models WHERE id != (SELECT id FROM global_models WHERE round_number = 1 ORDER BY created_at DESC LIMIT 1);
   ```

4. **Check database credentials**:
   - Verify `.env` file has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
   - Run: `python seed_data.py` to verify database connectivity

## Next Steps

After fixing this, you can:
1. ✅ Run federated learning training across hospitals
2. ✅ Make disease predictions  
3. ✅ View outbreak alerts
4. ✅ Track model accuracy improvements across rounds

Enjoy your federated learning platform! 🚀
