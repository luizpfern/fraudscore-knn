import { dialog, ipcMain, shell } from 'electron';
import { importarDoCli, obterRaizCli, responderErro, responderOk } from '../caminhoCli.js';

/**
 * @param {() => import('electron').BrowserWindow | null} obterJanela
 */
export function registrarArquivoHandler(obterJanela) {
  ipcMain.handle('selecionarArquivo', async () => {
    try {
      const janela = obterJanela();
      const opcoes = {
        title: 'Selecionar arquivo CSV',
        properties: ['openFile'],
        filters: [{ name: 'CSV', extensions: ['csv'] }],
      };

      const resultado = janela
        ? await dialog.showOpenDialog(janela, opcoes)
        : await dialog.showOpenDialog(opcoes);

      if (resultado.canceled || !resultado.filePaths[0]) {
        return responderOk({ cancelado: true, caminho: null, nome: null });
      }

      const caminho = resultado.filePaths[0];
      return responderOk({
        cancelado: false,
        caminho,
        nome: caminho.split(/[/\\]/).pop() ?? caminho,
      });
    } catch (erro) {
      return responderErro(erro);
    }
  });

  ipcMain.handle('abrirPastaResultados', async () => {
    try {
      const { CAMINHOS } = await importarDoCli('src/config/constantes.js');
      const falha = await shell.openPath(CAMINHOS.resultados);
      if (falha) {
        throw new Error(falha);
      }
      return responderOk({ aberto: true, caminho: CAMINHOS.resultados });
    } catch (erro) {
      return responderErro(erro);
    }
  });

  ipcMain.handle('obterRaizProjeto', async () => {
    try {
      return responderOk({ raiz: obterRaizCli() });
    } catch (erro) {
      return responderErro(erro);
    }
  });
}
