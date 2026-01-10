import { hostname, userInfo } from "node:os";
import slugify from "slugify";

export function getUserName() {
  return clean(userInfo().username);
}

export function getHostName() {
  return clean(hostname());
}

function clean(name: string) {
  return (
    // Makes the name url-safe
    slugify(name)
      // Additionally remove "@" and ":", as they
      // might break the user@host:path format
      .replace(/@/g, "")
      .replace(/:/g, ".")
  );
}
