/**
 * Utilitário de log para a camada de scripts (CLI).
 * Os módulos de pipeline (`src/pipeline/`) não devem depender deste arquivo —
 * recebem um callback opcional de progresso quando precisarem reportar status.
 */

/**
 * @typedef {'info' | 'sucesso' | 'aviso' | 'erro'} NivelLog
 */

/**
 * Imprime uma mensagem no stdout/stderr com prefixo de nível.
 *
 * @param {NivelLog} nivel
 * @param {string} mensagem
 * @returns {void}
 */
export function log(nivel, mensagem) {
  const prefixos = {
    info: '[INFO]',
    sucesso: '[OK]',
    aviso: '[AVISO]',
    erro: '[ERRO]',
  };

  const prefixo = prefixos[nivel] ?? '[LOG]';
  const linha = `${prefixo} ${mensagem}`;

  if (nivel === 'erro') {
    console.error(linha);
    return;
  }

  console.log(linha);
}

/**
 * Atalhos convenientes.
 * @param {string} mensagem
 */
export const info = (mensagem) => log('info', mensagem);
/** @param {string} mensagem */
export const sucesso = (mensagem) => log('sucesso', mensagem);
/** @param {string} mensagem */
export const aviso = (mensagem) => log('aviso', mensagem);
/** @param {string} mensagem */
export const erro = (mensagem) => log('erro', mensagem);
