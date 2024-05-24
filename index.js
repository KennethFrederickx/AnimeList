const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');

let data = require('./animes.json');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  });

  win.loadFile('profile/index.html');

  win.webContents.on('did-finish-load', () => {
    win.webContents.send('load-animes', data);
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.on('write-to-file', (event, arg) => {
  data.push(arg);
  fs.writeFile('animes.json', JSON.stringify(data, null, 2), (err) => {
    if (err) throw err;
    console.log('Data written to file');
  });
});

ipcMain.on('update-anime-list', (event, updatedData) => {
  data = updatedData;
  fs.writeFile('animes.json', JSON.stringify(data, null, 2), (err) => {
    if (err) throw err;
    console.log('Anime list updated');
  });
});

ipcMain.on('update-anime-position', (event, updatedData) => {
  data = updatedData;
  fs.writeFile('animes.json', JSON.stringify(data, null, 2), (err) => {
    if (err) throw err;
    console.log('Anime positions updated');
  });
});

