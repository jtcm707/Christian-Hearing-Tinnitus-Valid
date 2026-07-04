# Christian Hearing & Tinnitus — Referral Landing Page

A fast, accessible, single web page. Visitors refer a friend and **both receive
20% off** during the Independence Week promotion. It's a plain static site — no
build step — so it runs straight from **Cloudflare Pages**. Referral
submissions save to **Supabase**, which you can connect now or later.

## What's in this repo

These files sit at the **root** of the repo. That's important: Cloudflare Pages
will serve this folder directly.

```
index.html          the page
styles.css          styling
script.js           form validation + Supabase submit
config.js           your PUBLIC Supabase URL + anon key (placeholders for now)
_headers            security + caching rules for Cloudflare Pages
assets/             logo + favicons
supabase/schema.sql run this in Supabase when you're ready to save referrals
```

The page works right away in **demo mode**: the form validates and shows the
success screen, but nothing is saved until you add Supabase keys (Step 3 below).

---

## Step 1 — Put the files in a GitHub repo

Unzip this download. Make sure `index.html` ends up at the **top level** of your
repository (not inside a subfolder). Two easy ways:

**Web upload:** On GitHub, create a new repo → **Add file → Upload files** →
drag in everything from the unzipped folder (`index.html`, `assets/`,
`config.js`, `styles.css`, `script.js`, `_headers`, `supabase/`, `README.md`) →
**Commit**.

**Command line:**
```bash
cd path/to/unzipped-folder
git init
git add .
git commit -m "Referral landing page"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

---

## Step 2 — Deploy on Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
2. Authorize GitHub and pick your repo.
3. Set the build settings:
   - **Framework preset:** `None`
   - **Build command:** *(leave empty)*
   - **Build output directory:** `/`  *(root — this repo has no build step)*
4. Click **Save and Deploy**.

Cloudflare gives you a URL like `https://<your-project>.pages.dev` — that's your
live page in the browser. Every push to `main` redeploys automatically. You can
add your own domain later under the project's **Custom domains** tab.

---

## Step 3 — Connect Supabase (do this whenever you're ready)

The page is live without this; do it when you want to start collecting referrals.

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor → New query** → paste all of `supabase/schema.sql` → **Run**.
   This creates the `referrals` table with security rules (the public can submit
   referrals but can't read anyone's data back).
3. **Project Settings → API** → copy your **Project URL** and **anon public** key.
4. Open `config.js`, replace the two placeholder values, and commit the change.
   Cloudflare Pages redeploys on its own and the form starts saving.

Both of those values are **public** by design — the anon key is meant to live in
browser code, and Row Level Security protects your data. Review submissions in
the Supabase **Table editor**. Never put the `service_role` key in this repo.

---

## Preview it locally (optional)

```bash
python3 -m http.server 8080    # run from the folder with index.html
# then open http://localhost:8080
```

## Customizing

- **Discount / promo copy:** edit the hero and button text in `index.html`
  (currently **20%**). Each saved row is tagged `promo_code: 'JULY4-20'` in
  `script.js`.
- **Phone number:** replace the placeholder `(704) 555-0100` in `index.html`
  (it's in the header, footer, and success screen).
- **Logo:** swap the files in `assets/`. `logo-icon.png` is the tab icon, header
  mark, and hero image; `logo-white.png` is the footer version.
- **Colors / spacing / fonts:** all live as tokens in `:root` at the top of
  `styles.css`.
