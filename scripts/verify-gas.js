const https = require('https');

const URL = "https://script.google.com/macros/s/AKfycbwS9aCLs-1i_H5UJKNi5LA0LEBAhF_UpXD15tu1SOIrvfMa9u9BrxHjtpdW7Kt6uYL-/exec";

function test() {
    console.log("Testing URL:", URL);

    const fullUrl = URL + "?action=get_students";

    https.get(fullUrl, (res) => {
        // Handle redirects (GAS web apps redirect)
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            console.log("Following redirect to:", res.headers.location);
            https.get(res.headers.location, (res2) => {
                processResponse(res2);
            });
            return;
        }
        processResponse(res);
    }).on('error', (e) => {
        console.error("❌ Request Failed:", e);
    });
}

function processResponse(res) {
    if (res.statusCode !== 200) {
        console.error("GET Failed:", res.statusCode, res.statusMessage);
        res.resume(); // consume response to free memory
        return;
    }

    let rawData = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
        console.log("Content-Type:", res.headers['content-type']);
        if (rawData.trim().startsWith("<")) {
            console.error("❌ Received HTML instead of JSON. Auth error possible.");
            console.log("Snippet:", rawData.substring(0, 200));
        } else {
            try {
                const json = JSON.parse(rawData);
                console.log("✅ JSON Parse Success. Status:", json.status);
                if (json.data) console.log("Items count:", json.data.length);
            } catch (e) {
                console.error("❌ JSON Parse Failed:", e.message);
                console.log("Raw:", rawData.substring(0, 100));
            }
        }
    });
}

test();
