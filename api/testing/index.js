export default async function (context, req) {
  context.res = {
    status: 200,
    body: {
      message: "Test function is running",
      node: process.version,
      fetchAvailable: typeof fetch
    }
  };
}
