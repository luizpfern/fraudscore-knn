/**
 * Erros de domínio com mensagem amigável para o usuário final.
 * Os scripts CLI capturam estas instâncias e exibem apenas `message`,
 * evitando stack traces crus em falhas esperadas (arquivo ausente, CSV inválido etc.).
 */
export class ErroAplicacao extends Error {
  /**
   * @param {string} mensagem - Texto claro para o usuário.
   * @param {{ codigo?: string, causa?: unknown }} [opcoes]
   */
  constructor(mensagem, opcoes = {}) {
    super(mensagem);
    this.name = 'ErroAplicacao';
    this.codigo = opcoes.codigo ?? 'ERRO_APLICACAO';
    this.causa = opcoes.causa;
  }
}

/**
 * Indica se o valor é um erro de domínio tratado.
 * @param {unknown} valor
 * @returns {valor is ErroAplicacao}
 */
export function ehErroAplicacao(valor) {
  return valor instanceof ErroAplicacao;
}
