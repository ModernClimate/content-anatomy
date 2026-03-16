# Content Anatomy Builder

A tool for building and presenting content anatomy diagrams. Strategists sync bubble data from Google Sheets, manage stages and swim lanes, and share a read-only client view with commenting.

---

## Prerequisites

- Node.js 22.x (via nvm: `nvm use 22.4.0`)
- A Supabase project with the schema from `supabase/migrations/001_initial_schema.sql`
- A Google Cloud service account with Sheets + Drive API enabled
- (Optional for local API routes) Vercel CLI

---

## Local Setup

### 1. Install dependencies

```bash
nvm use 22.4.0
npm install
```

### 2. Create your environment file

Copy the example and fill in your values:

```bash
cp .env.example .env
```

Open `.env` and set:

```env
# Supabase — found in your Supabase project under Settings > API
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key

# Supabase service role — used by API routes only (never sent to browser)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google service account — found in the JSON key file you downloaded
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-sa@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n"

# Optional — Google Drive folder ID to put new sheets into
GOOGLE_DRIVE_FOLDER_ID=
```

### 3. Run the dev server (frontend only)

```bash
npm run dev
```

The app will be at **http://localhost:5173**.

> **Note:** The `/api/*` routes (Google Sheets sync, invite) are Vercel serverless functions and won't work with `npm run dev` alone. See step 4 if you need them locally.

### 4. Run API routes locally (optional)

Install the Vercel CLI if you haven't already:

```bash
npm install -g vercel
```

Then run:

```bash
vercel dev
```

This starts the full stack at **http://localhost:3000**, including all `/api/*` routes.

> On first run, `vercel dev` will ask you to link to your Vercel project. Select the existing project you have deployed.

---

## Creating Your First Account

Supabase does not have a public sign-up page — accounts are created in one of two ways:

### Option A — Create via Supabase Dashboard (recommended for first admin)

1. Go to your Supabase project → **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter an email and password
4. Go to the app at `http://localhost:5173/login` and log in with those credentials

The `handle_new_user` trigger in the schema automatically creates a `profiles` row when the account is created.

### Option B — Invite via the app (for subsequent users)

Once you have a strategist account logged in:

1. Open any project → **Settings**
2. Under **Team Members**, enter the new user's email and select their role
3. Click **Invite**
   - If the email already has a Supabase account, they are added to the project immediately
   - If not, they receive an invite email with a magic link to set their password

---

## Testing Checklist Before Deploying

Work through this in order in your browser:

- [ ] Log in at `/login` with your test account
- [ ] Dashboard loads — click **New Project**, fill in name and client name
- [ ] Go to project **Settings**, configure stages, swim lanes, and color categories, then **Save Configuration**
- [ ] Click **Create Google Sheet** — a new sheet should open in Google Drive
- [ ] Add a few rows of bubble data in the sheet (use the dropdown validation in column headers)
- [ ] Go to the **Diagram** page — the toolbar should show a **Refresh** button; click it to sync
- [ ] Bubbles appear on the diagram in the correct stage/lane zones
- [ ] Click a bubble — sidebar opens with metadata and comments panel
- [ ] Post a comment — it appears immediately
- [ ] Open the diagram in a second browser tab (or incognito as a client user) — the comment should appear without refreshing (Realtime)
- [ ] Hover over a bubble — connected bubbles highlight, others dim
- [ ] Use **Export → Export as SVG** — file downloads without comment badges
- [ ] Go to `/projects/:id/client` — the client view shows "View Only" with no sync button
- [ ] Open **Settings** → copy the **Client View Link** and confirm it opens the correct project

---

## Keyboard Shortcuts (Diagram page)

| Key | Action |
|-----|--------|
| `Esc` | Close bubble sidebar |
| `Cmd/Ctrl + R` | Refresh from Google Sheet |
| `Cmd/Ctrl + L` | Toggle bubble labels |
| `Cmd/Ctrl + 0` | Reset zoom to 100% |
| `+` / `-` | Zoom in / out |
| Scroll wheel | Zoom |
| `Alt + drag` or middle-click drag | Pan canvas |

---

## Deploying to Vercel

Once local testing passes:

```bash
git add .
git commit -m "Phase 6 complete"
git push
```

Vercel will auto-deploy from your connected branch. Make sure all environment variables from `.env` are also set in your Vercel project under **Settings → Environment Variables**.
