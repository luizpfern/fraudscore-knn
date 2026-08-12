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
 * @property {EstatisticasNumericas} [parcelas]
 * @property {Object.<string, number>} formaPagamento - Taxa de risco (proporção de fraude) por forma de pagamento.
 * @property {Object.<string, number>} categoriaEstabelecimento - Taxa de risco por categoria.
 * @property {Object.<string, number>} [canal] - Taxa de risco por canal.
 * @property {number} [taxaFraudeGlobal] - Proporção geral de fraude na base.
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

  // TODO: calcular estatísticas de `valor` (min, max, média, desvio padrão).
  // TODO: calcular estatísticas de `parcelas`, se forem usadas no vetor.
  // TODO: calcular taxa de risco por `forma_pagamento` (fraudes / total na categoria).
  // TODO: calcular taxa de risco por `categoria_estabelecimento`.
  // TODO: calcular taxa de risco por `canal`, se for usada no vetor.
  // TODO: calcular taxa de fraude global da base.

  /** @type {ConstantesNormalizacao} */
  const constantes = {
    valor: {
      min: 0,
      max: 0,
      media: 0,
      desvioPadrao: 0,
    },
    parcelas: {
      min: 0,
      max: 0,
      media: 0,
      desvioPadrao: 0,
    },
    formaPagamento: {},
    categoriaEstabelecimento: {},
    canal: {},
    taxaFraudeGlobal: 0,
  };

  return constantes;
}
