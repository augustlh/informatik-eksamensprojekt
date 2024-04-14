//const { app, BrowserWindow } = require("electron/main");
//const path = require("node:path");

import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import { getUser } from "./database.js";

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1000,
    height: 600,
    webPreferences: {
      //preload: path.join(__dirname, "preload.js"),
    },
  });

  win.loadFile("index.html");

  // Open the DevTools.
  win.webContents.openDevTools();
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

/*

ipcMain.handle("get-user", async (event, email) => {
  try {
    const user = await getUser(email);
    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
});
*/
