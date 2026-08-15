/**
 * @param {number} valor
 * @returns {string}
 */
export function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor ?? 0);
}

/**
 * @param {number} razao 0–1
 * @returns {string}
 */
export function formatarPercentual(razao) {
  return new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 }).format(
    razao ?? 0,
  );
}

/**
 * @param {string | null} iso
 * @returns {string}
 */
export function formatarDataHora(iso) {
  if (!iso) return '—';
  const data = new Date(iso);
  if (Number.isNaN(data.getTime())) return iso;
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(data);
}

const ROTULOS_PAGAMENTO = {
  pix: 'Pix',
  cartao_credito: 'Cartão de crédito',
  cartao_debito: 'Cartão de débito',
  boleto: 'Boleto',
  ted: 'TED',
};

/**
 * @param {string | null} chave
 * @returns {string}
 */
export function rotuloFormaPagamento(chave) {
  if (!chave) return '—';
  return ROTULOS_PAGAMENTO[chave] ?? chave;
}
