const fetch = require("node-fetch");

async function getAccessToken() {
  const tokenUrl = `https://login.microsoftonline.com/${process.env.SP_TENANT_ID}/oauth2/v2.0/token`;

  const params = new URLSearchParams();
  params.append("client_id", process.env.SP_CLIENT_ID);
  params.append("grant_type", "password");
  params.append("username", process.env.SP_USERNAME);
  params.append("password", process.env.SP_PASSWORD);
  params.append(
    "scope",
    "https://graph.microsoft.com/.default"
  );

  const response = await fetch(tokenUrl, {
    method: "POST",
    body: params
  });

  const data = await response.json();
  console.log("TOKEN RESPONSE:", data);


  if (!data.access_token) {
    throw new Error("Failed to acquire access token");
  }

  return data.access_token;
}

module.exports = async function (context, req) {
  const { type, industry, country } = req.query;

  try {
    const token = await getAccessToken();

    let select = "";
    let filter = "";

    if (type === "industry") {
      select = "field_3";
    }

    if (type === "country" && industry) {
      select = "Title";
      filter = `field_3 eq '${industry}'`;
    }

    if (type === "category" && industry && country) {
      select = "field_2";
      filter = `field_3 eq '${industry}' and Title eq '${country}'`;
    }

    const url =
      `${process.env.SP_SITE_URL}/_api/web/lists/getbytitle('${process.env.SP_LIST_NAME}')/items` +
      `?$select=${select}` +
      (filter ? `&$filter=${filter}` : "");

    const spResponse = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json;odata=nometadata"
      }
    });

    const json = await spResponse.json();

    const values = [
      ...new Set(
        json.value
          .map(item => item[select])
          .filter(Boolean)
      )
    ];

    context.res = {
      status: 200,
      headers: { "Content-Type": "application/json" },
      body: values
    };
  } catch (err) {
    context.log.error(err);
    context.res = {
      status: 500,
      body: { error: "Failed to fetch SharePoint data" }
    };
  }
};
