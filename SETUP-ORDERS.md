# KarakoramStore — Email + Orders Dashboard Setup

When a customer submits a **COD order**, you will receive:

1. **Email** at **munashirmehdi@gmail.com**
2. **Google Sheet** row (your spreadsheet dashboard)
3. **Website dashboard** at `admin.html` (password protected)

Vercel only hosts the website files — you need this **one-time free Google setup** (about 10 minutes).

---

## Step 1 — Create the orders spreadsheet

1. Open [Google Sheets](https://sheets.google.com) → **Blank spreadsheet**
2. Name it: `KarakoramStore Orders`
3. Copy the **Sheet ID** from the browser URL:
   ```
   https://docs.google.com/spreadsheets/d/THIS_PART_IS_THE_SHEET_ID/edit
   ```

---

## Step 2 — Install the order script

1. Open [Google Apps Script](https://script.google.com) → **New project**
2. Delete any sample code
3. Open the file `google-apps-script/OrdersBackend.gs` in this project → **copy all code** → paste into Apps Script
4. Edit the top of the script:
   - `SHEET_ID` → paste your Sheet ID from Step 1
   - `NOTIFY_EMAIL` → already `munashirmehdi@gmail.com`
   - `ADMIN_PASSWORD` → choose a secret password (e.g. change `karakoram2026` to something only you know)
5. Menu **Run** → select `setupSheet` → **Run** → allow permissions when Google asks
6. **Deploy** → **New deployment** → type **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
7. Click **Deploy** → copy the **Web App URL** (starts with `https://script.google.com/macros/s/...`)

---

## Step 3 — Connect the website

1. Open `js/site.js` in this project
2. Paste your Web App URL:
   ```javascript
   orderApiUrl: "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec",
   ```
3. Set the same password you used in the script:
   ```javascript
   adminPassword: "your-secret-password",
   ```
4. Save → commit → push to GitHub (Vercel will redeploy in ~1 minute)

---

## Step 4 — Use your dashboard

| What | Where |
|------|--------|
| **Email** | munashirmehdi@gmail.com (each new order) |
| **Spreadsheet** | Your Google Sheet "KarakoramStore Orders" |
| **Web dashboard** | `https://your-site.vercel.app/admin.html` |

Footer link: **Orders dashboard** → login with your `ADMIN_PASSWORD`.

---

## Test an order

1. Open your live site → **Order / Contact**
2. Fill the form → **Submit COD Order**
3. Check:
   - Email inbox (munashirmehdi@gmail.com)
   - Google Sheet (new row)
   - `admin.html` (order in table)

---

## Optional: email-only shortcut (no dashboard)

If you want email without Google Script:

1. Sign up at [Web3Forms](https://web3forms.com) with **munashirmehdi@gmail.com**
2. Copy your **Access Key**
3. In `js/site.js` set: `web3formsAccessKey: "your-key"`
4. You get emails but **no** spreadsheet/dashboard until you complete Steps 1–3 above.

---

## Troubleshooting

- **No email?** Check spam. Re-run `setupSheet` and redeploy the web app after any script change.
- **Dashboard “Unauthorized”?** Password in `site.js` must match `ADMIN_PASSWORD` in Apps Script.
- **Form says “Opening WhatsApp”?** `orderApiUrl` is empty or wrong — complete Step 3.
