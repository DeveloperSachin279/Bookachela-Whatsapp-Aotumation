const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const config = require('./config');

class SheetsService {
  constructor() {
    this.sheets = null;
    this.initialized = false;
    this.initPromise = this.init();
  }

  async init() {
    try {
      if (!config.google.spreadsheetId) {
        console.warn('[Google Sheets] Warning: GOOGLE_SPREADSHEET_ID is not configured in .env');
        return;
      }

      let auth;
      if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
        const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
        auth = new google.auth.GoogleAuth({
          credentials,
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
      } else {
        const keyPath = path.resolve(config.google.serviceAccountKeyFile);
        if (!fs.existsSync(keyPath)) {
          console.warn(`[Google Sheets] Warning: Service account file not found at: ${keyPath}`);
          console.warn(`[Google Sheets] Leads will be logged to console until service-account.json or GOOGLE_SERVICE_ACCOUNT_JSON is added.`);
          return;
        }
        auth = new google.auth.GoogleAuth({
          keyFile: keyPath,
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
      }

      this.sheets = google.sheets({ version: 'v4', auth });
      this.initialized = true;
      console.log('[Google Sheets] Successfully initialized Google Sheets API client.');

      // Ensure sheets tabs exist with proper header rows
      await this.ensureTabsAndHeaders();
    } catch (err) {
      console.error('[Google Sheets Init Error]:', err.message);
    }
  }

  async ensureTabsAndHeaders() {
    if (!this.initialized || !this.sheets) return;

    try {
      const spreadsheet = await this.sheets.spreadsheets.get({
        spreadsheetId: config.google.spreadsheetId,
      });

      const existingSheets = spreadsheet.data.sheets.map(s => s.properties.title);

      const requiredTabs = [
        {
          title: 'Customers',
          headers: ['Timestamp (IST)', 'WhatsApp Phone', 'Customer Name', 'Service Needed', 'Location', 'Preferred Time', 'Status']
        },
        {
          title: 'Chela_Applicants',
          headers: ['Timestamp (IST)', 'WhatsApp Phone', 'Applicant Name & Age', 'Skills / Experience', 'City / Area', 'Availability', 'Status']
        }
      ];

      for (const tab of requiredTabs) {
        if (!existingSheets.includes(tab.title)) {
          // Create tab
          await this.sheets.spreadsheets.batchUpdate({
            spreadsheetId: config.google.spreadsheetId,
            requestBody: {
              requests: [
                {
                  addSheet: {
                    properties: { title: tab.title }
                  }
                }
              ]
            }
          });
          console.log(`[Google Sheets] Created new tab: "${tab.title}"`);

          // Add headers
          await this.sheets.spreadsheets.values.update({
            spreadsheetId: config.google.spreadsheetId,
            range: `${tab.title}!A1:G1`,
            valueInputOption: 'USER_ENTERED',
            requestBody: {
              values: [tab.headers]
            }
          });
          console.log(`[Google Sheets] Added headers to: "${tab.title}"`);
        }
      }
    } catch (err) {
      console.error('[Google Sheets EnsureTabs Error]:', err.message);
    }
  }

  getTimestampIST() {
    const now = new Date();
    return now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: true });
  }

  async saveCustomerLead({ phone, name, service, location, urgency }) {
    await this.initPromise;

    const timestamp = this.getTimestampIST();
    const row = [timestamp, phone, name || '', service || '', location || '', urgency || '', 'New Lead'];

    console.log('[Lead Capture - Customer]:', JSON.stringify({ phone, name, service, location, urgency }));

    if (!this.initialized || !this.sheets) {
      console.warn('[Google Sheets] Data logged to console only (Google Sheets not connected yet).');
      return;
    }

    try {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: config.google.spreadsheetId,
        range: 'Customers!A:G',
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [row]
        }
      });
      console.log(`[Google Sheets] Appended customer lead row for ${phone} to "Customers" tab.`);
    } catch (err) {
      console.error('[Google Sheets Append Customer Error]:', err.message);
    }
  }

  async saveChelaApplicant({ phone, nameAge, skills, location, workType }) {
    await this.initPromise;

    const timestamp = this.getTimestampIST();
    const row = [timestamp, phone, nameAge || '', skills || '', location || '', workType || '', 'Pending Screening'];

    console.log('[Lead Capture - Chela Applicant]:', JSON.stringify({ phone, nameAge, skills, location, workType }));

    if (!this.initialized || !this.sheets) {
      console.warn('[Google Sheets] Data logged to console only (Google Sheets not connected yet).');
      return;
    }

    try {
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: config.google.spreadsheetId,
        range: 'Chela_Applicants!A:G',
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [row]
        }
      });
      console.log(`[Google Sheets] Appended Chela applicant row for ${phone} to "Chela_Applicants" tab.`);
    } catch (err) {
      console.error('[Google Sheets Append Chela Error]:', err.message);
    }
  }
}

module.exports = new SheetsService();
