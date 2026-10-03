export function isAuthorizationCode(code: string) {
  if (!/^[A-Za-z0-9_-]+$/.test(code)) return false;

  try {
    const decoded: unknown = JSON.parse(
      atob(code.replaceAll("-", "+").replaceAll("_", "/")),
    );

    return (
      !!decoded &&
      typeof decoded === "object" &&
      "identifier" in decoded &&
      typeof decoded.identifier === "string" &&
      !!decoded.identifier &&
      "state" in decoded &&
      typeof decoded.state === "string" &&
      !!decoded.state
    );
  } catch {
    return false;
  }
}
