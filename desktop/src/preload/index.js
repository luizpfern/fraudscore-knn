import { contextBridge, ipcRenderer } from 'electron';

/**
 * Superfície mínima exposta ao React. O renderer não tem Node nem filesystem.
 */
contextBridge.exposeInMainWorld('api', {
  /**
   * @returns {Promise<{ ok: boolean, dados?: { cancelado: boolean, caminho: string|null, nome: string|null }, mensagem?: string }>}
   */
  selecionarArquivo: () => ipcRenderer.invoke('selecionarArquivo'),

  /**
   * @param {string} caminho
   * @returns {Promise<{ ok: boolean, dados?: object, mensagem?: string }>}
   */
  preprocessar: (caminho) => ipcRenderer.invoke('preprocessar', caminho),

  /**
   * @param {string} caminho
   * @param {{ k: number, limiar: number }} opcoes
   * @returns {Promise<{ ok: boolean, dados?: object, mensagem?: string }>}
   */
  analisar: (caminho, opcoes) => ipcRenderer.invoke('analisar', caminho, opcoes),

  /**
   * @returns {Promise<{ ok: boolean, dados?: object, mensagem?: string }>}
   */
  obterStatusCache: () => ipcRenderer.invoke('obterStatusCache'),

  /**
   * @returns {Promise<{ ok: boolean, dados?: object, mensagem?: string }>}
   */
  abrirPastaResultados: () => ipcRenderer.invoke('abrirPastaResultados'),

  /**
   * @param {(payload: { etapa: string, mensagem: string }) => void} callback
   * @returns {() => void} Função para cancelar o listener.
   */
  aoAtualizarProgresso: (callback) => {
    const listener = (_evento, payload) => callback(payload);
    ipcRenderer.on('progresso:atualizado', listener);
    return () => ipcRenderer.removeListener('progresso:atualizado', listener);
  },
});
