const fetch = require("node-fetch");

module.exports = async function (context, req) {
  try {
    const formData = req.body;

    const tokenResponse = await fetch(
      `https://login.microsoftonline.com/${process.env.TENANT_ID}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          scope: "https://service.flow.microsoft.com/.default"
        })
      }
    );

    const tokenData = await tokenResponse.json();

    const flowResponse = await fetch(
      "https://api.powerautomate.com/providers/Microsoft.ProcessSimple/flows/<FLOW_ID>/run?api-version=2016-11-01",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      }
    );

    context.res = {
      status: flowResponse.ok ? 200 : 500,
      body: { success: flowResponse.ok }
    };
  } catch (err) {
    context.log(err);
    context.res = { status: 500, body: "Error calling flow" };
  }
};
