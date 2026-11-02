# A1 Infratech - Website + CRM (Vercel + Supabase)

Website: `/`  -  CRM: `/crm` (login with CRM_USER / CRM_PASS)  -  Health check: `/api/health`

All enquiry and channel-partner forms save into the Supabase table `leads`. Nothing is stored on the server disk, so leads never disappear
when Vercel redeploys. Leads are removed only when you delete them in the CRM.

## One-time setup
1. **Supabase** -> SQL Editor -> run `supabase.sql` (skip if already done). Project Settings -> API Keys: copy the Project URL and the **secret** key
   (`sb_secret_...`) or the legacy `service_role` key. Never use the publishable / anon key.
2. **GitHub**: replace the repo contents with this folder, commit and push.
3. **Vercel**: import the repo (Framework "Other"; `vercel.json` sets the rest). Environment Variables:
   `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `CRM_USER`, `CRM_PASS` (strong password); optional `SESSION_SECRET`, `LEAD_WEBHOOK_URL`.
4. Deploy, open `https://YOUR-DOMAIN/api/health` (it must say `"ok": true`), submit a test enquiry and check `/crm`.

## If a form shows an error
Open `/api/health`: it says exactly what is wrong (missing variables, wrong key type, or missing `leads` table). Fix it, then redeploy.

## Connecting your domain
Vercel -> Project -> Settings -> Domains -> add your domain, then add the DNS records Vercel shows at your domain provider
(usually A `76.76.21.21` for the root domain and CNAME `cname.vercel-dns.com` for `www`; use the exact values Vercel displays).

## Local test
`SUPABASE_URL=... SUPABASE_SERVICE_KEY=... CRM_PASS=... node dev.js` -> http://localhost:3000

## Folders
`public/` website + CRM + assets - `api/` serverless functions - `vercel.json` routes/headers - `supabase.sql` table
