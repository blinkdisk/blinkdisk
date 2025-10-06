import { getRouterManifest } from "@tanstack/react-start/router-manifest";
import {
  createStartHandler,
  defaultStreamHandler,
} from "@tanstack/react-start/server";

import { createRouter } from "./router";

export default createStartHandler({
  // @ts-expect-error
  createRouter,
  getRouterManifest,
})(defaultStreamHandler);
