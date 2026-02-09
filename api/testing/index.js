export default async function (context, req) {
  context.res = {
    status: 200,
    body: {
      ok: true,
      node: process.version,
      esm: true,
      fetchAvailable: typeof fetch
    }
  };
}
