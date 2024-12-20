const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true, // Disable Node.js in renderer for security
            contextIsolation: true
        },
        icon: path.join(__dirname, 'assets', 'icon.icns'), // macOS
    });

    mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'));
    
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});