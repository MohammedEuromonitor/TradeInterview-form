module.exports = async function (context, req) {
  try {
    const {
      TENANT_ID,
      CLIENT_ID,
      CLIENT_SECRET,
      SHAREPOINT_SITE,
      SP_LIST_NAME
    } = process.env;

    // 1️⃣ Get Graph token
    const tokenResponse = await fetch(
      `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          scope: "https://graph.microsoft.com/.default",
          client_secret: CLIENT_SECRET,
          grant_type: "client_credentials"
        })
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(JSON.stringify(tokenData));
    }

    const accessToken = tokenData.access_token;

    // 2️⃣ Get List Items (only needed fields)
    const listResponse = await fetch(
      `https://graph.microsoft.com/v1.0/sites/${SHAREPOINT_SITE}/lists/${SP_LIST_NAME}/items?$expand=fields($select=Title,field_1,field_2,field_3)`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const listData = await listResponse.json();

    if (!listResponse.ok) {
      throw new Error(JSON.stringify(listData));
    }

    // 3️⃣ Format output
    const formatted = listData.value.map(item => ({
      code: item.fields.field_1,
      category: item.fields.field_2,
      industry: item.fields.field_3,
      companyName: item.fields.NBO
    }));

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: formatted
    };

  } catch (error) {
    context.log("REFERENCE DATA ERROR:", error);
    context.res = {
      status: 500,
      body: error.message
    };
  }
};
