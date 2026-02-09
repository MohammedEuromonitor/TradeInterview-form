module.exports = async function (context, req) {
  try {
    context.log("Function hit");

    const principal = req.headers["x-ms-client-principal"];
    context.log("Principal header:", principal);

    if (!principal) {
      context.res = { status: 401, body: "NO_PRINCIPAL" };
      return;
    }

    const user = JSON.parse(
      Buffer.from(principal, "base64").toString("utf8")
    );

    context.log("User:", user);

    context.res = {
      status: 200,
      body: {
        message: "AUTH OK",
        user
      }
    };
  } catch (err) {
    context.log.error("ERROR:", err);
    context.res = {
      status: 500,
      body: err.message
    };
  }
};
