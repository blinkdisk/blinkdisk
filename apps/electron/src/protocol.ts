import { app, net, protocol } from "electron";
import path from "node:path";
import { pathToFileURL } from "node:url";

protocol.registerSchemesAsPrivileged([
  {
    scheme: "blinkdiskapp",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
    },
  },
]);

export function registerProtocol() {
  protocol.handle("blinkdiskapp", (req) => {
    const { host, pathname, search } = new URL(req.url);
    if (host === "frontend") {
      const baseDir = !app.isPackaged
        ? path.join(import.meta.dirname, "..", "frontend")
        : path.join(process.resourcesPath, "app.asar", "frontend");

      const pathToServe = path.resolve(
        baseDir,
        pathname === "/" ? "index.html" : pathname.slice(1),
      );

      const relativePath = path.relative(baseDir, pathToServe);

      const isSafe =
        relativePath &&
        !relativePath.startsWith("..") &&
        !path.isAbsolute(relativePath);

      if (!isSafe) {
        return new Response("Path not allowed", {
          status: 400,
          headers: { "content-type": "text/html" },
        });
      }

      return net.fetch(pathToFileURL(pathToServe).toString());
    } else if (host === "api") {
      return net.fetch(
        `${process.env.API_URL}${pathname}${search ? search : ""}`,
        req,
      );
    } else {
      return new Response("Host not found", {
        status: 400,
        headers: { "content-type": "text/html" },
      });
    }
  });
}
