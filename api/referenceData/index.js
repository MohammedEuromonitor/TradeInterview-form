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
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error("Failed to get access token");
    }

    // 2️⃣ Get list columns (THIS is what we want)
    const columnsResponse = await fetch(
      `https://graph.microsoft.com/v1.0/sites/${SHAREPOINT_SITE}/lists/${SP_LIST_NAME}/columns`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const columnsData = await columnsResponse.json();

    if (!columnsResponse.ok) {
      throw new Error(JSON.stringify(columnsData, null, 2));
    }

    // 3️⃣ Return clean list of column names
    const formatted = columnsData.value.map(col => ({
      displayName: col.displayName,
      internalName: col.name,
      type: Object.keys(col).find(k =>
        ["text", "choice", "number", "dateTime", "boolean"].includes(k)
      ) || "other"
    }));

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: formatted
    };

  } catch (error) {
    context.log("ERROR:", error);
    context.res = {
      status: 500,
      body: error.message
    };
  }
};
