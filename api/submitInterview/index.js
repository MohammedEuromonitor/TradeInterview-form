const fetch = require("node-fetch");

module.exports = async function (context, req) {
  // 1️⃣ Ensure authenticated tenant user
  const principal = req.headers["x-ms-client-principal"];
  if (!principal) {
    context.res = { status: 401 };
    return;
  }

  const user = JSON.parse(
    Buffer.from(principal, "base64").toString("utf8")
  );

  if (user.identityProvider !== "azureActiveDirectory") {
    context.res = { status: 403 };
    return;
  }

  // 2️⃣ Read form data
  const formData = req.body;
  if (!formData) {
    context.res = { status: 400, body: "No data" };
    return;
  }

  // 3️⃣ Trigger Power Automate (secure)
  await fetch(process.env.FLOW_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      submittedBy: user.userDetails,
      data: formData
    })
  });

  context.res = {
    status: 200,
    body: { success: true }
  };
};
