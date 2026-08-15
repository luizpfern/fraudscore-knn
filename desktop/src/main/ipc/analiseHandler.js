import { ipcMain } from 'electron';
import { importarDoCli, responderErro, responderOk } from '../caminhoCli.js';

/**
 * @param {import('electron').WebContents} sender
 * @param {string} mensagem
 */
function emitirProgresso(sender, mensagem) {
  sender.send('progresso:atualizado', { etapa: 'analisar', mensagem });
}

export function registrarAnaliseHandler() {
  ipcMain.handle('analisar', async (evento, caminhoCsvEntrada, opcoes = {}) => {
    try {
      if (!caminhoCsvEntrada || typeof caminhoCsvEntrada !== 'string') {
        throw new Error('Selecione um arquivo CSV de transações.');
      }

      const k = Number(opcoes.k);
      const limiar = Number(opcoes.limiar);

      if (!Number.isInteger(k) || k < 1) {
        throw new Error('O parâmetro k deve ser um inteiro maior ou igual a 1.');
      }
      if (!Number.isFinite(limiar) || limiar < 0 || limiar > 1) {
        throw new Error('O limiar deve ser um número entre 0 e 1.');
      }

      const { analisar } = await importarDoCli('src/pipeline/executarAnalise.js');
      const { lerCsv } = await importarDoCli('src/dados/leitorCsv.js');
      const { validarRegistros } = await importarDoCli('src/dados/validador.js');

      const resultado = await analisar(caminhoCsvEntrada, {
        k,
        limiar,
        onProgresso: (mensagem) => emitirProgresso(evento.sender, mensagem),
      });

      emitirProgresso(evento.sender, 'Enriquecendo resultados para a interface...');
      const brutos = await lerCsv(caminhoCsvEntrada);
      const registros = validarRegistros(brutos, { exigeFraude: false });
      const porId = new Map(registros.map((r) => [r.idTransacao, r]));

      const transacoes = resultado.resultados.map((item) => {
        const origem = porId.get(item.idTransacao);
        return {
          idTransacao: item.idTransacao,
          score: item.score,
          decisao: item.decisao,
          vizinhos: item.vizinhos,
          valor: origem?.valor ?? null,
          formaPagamento: origem?.formaPagamento ?? null,
          dataHora: origem?.dataHora instanceof Date ? origem.dataHora.toISOString() : null,
          categoriaEstabelecimento: origem?.categoriaEstabelecimento ?? null,
          canal: origem?.canal ?? null,
        };
      });

      const suspeitas = transacoes.filter((t) => t.decisao === 'suspeita');
      const valorEmRisco = suspeitas.reduce((acc, t) => acc + (Number(t.valor) || 0), 0);

      return responderOk({
        caminhoSaida: resultado.caminhoSaida,
        totalAnalisadas: resultado.totalAnalisadas,
        totalSuspeitas: resultado.totalSuspeitas,
        taxaSuspeita: resultado.totalAnalisadas > 0 ? resultado.totalSuspeitas / resultado.totalAnalisadas : 0,
        valorEmRisco,
        k,
        limiar,
        transacoes,
      });
    } catch (erro) {
      return responderErro(erro);
    }
  });
}
