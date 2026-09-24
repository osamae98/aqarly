// The staging API's lock. There is no sign-in yet (aqarly-api roadmap Phase
// 9), so a deployed API is closed behind one shared username and password,
// Swagger included. The frontends themselves are open to anyone with the link;
// they unlock the API server-side by sending these credentials with every
// call (see `./api`), so visitors never see or need the password.
//
// Nothing is sent unless STAGING_PASSWORD is set, as on a laptop.

// `Authorization` for a call to the API, or undefined when there's no lock.
export function stagingAuthorization(): string | undefined {
  const password = process.env.STAGING_PASSWORD;
  if (!password) return undefined;
  const user = process.env.STAGING_USER || "staging";
  return `Basic ${Buffer.from(`${user}:${password}`).toString("base64")}`;
}
