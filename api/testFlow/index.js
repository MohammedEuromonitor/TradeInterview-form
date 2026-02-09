const https = require('https');

module.exports = async function (context, req) {
    // 1. Get your flow URL from Environment Variables (set this in Azure Portal)
    const flowUrl = process.env["POWER_AUTOMATE_URL"];
    
    if (!flowUrl) {
        context.res = { status: 500, body: "Power Automate URL is not configured." };
        return;
    }

    // 2. Prepare the data to send
    const postData = JSON.stringify(req.body || { message: "Test from Azure Function" });

    // 3. Configure the HTTP Request
    const url = new URL(flowUrl);
    const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    // 4. Send the request
    return new Promise((resolve, reject) => {
        const flowRequest = https.request(options, (res) => {
            context.log(`Flow responded with status: ${res.statusCode}`);
            context.res = { status: res.statusCode, body: "Flow Triggered" };
            resolve();
        });

        flowRequest.on('error', (e) => {
            context.log.error(`Flow request failed: ${e.message}`);
            context.res = { status: 500, body: e.message };
            resolve();
        });

        flowRequest.write(postData);
        flowRequest.end();
    });
};
