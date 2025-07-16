const { app, BrowserWindow } = require("electron");
const path = require("path");
const { pathToFileURL } = require("url");

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'frontend', 'src', 'icones', 'clexio-icon.ico'),
    webPreferences: {
      nodeIntegration: false,         // 🔐 בטוח יותר
      contextIsolation: true,         // 🛡️ בטוח יותר
    },
  });
  mainWindow.maximize();


  const indexPath = pathToFileURL(
    path.join(__dirname, 'frontend', 'dist', 'index.html')
  ).href;

  mainWindow.loadURL(indexPath);
  mainWindow.loadURL(indexPath);
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
