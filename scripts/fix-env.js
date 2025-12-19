const fs = require('fs');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env.local');

try {
    const content = fs.readFileSync(envPath, 'utf8');
    let data;
    try {
        data = JSON.parse(content);
    } catch (e) {
        console.log('File is not JSON, assuming it is already env format or invalid.');
        process.exit(0);
    }

    // Extract fields
    const email = data.client_email;
    const privateKey = data.private_key;
    const sheetId = '1QhDRcmy_AtJ4ZsxI5bvbRdD6pOM0R_CEthrd3aBSuG8'; // Hardcode known ID

    if (!email || !privateKey) {
        console.error('Missing email or private_key in JSON');
        process.exit(1);
    }

    // Format as ENV
    // Note: We quote the private key to handle newlines
    const newContent = `GOOGLE_SHEET_ID=${sheetId}
GOOGLE_SERVICE_ACCOUNT_EMAIL=${email}
GOOGLE_PRIVATE_KEY="${privateKey}"
`;

    fs.writeFileSync(envPath, newContent, 'utf8');
    console.log('Successfully converted .env.local to KEY=VALUE format.');

} catch (e) {
    console.error('Error fixing env:', e);
    process.exit(1);
}
