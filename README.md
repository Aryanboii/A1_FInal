# A1 Infratech – Website + CRM (Vercel + Supabase)

Website: `/`   ·   CRM: `/crm` (login with CRM_USER / CRM_PASS)

All enquiry and channel-partner forms save into the Supabase table `leads`. Nothing is stored on the server disk,
so leads can never disappear when Vercel redeploys or restarts. Leads are only removed when you delete them in the CRM.

## One-time setup
1. **Supabase** -> SQL Editor -> run `supabase.sql` (skip if you already ran it - the table is unchanged).
   Project Settings -> API: copy the *Project URL* and the *service_role* key (keep it secret).
2. **GitHub**: replace the contents of your repo with this folder, commit and push.
3. **Vercel**: Add New -> Project -> import the repo (Framework: "Other"; `vercel.json` already sets everything).
   Before deploying add Environment Variables:
   - `SUPABASE_URL`  = your Project URL
   - `SUPABASE_SERVICE_KEY` = the service_role key
   - `CRM_USER`, `CRM_PASS` = your CRM login (use a strong password)
   - optional: `SESSION_SECRET` (any long random text), `LEAD_WEBHOOK_URL` (n8n/Zapier URL called for every new lead)
4. Deploy, open the site, submit a test enquiry, then log in at `/crm` - the lead should be there.

## Local test (optional)
`SUPABASE_URL=... SUPABASE_SERVICE_KEY=... CRM_PASS=... node dev.js` -> http://localhost:3000

## Folders
- `public/` website (`index.html`, `crm.html`) and `assets/` (photos + compressed videos)
- `api/` serverless functions (leads, login, export) · `vercel.json` routes · `supabase.sql` table
