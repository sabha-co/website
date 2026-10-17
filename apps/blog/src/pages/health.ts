// kamal-proxy's deploy healthcheck. Proves the Node process serves routes,
// nothing about the database or storage.
export const GET = () => new Response("OK", { status: 200 });
