const fetch = require("node-fetch");

module.exports = async function (context, req) {
  try {
    // 1️⃣ Auth check
    const principal = req.headers["x-ms-client-principal"];
    if (!principal) {
      context.res = { status: 401, body: "Not authenticated" };
      return;
    }

    const user = JSON.parse(
      Buffer.from(principal, "base64").toString("utf8")
    );

    if (user.identityProvider !== "azureActiveDirectory") {
      context.res = { status: 403, body: "Forbidden" };
      return;
    }

    // 2️⃣ Validate body
    if (!req.body) {
      context.res = { status: 400, body: "Missing body" };
      return;
    }

    // 3️⃣ Call Power Automate
    const flowResponse = await fetch(process.env.FLOW_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        country: req.body.country,
        industry: req.body.industry,
        category: req.body.category,
        comments: req.body.comments,
        submittedBy: user.userDetails,
        userId: user.userId,
        identityProvider: user.identityProvider
      })
    });

    if (!flowResponse.ok) {
      const text = await flowResponse.text();
      throw new Error(`Flow failed: ${text}`);
    }

    context.res = {
      status: 200,
      body: { success: true }
    };
  } catch (err) {
    context.log.error(err);
    context.res = {
      status: 500,
      body: err.message
    };
  }
};
