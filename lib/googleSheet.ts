import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { v4 as uuidv4 } from 'uuid';

// Environment variables
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
const PRIVATE_KEY = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
const SHEET_ID = process.env.GOOGLE_SHEET_ID || '1QhDRcmy_AtJ4ZsxI5bvbRdD6pOM0R_CEthrd3aBSuG8';

if (!SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY || !SHEET_ID) {
    console.error('Missing Google Sheets environment variables');
}

export type Submission = {
    id: string;
    student_id: string;
    title: string;
    score: number | null;
    data: string; // JSON string
    created_at: string;
};

let doc: GoogleSpreadsheet | null = null;

async function getDoc() {
    if (doc) return doc;

    const jwt = new JWT({
        email: SERVICE_ACCOUNT_EMAIL,
        key: PRIVATE_KEY,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const newDoc = new GoogleSpreadsheet(SHEET_ID, jwt);
    await newDoc.loadInfo();
    doc = newDoc;
    return doc;
}

export const googleSheet = {
    /**
     * Insert a new submission row
     */
    async appendSubmission(payload: Omit<Submission, 'id' | 'created_at'> & { id?: string; created_at?: string }) {
        const doc = await getDoc();
        const sheet = doc.sheetsByIndex[0]; // Assume first sheet

        const rowData = {
            id: payload.id || uuidv4(),
            student_id: payload.student_id || '',
            title: payload.title || '',
            score: payload.score ?? '', // Sheet doesn't like null/undefined, use empty string
            data: payload.data, // Should be JSON string
            created_at: payload.created_at || new Date().toISOString(),
        };

        await sheet.addRow(rowData);
        return rowData;
    },

    /**
     * Get submissions with options (filtering, sorting (memory), limit)
     */
    async getSubmissions(options: {
        from?: string; // ISO string
        to?: string;   // ISO string
        limit?: number;
        ascending?: boolean;
    } = {}) {
        const doc = await getDoc();
        const sheet = doc.sheetsByIndex[0];

        const rows = await sheet.getRows();

        // Map to plain objects
        let items = rows.map((row) => ({
            id: row.get('id'),
            student_id: row.get('student_id'),
            title: row.get('title'),
            score: row.get('score') ? Number(row.get('score')) : null,
            data: row.get('data'),
            created_at: row.get('created_at'),
        }));

        // Filter by date
        if (options.from) {
            items = items.filter(i => i.created_at >= options.from!);
        }
        if (options.to) {
            items = items.filter(i => i.created_at <= options.to!);
        }

        // Sort by created_at
        items.sort((a, b) => {
            const tA = new Date(a.created_at).getTime();
            const tB = new Date(b.created_at).getTime();
            return options.ascending ? tA - tB : tB - tA;
        });

        // Limit
        if (options.limit && options.limit > 0) {
            items = items.slice(0, options.limit);
        }

        return items;
    }
};
