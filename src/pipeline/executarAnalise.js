import fs from 'node:fs';
import path from 'node:path';
import { CAMINHOS, K_PADRAO, LIMIAR_PADRAO } from '../config/constantes.js';
import { lerCsv } from '../dados/leitorCsv.js';
import { validarRegistros } from '../dados/validador.js';
import { carregarProcessado } from '../preprocessamento/armazenamento.js';
import { vetorizar } from '../preprocessamento/vetorizador.js';
import { calcularScoreFraude } from '../algoritmo/knn.js';
import { ErroAplicacao } from '../utils/erros.js';

/**
 * @typedef {Object} OpcoesAnalise
 * @property {number} [k]
 * @property {number} [limiar]
 * @property {'json' | 'csv'} [formatoSaida]
 * @property {string} [caminhoSaida] - Se omitido, gera nome com timestamp em `resultados/`.
 * @property {(mensagem: string) => void} [onProgresso]
 */

/**
 * @typedef {Object} ResultadoTransacao
 * @property {string} idTransacao
 * @property {number} score
 * @property {'aprovada' | 'suspeita'} decisao
 * @property {import('../algoritmo/knn.js').Vizinho[]} vizinhos
 */

/**
 * @typedef {Object} ResultadoAnalise
 * @property {string} caminhoSaida
 * @property {number} totalAnalisadas
 * @property {number} totalSuspeitas
 * @property {ResultadoTransacao[]} resultados
 */

/**
 * Orquestra o fluxo de análise de transações novas.
 *
 * Não depende de `process.argv` nem de `console.log` — adequada para reuso em HTTP.
 *
 * @param {string} caminhoCsvEntrada
 * @param {OpcoesAnalise} [opcoes]
 * @returns {Promise<ResultadoAnalise>}
 */
export async function analisar(caminhoCsvEntrada, opcoes = {}) {
  const k = opcoes.k ?? K_PADRAO;
  const limiar = opcoes.limiar ?? LIMIAR_PADRAO;
  const formatoSaida = opcoes.formatoSaida ?? 'json';
  const reportar = opcoes.onProgresso ?? (() => {});

  reportar('Carregando constantes e vetores de referência processados...');
  const { constantes, vetoresReferencia } = await carregarProcessado();

  reportar(`Lendo CSV de entrada: ${caminhoCsvEntrada}`);
  const registrosBrutos = await lerCsv(caminhoCsvEntrada);

  reportar(`Validando ${registrosBrutos.length} registro(s) de entrada...`);
  const registros = validarRegistros(registrosBrutos, { exigeFraude: false });

  reportar(`Calculando scores (k=${k}, limiar=${limiar})...`);
  /** @type {ResultadoTransacao[]} */
  const resultados = registros.map((registro) => {
    const vetor = vetorizar(registro, constantes);
    const { score, aprovado, vizinhos } = calcularScoreFraude(
      vetor,
      vetoresReferencia,
      k,
      limiar,
    );

    return {
      idTransacao: registro.idTransacao,
      score,
      decisao: aprovado ? 'aprovada' : 'suspeita',
      vizinhos,
    };
  });

  const caminhoSaida =
    opcoes.caminhoSaida ?? gerarCaminhoSaidaPadrao(formatoSaida);

  reportar(`Gravando relatório em: ${caminhoSaida}`);
  await salvarRelatorio(caminhoSaida, resultados, formatoSaida);

  return {
    caminhoSaida,
    totalAnalisadas: resultados.length,
    totalSuspeitas: resultados.filter((r) => r.decisao === 'suspeita').length,
    resultados,
  };
}

/**
 * @param {'json' | 'csv'} formato
 * @returns {string}
 */
function gerarCaminhoSaidaPadrao(formato) {
  const carimbo = new Date().toISOString().replace(/[:.]/g, '-');
  return path.join(CAMINHOS.resultados, `analise-${carimbo}.${formato}`);
}

/**
 * @param {string} caminhoSaida
 * @param {ResultadoTransacao[]} resultados
 * @param {'json' | 'csv'} formato
 * @returns {Promise<void>}
 */
async function salvarRelatorio(caminhoSaida, resultados, formato) {
  await fs.promises.mkdir(path.dirname(caminhoSaida), { recursive: true });

  try {
    if (formato === 'json') {
      await fs.promises.writeFile(caminhoSaida, JSON.stringify(resultados, null, 2), 'utf8');
      return;
    }

    // TODO: enriquecer CSV de saída se necessário (ex.: IDs dos vizinhos em coluna separada).
    const cabecalho = 'id_transacao,score,decisao';
    const linhas = resultados.map(
      (r) => `${r.idTransacao},${r.score},${r.decisao}`,
    );
    await fs.promises.writeFile(caminhoSaida, [cabecalho, ...linhas].join('\n'), 'utf8');
  } catch (causa) {
    throw new ErroAplicacao(`Falha ao gravar relatório de análise em "${caminhoSaida}".`, {
      codigo: 'RELATORIO_ESCRITA_FALHOU',
      causa,
    });
  }
}
