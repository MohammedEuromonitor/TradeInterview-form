module.exports = async function (context, req) {

  try {

    const {
      TENANT_ID,
      CLIENT_ID,
      CLIENT_SECRET,
      SHAREPOINT_SITE,
      SP_LIST_NAME
    } = process.env;

    // 1️⃣ Get access token
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

    // 2️⃣ Get SharePoint list items
    const listResponse = await fetch(
      ``https://graph.microsoft.com/v1.0/sites/${SHAREPOINT_SITE_ID}/lists/${SHAREPOINT_LIST_ID}/items?$expand=fields($select=field_3,field_2,Title)`
`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    const listData = await listResponse.json();

    const formatted = listData.value.map(item => ({
      industry: item.fields.field_3,
      category: item.fields.filed_2,
      company: item.fields.Title
    }));

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: formatted
    };

  } catch (error) {
    context.log(error);
    context.res = {
      status: 500,
      body: JSON.stringify(error, null, 2)
    };
  }
};
