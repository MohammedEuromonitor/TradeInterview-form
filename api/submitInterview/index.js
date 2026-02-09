module.exports = async function (context, req) {
  try {
    // 1️⃣ Ensure authenticated user
    const principalHeader = req.headers["x-ms-client-principal"];
    if (!principalHeader) {
      context.res = { status: 401, body: "Unauthorized" };
      return;
    }

    const user = JSON.parse(
      Buffer.from(principalHeader, "base64").toString("utf8")
    );

    if (user.identityProvider !== "azureActiveDirectory") {
      context.res = { status: 403, body: "Forbidden" };
      return;
    }

    // 2️⃣ Read JSON body (THIS WAS THE BUG)
    const formData = await req.json();
    if (!formData) {
      context.res = { status: 400, body: "No data received" };
      return;
    }

    // 3️⃣ Call Power Automate
    const flowResponse = await fetch(process.env.FLOW_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submittedBy: user.userDetails,
        userId: user.userId,
        identityProvider: user.identityProvider,
        data: formData
      })
    });

    if (!flowResponse.ok) {
      const errorText = await flowResponse.text();
      context.log.error("Flow failed:", errorText);
      context.res = { status: 500, body: "Flow invocation failed" };
      return;
    }

    context.res = {
      status: 200,
      body: { success: true }
    };
  } catch (err) {
    context.log.error("submitInterview error:", err);
    context.res = { status: 500, body: "Internal Server Error" };
  }
};
