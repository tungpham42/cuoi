export function getDomain(parent) {
  const host = parent?.req?.headers?.host || "localhost:3000";
  const protocol = "https";
  return `${protocol}://${host}`;
}
