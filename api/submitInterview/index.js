export default async function (context, req) {
  try {
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

    if (!process.env.FLOW_URL) {
      throw new Error("FLOW_URL is missing in app settings");
    }

    const payload = {
      country: req.body.country,
      industry: req.body.industry,
      category: req.body.category,
      comments: req.body.comments,
      submittedBy: user.userDetails,
      userId: user.userId,
      identityProvider: user.identityProvider
    };

    context.log("Sending payload:", payload);

    // ❗ No node-fetch — fetch is built-in on Node 18/20
    const flowResponse = await fetch(process.env.FLOW_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const responseText = await flowResponse.text();

    if (!flowResponse.ok) {
      throw new Error(`Flow error: ${responseText}`);
    }

    context.res = {
      status: 200,
      body: { success: true }
    };
  } catch (err) {
    context.log.error("SubmitInterview failed:", err);
    context.res = {
      status: 500,
      body: err.message
    };
  }
}
