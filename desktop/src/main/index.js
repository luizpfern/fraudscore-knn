import { app, BrowserWindow } from 'electron';
import { join } from 'node:path';
import { registrarArquivoHandler } from './ipc/arquivoHandler.js';
import { registrarPreprocessamentoHandler } from './ipc/preprocessamentoHandler.js';
import { registrarAnaliseHandler } from './ipc/analiseHandler.js';

/** @type {BrowserWindow | null} */
let janelaPrincipal = null;

function criarJanela() {
  janelaPrincipal = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 680,
    title: 'FraudScore k-NN',
    backgroundColor: '#0f1419',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  janelaPrincipal.on('ready-to-show', () => {
    janelaPrincipal?.show();
  });

  janelaPrincipal.on('closed', () => {
    janelaPrincipal = null;
  });

  if (process.env.ELECTRON_RENDERER_URL) {
    janelaPrincipal.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    janelaPrincipal.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  registrarArquivoHandler(() => janelaPrincipal);
  registrarPreprocessamentoHandler();
  registrarAnaliseHandler();
  criarJanela();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      criarJanela();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
