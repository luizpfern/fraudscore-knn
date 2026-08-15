import fs from 'node:fs';
import { ipcMain } from 'electron';
import { importarDoCli, responderErro, responderOk } from '../caminhoCli.js';

/**
 * @param {import('electron').WebContents} sender
 * @param {string} mensagem
 */
function emitirProgresso(sender, mensagem) {
  sender.send('progresso:atualizado', { etapa: 'preprocessar', mensagem });
}

export function registrarPreprocessamentoHandler() {
  ipcMain.handle('obterStatusCache', async () => {
    try {
      const { CAMINHOS } = await importarDoCli('src/config/constantes.js');
      const { carregarProcessado } = await importarDoCli('src/preprocessamento/armazenamento.js');

      const existe =
        fs.existsSync(CAMINHOS.constantesNormalizacao) && fs.existsSync(CAMINHOS.vetoresReferencia);

      if (!existe) {
        return responderOk({ existe: false });
      }

      const { constantes, vetoresReferencia } = await carregarProcessado();
      const stats = await fs.promises.stat(CAMINHOS.constantesNormalizacao);

      return responderOk({
        existe: true,
        processadoEm: stats.mtime.toISOString(),
        totalRegistros: vetoresReferencia.length,
        taxaFraudeGlobal: constantes.taxaFraudeGlobal ?? 0,
        formaPagamento: constantes.formaPagamento ?? {},
        categoriaEstabelecimento: constantes.categoriaEstabelecimento ?? {},
        canal: constantes.canal ?? {},
      });
    } catch (erro) {
      return responderErro(erro);
    }
  });

  ipcMain.handle('preprocessar', async (evento, caminhoCsvReferencia) => {
    try {
      if (!caminhoCsvReferencia || typeof caminhoCsvReferencia !== 'string') {
        throw new Error('Selecione um arquivo CSV de referência.');
      }

      const { preprocessar } = await importarDoCli('src/pipeline/executarPreprocessamento.js');

      const resultado = await preprocessar(caminhoCsvReferencia, {
        onProgresso: (mensagem) => emitirProgresso(evento.sender, mensagem),
      });

      const status = await montarResumoCache();
      return responderOk({ ...resultado, cache: status });
    } catch (erro) {
      return responderErro(erro);
    }
  });
}

/**
 * @returns {Promise<object>}
 */
async function montarResumoCache() {
  const { CAMINHOS } = await importarDoCli('src/config/constantes.js');
  const { carregarProcessado } = await importarDoCli('src/preprocessamento/armazenamento.js');
  const { constantes, vetoresReferencia } = await carregarProcessado();
  const stats = await fs.promises.stat(CAMINHOS.constantesNormalizacao);

  return {
    existe: true,
    processadoEm: stats.mtime.toISOString(),
    totalRegistros: vetoresReferencia.length,
    taxaFraudeGlobal: constantes.taxaFraudeGlobal ?? 0,
    formaPagamento: constantes.formaPagamento ?? {},
    categoriaEstabelecimento: constantes.categoriaEstabelecimento ?? {},
    canal: constantes.canal ?? {},
  };
}
