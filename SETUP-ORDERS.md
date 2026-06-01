# KarakoramStore — Email + Orders Dashboard Setup

When a customer submits an order, you should receive email at **munashirmehdi@gmail.com**.

## View orders (Web3Forms dashboard — active now)

1. Open [https://app.web3forms.com/](https://app.web3forms.com/)
2. Log in with **munashirmehdi@gmail.com**
3. Open form **KarakoramStore Orders** — every website order appears there

Or on your site: **admin.html** → **Open Web3Forms dashboard**

---

## Recommended: Web3Forms (5 minutes — reliable email)

1. Open [https://web3forms.com](https://web3forms.com) → create access key with **munashirmehdi@gmail.com**
2. Copy your **Access Key**
3. In `js/site.js` set:
   ```javascript
   web3formsAccessKey: "paste-your-key-here",
   ```
4. Save → push to GitHub. Orders email you instantly (no activation step).

---

## Fallback: FormSubmit (if Web3Forms key is empty)

The site redirects through FormSubmit to send mail. **You must activate once:**

1. Submit a test order on the live site
2. Check **munashirmehdi@gmail.com** and **Spam** for email from **FormSubmit**
3. Click **Activate Form** in that email
4. Submit another test — order emails should arrive

Until activation, the website may say “Order sent” but **no order email** is delivered.

---

## Dashboard (optional — Google Sheet + admin.html)

Vercel only hosts website files. For the **orders table** at `admin.html`, complete this one-time Google setup (~10 minutes).

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
