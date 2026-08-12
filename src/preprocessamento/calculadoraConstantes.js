import { FORMAS_PAGAMENTO, CANAIS } from '../config/constantes.js';
import { ErroAplicacao } from '../utils/erros.js';

/**
 * @typedef {Object} EstatisticasNumericas
 * @property {number} min
 * @property {number} max
 * @property {number} media
 * @property {number} desvioPadrao
 */

/**
 * @typedef {Object} ConstantesNormalizacao
 * @property {EstatisticasNumericas} valor
 * @property {EstatisticasNumericas} parcelas
 * @property {Object.<string, number>} formaPagamento - Taxa de risco (proporção de fraude) por forma de pagamento.
 * @property {Object.<string, number>} categoriaEstabelecimento - Taxa de risco por categoria.
 * @property {Object.<string, number>} canal - Taxa de risco por canal.
 * @property {number} taxaFraudeGlobal - Proporção geral de fraude na base.
 */

/**
 * Calcula as constantes de normalização a partir da base de referência rotulada.
 *
 * Essas constantes são usadas depois para vetorizar tanto a base quanto
 * as transações novas — por isso só devem ser recalculadas quando a base mudar.
 *
 * @param {import('../dados/validador.js').RegistroTransacao[]} registrosReferencia
 * @returns {ConstantesNormalizacao}
 */
export function calcularConstantes(registrosReferencia) {
  if (!Array.isArray(registrosReferencia) || registrosReferencia.length === 0) {
    throw new ErroAplicacao(
      'A base de referência está vazia; não é possível calcular constantes de normalização.',
      { codigo: 'BASE_VAZIA' },
    );
  }

  const valores = registrosReferencia.map((r) => r.valor);
  const parcelas = registrosReferencia.map((r) => r.parcelas);
  const totalFraudes = registrosReferencia.filter((r) => r.fraude === 1).length;
  const taxaFraudeGlobal = totalFraudes / registrosReferencia.length;

  return {
    valor: calcularEstatisticas(valores),
    parcelas: calcularEstatisticas(parcelas),
    formaPagamento: calcularTaxasRiscoPorCampo(
      registrosReferencia,
      (r) => r.formaPagamento,
      FORMAS_PAGAMENTO,
      taxaFraudeGlobal,
    ),
    categoriaEstabelecimento: calcularTaxasRiscoPorCampo(
      registrosReferencia,
      (r) => r.categoriaEstabelecimento,
      null,
      taxaFraudeGlobal,
    ),
    canal: calcularTaxasRiscoPorCampo(
      registrosReferencia,
      (r) => r.canal,
      CANAIS,
      taxaFraudeGlobal,
    ),
    taxaFraudeGlobal,
  };
}

/**
 * @param {number[]} numeros
 * @returns {EstatisticasNumericas}
 */
function calcularEstatisticas(numeros) {
  const min = Math.min(...numeros);
  const max = Math.max(...numeros);
  const media = numeros.reduce((acc, n) => acc + n, 0) / numeros.length;
  const variancia =
    numeros.reduce((acc, n) => acc + (n - media) ** 2, 0) / numeros.length;
  const desvioPadrao = Math.sqrt(variancia);

  return { min, max, media, desvioPadrao };
}

/**
 * Calcula a proporção de fraude em cada valor categórico.
 * Categorias sem ocorrências recebem a taxa global como fallback.
 *
 * @param {import('../dados/validador.js').RegistroTransacao[]} registros
 * @param {(registro: import('../dados/validador.js').RegistroTransacao) => string} extrairChave
 * @param {readonly string[] | null} chavesConhecidas - Se informado, garante todas as chaves no resultado.
 * @param {number} taxaFallback
 * @returns {Object.<string, number>}
 */
function calcularTaxasRiscoPorCampo(registros, extrairChave, chavesConhecidas, taxaFallback) {
  /** @type {Map<string, { total: number, fraudes: number }>} */
  const contagem = new Map();

  for (const registro of registros) {
    const chave = extrairChave(registro);
    const atual = contagem.get(chave) ?? { total: 0, fraudes: 0 };
    atual.total += 1;
    if (registro.fraude === 1) {
      atual.fraudes += 1;
    }
    contagem.set(chave, atual);
  }

  /** @type {Object.<string, number>} */
  const taxas = {};

  const chaves = new Set([
    ...(chavesConhecidas ?? []),
    ...contagem.keys(),
  ]);

  for (const chave of chaves) {
    const stats = contagem.get(chave);
    taxas[chave] = stats && stats.total > 0 ? stats.fraudes / stats.total : taxaFallback;
  }

  return taxas;
}
