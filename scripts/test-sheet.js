const fs = require('fs');
const path = require('path');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

// 1. Manually load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            process.env[key] = value;
        }
    });
}

async function testConnection() {
    try {
        const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        // Handle potential escaped newlines in private key
        const rawKey = process.env.GOOGLE_PRIVATE_KEY || '';
        const key = rawKey.replace(/\\n/g, '\n');
        const sheetId = process.env.GOOGLE_SHEET_ID;

        console.log('Testing connection with:');
        console.log('Email:', email);
        console.log('Sheet ID:', sheetId);
        console.log('Key length:', key.length);

        if (!email || !key || !sheetId) {
            throw new Error('Missing environment variables. Please check .env.local');
        }

        const jwt = new JWT({
            email,
            key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const doc = new GoogleSpreadsheet(sheetId, jwt);
        await doc.loadInfo();

        console.log('✅ Connection Successful!');
        console.log('Sheet Title:', doc.title);
        console.log('Sheet Row Count:', doc.sheetsByIndex[0]?.rowCount);
    } catch (error) {
        console.error('❌ Connection Failed:', error.message);
        process.exit(1);
    }
}

testConnection();
