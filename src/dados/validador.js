import { FORMAS_PAGAMENTO, CANAIS } from '../config/constantes.js';
import { ErroAplicacao } from '../utils/erros.js';

/**
 * @typedef {Object} RegistroTransacao
 * @property {string} idTransacao
 * @property {Date} dataHora
 * @property {number} valor
 * @property {string} formaPagamento
 * @property {number} parcelas
 * @property {string} categoriaEstabelecimento
 * @property {string} canal
 * @property {string} idCliente
 * @property {string} idEstabelecimento
 * @property {boolean} primeiraCompraEstabelecimento
 * @property {0|1|null} fraude - Presente apenas na base de referência; `null` no CSV de entrada.
 */

/**
 * Valida e tipa um registro bruto lido do CSV.
 *
 * @param {import('./leitorCsv.js').RegistroBruto} registroBruto
 * @param {{ exigeFraude?: boolean, indiceLinha?: number }} [opcoes]
 * @returns {RegistroTransacao}
 * @throws {ErroAplicacao} Se algum campo obrigatório estiver ausente ou inválido.
 */
export function validarRegistro(registroBruto, opcoes = {}) {
  const { exigeFraude = false, indiceLinha } = opcoes;
  const contexto = indiceLinha !== undefined ? ` (linha ${indiceLinha})` : '';

  // TODO: implementar conversões e validações completas para cada campo.
  // Campos esperados no CSV (português):
  // id_transacao, data_hora, valor, forma_pagamento, parcelas,
  // categoria_estabelecimento, canal, id_cliente, id_estabelecimento,
  // primeira_compra_estabelecimento, [fraude]

  const idTransacao = exigirTexto(registroBruto.id_transacao, 'id_transacao', contexto);
  const dataHora = parsearDataHora(registroBruto.data_hora, contexto);
  const valor = parsearNumero(registroBruto.valor, 'valor', contexto);
  const formaPagamento = exigirEnum(
    registroBruto.forma_pagamento,
    'forma_pagamento',
    FORMAS_PAGAMENTO,
    contexto,
  );
  const parcelas = parsearInteiro(registroBruto.parcelas, 'parcelas', contexto);
  const categoriaEstabelecimento = exigirTexto(
    registroBruto.categoria_estabelecimento,
    'categoria_estabelecimento',
    contexto,
  );
  const canal = exigirEnum(registroBruto.canal, 'canal', CANAIS, contexto);
  const idCliente = exigirTexto(registroBruto.id_cliente, 'id_cliente', contexto);
  const idEstabelecimento = exigirTexto(
    registroBruto.id_estabelecimento,
    'id_estabelecimento',
    contexto,
  );
  const primeiraCompraEstabelecimento = parsearBooleano(
    registroBruto.primeira_compra_estabelecimento,
    'primeira_compra_estabelecimento',
    contexto,
  );

  /** @type {0|1|null} */
  let fraude = null;
  if (exigeFraude) {
    fraude = parsearFraude(registroBruto.fraude, contexto);
  } else if (registroBruto.fraude !== undefined && registroBruto.fraude !== '') {
    fraude = parsearFraude(registroBruto.fraude, contexto);
  }

  return {
    idTransacao,
    dataHora,
    valor,
    formaPagamento,
    parcelas,
    categoriaEstabelecimento,
    canal,
    idCliente,
    idEstabelecimento,
    primeiraCompraEstabelecimento,
    fraude,
  };
}

/**
 * Valida uma lista de registros brutos.
 *
 * @param {import('./leitorCsv.js').RegistroBruto[]} registrosBrutos
 * @param {{ exigeFraude?: boolean }} [opcoes]
 * @returns {RegistroTransacao[]}
 */
export function validarRegistros(registrosBrutos, opcoes = {}) {
  return registrosBrutos.map((registro, indice) =>
    validarRegistro(registro, { ...opcoes, indiceLinha: indice + 2 }),
  );
}

/**
 * @param {unknown} valor
 * @param {string} nomeCampo
 * @param {string} contexto
 * @returns {string}
 */
