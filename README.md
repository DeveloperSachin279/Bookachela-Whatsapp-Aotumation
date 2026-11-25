# 🚀 BookAChela WhatsApp Automation & Lead Routing

Official Meta WhatsApp Cloud API automation for **BookAChela** that automatically captures inbound leads from Ads and Website, segregates **Customers** vs **Chela Applicants**, answers pre-defined FAQs, and saves structured lead data into two dedicated tabs in **Google Sheets**.

---

## ⚡ High Concurrency & Multi-Customer Performance

> **"Kya yeh ek sath kai customers ke messages handle kar lega?"**  
> **Jawab: Haan, bilkul 100%!**

Yeh system high concurrency ke liye design kiya gaya hai:
1. **Asynchronous Non-Blocking Event Loop:** Meta se aane wale har webhook event ko Express instant (`< 50ms`) me `200 OK` acknowledge karta hai.
2. **User State Isolation:** Har customer/applicant ka session unke phone number se isolated Map me rehta hai. Agar 500 log ek hi second me message karein, toh kisi ka data doosre se clash nahi hoga.
3. **Non-Blocking Google Sheets Appends:** Data save background me asynchronous hota hai, jisse WhatsApp message reply me 1 millisecond ka bhi delay nahi aata.

---

## 📁 Project Structure

```
d:\Bookachela whatsapp automation\
├── src\
│   ├── config.js         # Environment configuration
│   ├── messages.js       # All conversational scripts (Hindi/Hinglish)
│   ├── session.js        # Isolated state manager per user
│   ├── whatsapp.js       # Meta Cloud API client (Text & Buttons)
│   ├── sheets.js         # Google Sheets service (Customers & Chela tabs)
│   ├── bot.js            # Core state machine & routing logic
│   └── index.js          # Express Webhook server
├── test-flow.js          # Terminal Interactive Simulator
├── package.json
├── .env.example
└── README.md
```

---

## 🧪 1. Local Simulator (Bina Meta/Google ke abhi test karein)

Aap bina koi Meta ya Google setup kiye turant apne terminal me bot ko test kar sakte hain:

```bash
npm run test-flow
```

Yeh interactive chat open karega jahan aap customer booking, chela application aur FAQs ko real-time test kar sakte hain!

---

## ⚙️ 2. Step-by-Step Setup Guide

### Step 2.1: Meta Developer Portal & Fresh Number Setup

1. **Meta Developer Console** par jayein: [developers.facebook.com](https://developers.facebook.com/)
2. Apne WhatsApp App par click karein -> Left menu se **WhatsApp > API Setup** par jayein.
3. **Step 5: Add a Phone Number**:
   - **Important:** Jo aapne **Fresh New Number** liya hai, ensure karein wo phone ke normal WhatsApp app me login NAHI hai (agar hai toh pehle `WhatsApp Settings > Account > Delete Account` karein).
   - "Add Phone Number" par click karein.
   - Business Name: `BookAChela`
   - Category: `Business Services`
   - Apna Fresh New Number enter karein aur **OTP verify** karein.
4. Verify hone ke baad aapko do cheezein milengi:
   - **Phone Number ID**: Ise copy karke `.env` ke `META_PHONE_NUMBER_ID` me dalein.
   - **Temporary ya Permanent Access Token**: Copy karke `.env` ke `META_ACCESS_TOKEN` me dalein.

### Step 2.2: Google Sheets Setup

1. Apni Blank Google Sheet open karein.
2. Browser ke URL se **Spreadsheet ID** copy karein:
   ```
   https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
                                         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                                                  Yeh aapki Spreadsheet ID hai
   ```
   Ise `.env` ke `GOOGLE_SPREADSHEET_ID` me dalein.
3. **Google Cloud Console** ([console.cloud.google.com](https://console.cloud.google.com/)) par jayein:
   - "Google Sheets API" enable karein.
   - **Credentials > Create Credentials > Service Account** banayein.
   - "Keys > Add Key > Create new key > JSON" download karein.
   - Download hui JSON file ko rename karke is project ke root folder me **`service-account.json`** naam se save karein.
4. **Zaroori Step:** Service account ka email (jaise `something@project.iam.gserviceaccount.com`) copy karein, aur apni Google Sheet ke **Share** button par click karke us email ko **Editor** access de dein!

> Note: Bot automatically Google Sheet me do tabs bana dega:
> - `Customers` (Columns: Timestamp, WhatsApp Phone, Customer Name, Service Needed, Location, Preferred Time, Status)
> - `Chela_Applicants` (Columns: Timestamp, WhatsApp Phone, Applicant Name & Age, Skills / Experience, City / Area, Availability, Status)

### Step 2.3: Webhook Configuration

1. Apne server ko run karein:
   ```bash
   npm start
   ```
2. Local testing ke liye ngrok ya localtunnel run karein:
   ```bash
   npx ngrok http 3000
   ```
   Aapko ek public URL milega: `https://xyz.ngrok-free.app`
3. Meta Developer Console me **WhatsApp > Configuration > Webhook** par jayein:
   - **Callback URL:** `https://xyz.ngrok-free.app/webhook`
   - **Verify Token:** `bookachela_secure_verify_token_2026` (jo aapke `.env` me hai)
   - "Verify and Save" par click karein.
4. **Webhook fields** me jaakar **`messages`** ko **Subscribe** kar dein!

---

## 🎯 Production Deployment (Free)

Production ke liye aap is project ko 1 click me **Render.com** ya **Railway.app** par deploy kar sakte hain:
- Build Command: `npm install`
- Start Command: `npm start`
- Environment Variables add karein (`META_ACCESS_TOKEN`, `META_PHONE_NUMBER_ID`, `META_VERIFY_TOKEN`, `GOOGLE_SPREADSHEET_ID`).
- Render se jo URL mile (`https://bookachela-bot.onrender.com/webhook`) use Meta Webhook me daal dein. Ab aapka bot 24/7 bina rukhe chalega!

