import { ErroAplicacao } from '../utils/erros.js';

/**
 * Transforma um registro de transação validado em um vetor numérico,
 * usando as constantes de normalização da base de referência.
 *
 * Cada posição do vetor representa uma feature interpretável —
 * isso facilita a explicação do algoritmo no texto do TCC.
 *
 * Dimensões do vetor (índice → significado):
 * - [0] valor normalizado (min-max com constantes.valor)
 * - [1] hora do dia normalizada (0–1)
 * - [2] dia da semana normalizado (0–1; 0=domingo … 6=sábado)
 * - [3] taxa de risco da forma de pagamento
 * - [4] parcelas normalizadas (min-max)
 * - [5] taxa de risco da categoria do estabelecimento
 * - [6] taxa de risco do canal
 * - [7] primeira compra no estabelecimento (1 ou 0)
 *
 * @param {import('../dados/validador.js').RegistroTransacao} registro
 * @param {import('./calculadoraConstantes.js').ConstantesNormalizacao} constantes
 * @returns {number[]} Vetor numérico pronto para o cálculo de distância.
 */
export function vetorizar(registro, constantes) {
  if (!constantes || !constantes.valor || !constantes.parcelas) {
    throw new ErroAplicacao(
      'Constantes de normalização ausentes ou incompletas para vetorização.',
      { codigo: 'CONSTANTES_AUSENTES' },
    );
  }

  const dataHora = registro.dataHora instanceof Date
    ? registro.dataHora
    : new Date(registro.dataHora);

  const riscoFormaPagamento =
    constantes.formaPagamento[registro.formaPagamento] ?? constantes.taxaFraudeGlobal ?? 0;
  const riscoCategoria =
    constantes.categoriaEstabelecimento[registro.categoriaEstabelecimento] ??
    constantes.taxaFraudeGlobal ??
    0;
  const riscoCanal = constantes.canal[registro.canal] ?? constantes.taxaFraudeGlobal ?? 0;

  return [
    // 0: valor normalizado (min-max)
    normalizarMinMax(registro.valor, constantes.valor),
    // 1: hora do dia (0–1)
    (dataHora.getHours() + dataHora.getMinutes() / 60) / 24,
    // 2: dia da semana (0–1)
    dataHora.getDay() / 6,
    // 3: risco da forma de pagamento
    riscoFormaPagamento,
    // 4: parcelas normalizadas (min-max)
    normalizarMinMax(registro.parcelas, constantes.parcelas),
    // 5: risco da categoria do estabelecimento
    riscoCategoria,
    // 6: risco do canal
    riscoCanal,
    // 7: primeira compra no estabelecimento
    registro.primeiraCompraEstabelecimento ? 1 : 0,
  ];
}

/**
 * Vetoriza uma lista de registros, preservando o id e o rótulo de fraude (quando houver).
 *
 * @param {import('../dados/validador.js').RegistroTransacao[]} registros
 * @param {import('./calculadoraConstantes.js').ConstantesNormalizacao} constantes
 * @returns {import('./armazenamento.js').VetorReferencia[]}
 */
export function vetorizarRegistros(registros, constantes) {
  return registros.map((registro) => ({
    idTransacao: registro.idTransacao,
    fraude: registro.fraude,
    vetor: vetorizar(registro, constantes),
  }));
}

/**
 * Normalização min-max para o intervalo [0, 1].
 * Se min === max, retorna 0.5 para evitar divisão por zero.
 *
 * @param {number} valor
 * @param {{ min: number, max: number }} estatisticas
 * @returns {number}
 */
function normalizarMinMax(valor, estatisticas) {
  const { min, max } = estatisticas;
  if (max === min) {
    return 0.5;
  }
  return (valor - min) / (max - min);
}
