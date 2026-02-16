module.exports = async function (context, req) {
  context.log("referenceData function triggered");

  context.res = {
    status: 200,
    body: "Function is alive"
  };
};
