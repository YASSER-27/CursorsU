const { app, BrowserWindow, dialog, ipcMain, shell } = require("electron");
const fs = require("node:fs/promises");
const path = require("node:path");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");

app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");

let mainWindow;
const execFileAsync = promisify(execFile);

function getAssetRoot() {
  return path.resolve(
    app.isPackaged ? path.join(app.getAppPath(), "dist") : path.join(__dirname, "..", "public"),
  );
}

function resolveAssetPath(relativePath, pattern, invalidPathMessage, allowedRoots) {
  if (typeof relativePath !== "string" || !pattern.test(relativePath)) {
    throw new Error(invalidPathMessage);
  }

  const assetRoot = getAssetRoot();
  const assetPath = path.resolve(assetRoot, relativePath);
  const relativeAssetPath = path.relative(assetRoot, assetPath);
  const assetCategory = relativeAssetPath.split(path.sep)[0].toLowerCase();
  if (
    !relativeAssetPath ||
    relativeAssetPath === ".." ||
    relativeAssetPath.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relativeAssetPath) ||
    !allowedRoots.includes(assetCategory)
  ) {
    throw new Error("The requested file is outside the application assets.");
  }
  return assetPath;
}

function resolveCursorAsset(relativePath) {
  return resolveAssetPath(
    relativePath,
    /^cursors\/.+\.(?:ani|cur)$/i,
    "The selected cursor file is not valid.",
    ["cursors"],
  );
}

function resolvePreviewAsset(relativePath) {
  return resolveAssetPath(
    relativePath,
    /^(?:cursors|previews)\/.+\.(?:png|gif|jpe?g|webp)$/i,
    "The selected cursor preview file is not valid.",
    ["cursors", "previews"],
  );
}

async function findMissingRuntimeAssets() {
  const root = getAssetRoot();
  const requiredAssets = [
    ["icon.svg", false],
    ["icon.png", false],
    ["startup.mp3", false],
    ["dark.mp4", false],
    ["loop.mp4", false],
    ["cursor-test-scene.html", false],
    ["cursors", true],
    ["previews", true],
    ["downloads", true],
  ];
  const missing = [];

  for (const [relativePath, shouldBeDirectory] of requiredAssets) {
    const assetPath = path.join(root, relativePath);
    try {
      const stat = await fs.stat(assetPath);
      if (shouldBeDirectory && !stat.isDirectory()) {
        missing.push(relativePath);
      } else if (shouldBeDirectory && (await fs.readdir(assetPath)).length === 0) {
        missing.push(relativePath);
      } else if (!shouldBeDirectory && !stat.isFile()) {
        missing.push(relativePath);
      }
    } catch (error) {
      if (error.code === "ENOENT" || error.code === "ENOTDIR") {
        missing.push(relativePath);
        continue;
      }
      throw error;
    }
  }

  return missing;
}

ipcMain.handle("cursor:preview", async (event, relativePath) => {
  if (!mainWindow || event.sender !== mainWindow.webContents) {
    throw new Error("The cursor preview request is not allowed.");
  }

  const assetPath = resolvePreviewAsset(relativePath);
  const contents = await fs.readFile(assetPath);
  const mimeTypeByExtension = {
    ".gif": "image/gif",
    ".jpeg": "image/jpeg",
    ".jpg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
  };
  const mimeType = mimeTypeByExtension[path.extname(assetPath).toLowerCase()];
  return `data:${mimeType};base64,${contents.toString("base64")}`;
});

ipcMain.handle("cursor:apply", async (event, cursor) => {
  if (process.platform !== "win32") {
    throw new Error("Direct cursor installation is available on Windows only.");
  }
  if (!mainWindow || event.sender !== mainWindow.webContents) {
    throw new Error("The cursor installation request is not allowed.");
  }

  const slug =
    typeof cursor?.slug === "string"
      ? cursor.slug.toLowerCase().replace(/[^a-z0-9_-]/g, "_").slice(0, 64)
      : "";
  if (!slug) {
    throw new Error("The selected cursor does not have a valid name.");
  }

  const arrowPath = resolveCursorAsset(cursor.arrow);
  const pointerPath = resolveCursorAsset(cursor.pointer);
  const installDirectory = path.join(app.getPath("userData"), "Cursors", slug);
  await fs.mkdir(installDirectory, { recursive: true });

  const arrowFile = path.join(installDirectory, path.basename(arrowPath));
  const pointerFile = path.join(installDirectory, path.basename(pointerPath));
  await Promise.all([
    fs.copyFile(arrowPath, arrowFile),
    fs.copyFile(pointerPath, pointerFile),
  ]);

  const registryKey = "HKCU\\Control Panel\\Cursors";
  await execFileAsync(
    "reg.exe",
    ["add", registryKey, "/v", "Arrow", "/t", "REG_SZ", "/d", arrowFile, "/f"],
    { windowsHide: true, timeout: 10000 },
  );
  await execFileAsync(
    "reg.exe",
    ["add", registryKey, "/v", "Hand", "/t", "REG_SZ", "/d", pointerFile, "/f"],
    { windowsHide: true, timeout: 10000 },
  );
  await execFileAsync("rundll32.exe", ["user32.dll,UpdatePerUserSystemParameters"], {
    windowsHide: true,
    timeout: 10000,
  });

  return { ok: true };
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1240,
    height: 820,
    minWidth: 720,
    minHeight: 520,
    useContentSize: true,
    resizable: true,
    maximizable: true,
    frame: false,
    autoHideMenuBar: true,
    backgroundColor: "#04050c",
    title: "cursors U",
    icon: path.join(__dirname, "..", "dist", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    let externalUrl;
    try {
      externalUrl = new URL(url);
    } catch (error) {
      console.error("Blocked invalid external link:", error);
      return { action: "deny" };
    }

    if (externalUrl.protocol !== "https:") {
      return { action: "deny" };
    }

    void shell.openExternal(externalUrl.href).catch((error) => {
      console.error("Failed to open external link:", error);
    });
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  } else {
    mainWindow.loadURL("http://127.0.0.1:5173");
  }
}

ipcMain.on("window:minimize", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender) || mainWindow;
  win?.minimize();
});

ipcMain.on("window:maximize", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender) || mainWindow;
  if (!win) return;
  if (win.isMaximized()) {
    win.restore();
  } else {
    win.maximize();
  }
});

ipcMain.on("window:close", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender) || mainWindow;
  win?.close();
});

app.whenReady()
  .then(async () => {
    const missingAssets = await findMissingRuntimeAssets();
    if (missingAssets.length > 0) {
      const message = `Some application assets are missing from ${getAssetRoot()}:\n\n${missingAssets.join("\n")}`;
      console.error(message);
      dialog.showErrorBox("Application files are missing", message);
    }

    createWindow();
    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  })
  .catch((error) => {
    console.error("The application asset check failed:", error);
    dialog.showErrorBox("Application startup failed", error.message);
    app.quit();
  });

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
