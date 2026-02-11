module.exports = async function (context, req) {
  try {
    // ✅ Auth info injected by Static Web Apps
    const principal = req.headers["x-ms-client-principal"];
    if (!principal) {
      context.res = { status: 401, body: "Not authenticated" };
      return;
    }

    const user = JSON.parse(
      Buffer.from(principal, "base64").toString("utf8")
    );

    if (user.identityProvider !== "aad") {
      context.res = { status: 403, body: "Invalid identity provider" };
      return;
    }

    if (!req.body) {
      context.res = { status: 400, body: "Missing request body" };
      return;
    }

    if (!process.env.FLOW_URL) {
      throw new Error("FLOW_URL is missing in app settings");
    }

    const payload = {
      ...req.body,
      submittedBy: user.userDetails,
      userId: user.userId,
      identityProvider: user.identityProvider
    };

    context.log("Sending payload to Power Automate:", payload);

    // Node 18+/20: fetch is built-in
    const flowResponse = await fetch(process.env.FLOW_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const responseText = await flowResponse.text();

    if (!flowResponse.ok) {
      context.log.error("Flow error:", responseText);
      context.res = {
        status: 502,
        body: "Power Automate call failed"
      };
      return;
    }

    context.res = {
      status: 200,
      body: { success: true }
    };
  } catch (err) {
    context.log.error("submitInterview failed:", err);
    context.res = {
      status: 500,
      body: err.message
    };
  }
};
