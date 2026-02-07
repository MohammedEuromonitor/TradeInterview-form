module.exports = async function (context, req) {
  const { type, industry, country } = req.query;

  const data = {
    Retail: {
      "United Kingdom": ["Grocery", "Apparel"],
      India: ["Food", "Clothing"]
    },
    Technology: {
      "United States": ["Software", "Hardware"],
      Germany: ["AI", "Cloud"]
    }
  };

  let result = [];

  if (type === "industry") {
    result = Object.keys(data);
  }

  if (type === "country" && industry && data[industry]) {
    result = Object.keys(data[industry]);
  }

  if (
    type === "category" &&
    industry &&
    country &&
    data[industry]?.[country]
  ) {
    result = data[industry][country];
  }

  context.res = {
    status: 200,
    headers: { "Content-Type": "application/json" },
    body: result
  };
};
