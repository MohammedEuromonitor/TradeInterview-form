module.exports = async function (context, req) {
  try {
    const type = req.query.type;

    let data = [];

    switch (type) {
      case "country":
        data = [
          "United Kingdom",
          "United States",
          "India",
          "Germany",
          "France"
        ];
        break;

      case "industry":
        data = [
          "Retail",
          "Consumer Electronics",
          "Healthcare",
          "Technology",
          "Food & Beverage"
        ];
        break;

      case "category":
        data = [
          "Grocery",
          "Apparel",
          "Beauty & Personal Care",
          "Home Care"
        ];
        break;

      default:
        context.res = {
          status: 400,
          body: { error: "Invalid type parameter" }
        };
        return;
    }

    context.res = {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: data
    };

  } catch (error) {
    context.log.error("Error in referenceData API:", error);

    context.res = {
      status: 500,
      body: { error: "Internal server error" }
    };
  }
};
