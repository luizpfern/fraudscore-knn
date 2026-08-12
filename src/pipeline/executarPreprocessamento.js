import { CAMINHOS } from '../config/constantes.js';
import { lerCsv } from '../dados/leitorCsv.js';
import { validarRegistros } from '../dados/validador.js';
import { calcularConstantes } from '../preprocessamento/calculadoraConstantes.js';
import { vetorizarRegistros } from '../preprocessamento/vetorizador.js';
import { salvarProcessado } from '../preprocessamento/armazenamento.js';

/**
 * @typedef {Object} ResultadoPreprocessamento
 * @property {number} totalRegistros
 * @property {string} caminhoConstantes
 * @property {string} caminhoVetores
 */

/**
 * Orquestra o fluxo de pré-processamento da base de referência.
 *
 * Função de negócio pura em relação à CLI: não lê `process.argv` nem imprime logs.
 * Aceita um callback opcional de progresso para quem a invocar (script ou futura rota HTTP).
 *
 * @param {string} caminhoCsvReferencia - Caminho do CSV histórico rotulado.
 * @param {{ onProgresso?: (mensagem: string) => void }} [opcoes]
 * @returns {Promise<ResultadoPreprocessamento>}
 */
export async function preprocessar(caminhoCsvReferencia, opcoes = {}) {
  const reportar = opcoes.onProgresso ?? (() => {});

  reportar(`Lendo CSV de referência: ${caminhoCsvReferencia}`);
  const registrosBrutos = await lerCsv(caminhoCsvReferencia);

  reportar(`Validando ${registrosBrutos.length} registro(s)...`);
  const registros = validarRegistros(registrosBrutos, { exigeFraude: true });

  reportar('Calculando constantes de normalização...');
  const constantes = calcularConstantes(registros);

  reportar('Vetorizando base de referência...');
  const vetoresReferencia = vetorizarRegistros(registros, constantes);

  reportar('Salvando artefatos processados em disco...');
  await salvarProcessado(constantes, vetoresReferencia);

  return {
    totalRegistros: registros.length,
    caminhoConstantes: CAMINHOS.constantesNormalizacao,
    caminhoVetores: CAMINHOS.vetoresReferencia,
  };
}
