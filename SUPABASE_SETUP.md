# Supabase Setup Instructions

## 1. Database Schema Setup

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase-schema.sql`
4. Click **Run** to execute the SQL

This will create:
- `journal_entries` table
- Indexes for performance
- Row Level Security (RLS) policies
- Auto-update trigger for `updated_at` timestamp

## 2. Authentication Setup

### Email/Password Auth
- Already enabled by default in Supabase
- No additional configuration needed

### Google OAuth
1. Go to **Authentication** → **Providers** in Supabase dashboard
2. Enable **Google** provider
3. Add your OAuth credentials (Client ID and Secret from Google Cloud Console)
4. Add redirect URLs:
   - `http://localhost:3000/auth/callback` (for local development)
   - `https://your-domain.vercel.app/auth/callback` (for production)

## 3. Environment Variables

### Local Development
Already set up in `.env.local`

### Production (Vercel)
Environment variables are already configured via Vercel CLI.

## 4. Testing

1. Start the dev server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. You should be redirected to `/auth/login`
4. Test:
   - Email/password signup
   - Email/password login
   - Google OAuth (if configured)
   - Create journal entries
   - Edit entries
   - Delete entries

## 5. Verify Database

1. Go to **Table Editor** in Supabase dashboard
2. You should see the `journal_entries` table
3. When you create entries in the app, they should appear here
4. Each entry should have a `user_id` matching the authenticated user

## Troubleshooting

- **"relation journal_entries does not exist"**: Run the SQL schema in Supabase SQL Editor
- **"new row violates row-level security policy"**: Check that RLS policies are created correctly
- **OAuth not working**: Verify redirect URLs are set correctly in Supabase dashboard
- **Environment variables not working**: Restart dev server after adding `.env.local`

