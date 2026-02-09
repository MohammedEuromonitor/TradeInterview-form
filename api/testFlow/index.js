const fetch = require("node-fetch");

module.exports = async function (context, req) {
  try {
    if (!process.env.FLOW_URL) {
      context.res = {
        status: 500,
        body: "FLOW_URL missing"
      };
      return;
    }

    const payload = {
      test: "hello from azure function",
      timestamp: new Date().toISOString()
    };

    const response = await fetch(process.env.FLOW_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();

    context.res = {
      status: response.status,
      body: {
        flowStatus: response.status,
        flowResponse: text
      }
    };
  } catch (err) {
    context.log.error(err);
    context.res = {
      status: 500,
      body: err.message
    };
  }
};