function exigirTexto(valor, nomeCampo, contexto) {
  if (valor === undefined || valor === null || String(valor).trim() === '') {
    throw new ErroAplicacao(`Campo obrigatório ausente ou vazio: "${nomeCampo}"${contexto}.`, {
      codigo: 'CAMPO_OBRIGATORIO',
    });
  }
  return String(valor).trim();
}

/**
 * @param {unknown} valor
 * @param {string} contexto
 * @returns {Date}
 */
function parsearDataHora(valor, contexto) {
  const texto = exigirTexto(valor, 'data_hora', contexto);
  const data = new Date(texto);
  if (Number.isNaN(data.getTime())) {
    throw new ErroAplicacao(
      `Campo "data_hora" inválido${contexto}: esperado timestamp ISO (ex: 2026-03-14T02:35:00). Recebido: "${texto}".`,
      { codigo: 'CAMPO_INVALIDO' },
    );
  }
  return data;
}

/**
 * @param {unknown} valor
 * @param {string} nomeCampo
 * @param {string} contexto
 * @returns {number}
 */
function parsearNumero(valor, nomeCampo, contexto) {
  const texto = exigirTexto(valor, nomeCampo, contexto);
  const numero = Number(texto.replace(',', '.'));
  if (!Number.isFinite(numero)) {
    throw new ErroAplicacao(
      `Campo "${nomeCampo}" inválido${contexto}: esperado número decimal. Recebido: "${texto}".`,
      { codigo: 'CAMPO_INVALIDO' },
    );
  }
  return numero;
}

/**
 * @param {unknown} valor
 * @param {string} nomeCampo
 * @param {string} contexto
 * @returns {number}
 */
function parsearInteiro(valor, nomeCampo, contexto) {
  const numero = parsearNumero(valor, nomeCampo, contexto);
  if (!Number.isInteger(numero)) {
    throw new ErroAplicacao(
      `Campo "${nomeCampo}" inválido${contexto}: esperado inteiro. Recebido: "${valor}".`,
      { codigo: 'CAMPO_INVALIDO' },
    );
  }
  return numero;
}

/**
 * @param {unknown} valor
 * @param {string} nomeCampo
 * @param {readonly string[]} valoresPermitidos
 * @param {string} contexto
 * @returns {string}
 */
function exigirEnum(valor, nomeCampo, valoresPermitidos, contexto) {
  const texto = exigirTexto(valor, nomeCampo, contexto).toLowerCase();
  if (!valoresPermitidos.includes(texto)) {
    throw new ErroAplicacao(
      `Campo "${nomeCampo}" inválido${contexto}: esperado um de [${valoresPermitidos.join(', ')}]. Recebido: "${texto}".`,
      { codigo: 'CAMPO_INVALIDO' },
    );
  }
  return texto;
}

/**
 * @param {unknown} valor
 * @param {string} nomeCampo
 * @param {string} contexto
 * @returns {boolean}
 */
function parsearBooleano(valor, nomeCampo, contexto) {
  const texto = exigirTexto(valor, nomeCampo, contexto).toLowerCase();
  if (['true', '1', 'sim', 'yes'].includes(texto)) return true;
  if (['false', '0', 'nao', 'não', 'no'].includes(texto)) return false;
  throw new ErroAplicacao(
    `Campo "${nomeCampo}" inválido${contexto}: esperado booleano (true/false, 1/0). Recebido: "${texto}".`,
    { codigo: 'CAMPO_INVALIDO' },
  );
}

/**
 * @param {unknown} valor
 * @param {string} contexto
 * @returns {0|1}
 */
function parsearFraude(valor, contexto) {
  const texto = exigirTexto(valor, 'fraude', contexto);
  if (texto === '0') return 0;
  if (texto === '1') return 1;
  throw new ErroAplicacao(
    `Campo "fraude" inválido${contexto}: esperado 0 ou 1. Recebido: "${texto}".`,
    { codigo: 'CAMPO_INVALIDO' },
  );
}
