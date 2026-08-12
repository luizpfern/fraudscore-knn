/**
 * Transforma um registro de transação validado em um vetor numérico,
 * usando as constantes de normalização da base de referência.
 *
 * Cada posição do vetor deve representar uma feature interpretável —
 * isso facilita a explicação do algoritmo no texto do TCC.
 *
 * @param {import('../dados/validador.js').RegistroTransacao} registro
 * @param {import('./calculadoraConstantes.js').ConstantesNormalizacao} constantes
 * @returns {number[]} Vetor numérico pronto para o cálculo de distância.
 */
export function vetorizar(registro, constantes) {
  // Garante que as constantes foram informadas (evita uso acidental sem pré-processamento).
  if (!constantes || !constantes.valor) {
    throw new Error('Constantes de normalização ausentes ou incompletas para vetorização.');
  }

  // TODO: implementar a montagem real do vetor. Esboço das dimensões previstas:
  //
  // [0] valor normalizado (ex.: min-max ou z-score usando constantes.valor)
  // [1] hora do dia normalizada (0–1), derivada de registro.dataHora
  // [2] dia da semana normalizado (0–1), derivado de registro.dataHora
  // [3] taxa de risco da forma de pagamento (constantes.formaPagamento[registro.formaPagamento])
  // [4] número de parcelas normalizado
  // [5] taxa de risco da categoria do estabelecimento
  // [6] canal (ex.: online=1, presencial=0) ou taxa de risco do canal
  // [7] primeira compra no estabelecimento (1 ou 0)
  //
  // Ajuste as dimensões conforme a modelagem final do TCC e documente cada índice.

  void registro;
  void constantes;

  /** @type {number[]} */
  const vetor = [
    // 0: valor normalizado
    0,
    // 1: hora do dia normalizada
    0,
    // 2: dia da semana normalizado
    0,
    // 3: risco da forma de pagamento
    0,
    // 4: parcelas normalizadas
    0,
    // 5: risco da categoria do estabelecimento
    0,
    // 6: canal / risco do canal
    0,
    // 7: primeira compra no estabelecimento
    0,
  ];

  return vetor;
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
