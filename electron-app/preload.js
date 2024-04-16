//const { contextBridge } = require("electron/renderer");

import { contextBridge } from "electron/renderer";

contextBridge.exposeInMainWorld("versions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
});
