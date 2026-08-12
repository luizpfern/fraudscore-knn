import { distanciaEuclidiana } from './distancia.js';
import { LIMIAR_PADRAO } from '../config/constantes.js';

/**
 * @typedef {Object} Vizinho
 * @property {string} idTransacao
 * @property {0|1|null} fraude
 * @property {number} distancia
 */

/**
 * @typedef {Object} ResultadoKnn
 * @property {number} score - Proporção de vizinhos fraudulentos (0–1).
 * @property {boolean} aprovado - `true` se score < limiar; `false` se suspeita.
 * @property {Vizinho[]} vizinhos - Os k vizinhos mais próximos usados na decisão.
 */

/**
 * Calcula o score de fraude de uma transação via k-NN.
 *
 * O score é a proporção de vizinhos rotulados como fraude entre os k mais próximos.
 * A decisão (aprovado/suspeito) compara esse score com o limiar informado.
 *
 * @param {number[]} vetorConsulta - Vetor da transação nova a avaliar.
 * @param {import('../preprocessamento/armazenamento.js').VetorReferencia[]} vetoresReferencia
 * @param {number} k - Quantidade de vizinhos a considerar.
 * @param {number} [limiar=LIMIAR_PADRAO] - Limiar de decisão do score.
 * @returns {ResultadoKnn}
 */
export function calcularScoreFraude(
  vetorConsulta,
  vetoresReferencia,
  k,
  limiar = LIMIAR_PADRAO,
) {
  if (!Array.isArray(vetorConsulta) || vetorConsulta.length === 0) {
    throw new Error('Vetor de consulta inválido.');
  }
  if (!Array.isArray(vetoresReferencia) || vetoresReferencia.length === 0) {
    throw new Error('Base de vetores de referência vazia.');
  }
  if (!Number.isInteger(k) || k < 1) {
    throw new Error(`Parâmetro k inválido: esperado inteiro >= 1. Recebido: ${k}.`);
  }

  // TODO: para cada vetor de referência, calcular distanciaEuclidiana(vetorConsulta, ref.vetor).
  // TODO: ordenar por distância crescente e selecionar os k mais próximos.
  // TODO: calcular score = (quantidade de vizinhos com fraude === 1) / k.
  // TODO: definir aprovado = score < limiar.
  // TODO: montar a lista `vizinhos` com idTransacao, fraude e distancia (explicabilidade).

  void distanciaEuclidiana;
  void limiar;

  /** @type {ResultadoKnn} */
  const resultado = {
    score: 0,
    aprovado: true,
    vizinhos: [],
  };

  return resultado;
}
