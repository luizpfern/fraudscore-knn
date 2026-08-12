import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Raiz do projeto (dois níveis acima de src/config/). */
export const RAIZ_PROJETO = path.resolve(__dirname, '..', '..');

/** Caminhos padrão de pastas e arquivos. */
export const CAMINHOS = Object.freeze({
  dados: path.join(RAIZ_PROJETO, 'dados'),
  csvReferencia: path.join(RAIZ_PROJETO, 'dados', 'referencia.csv'),
  csvEntrada: path.join(RAIZ_PROJETO, 'dados', 'entrada.csv'),
  armazenamentoProcessado: path.join(RAIZ_PROJETO, 'armazenamento', 'processado'),
  constantesNormalizacao: path.join(
    RAIZ_PROJETO,
    'armazenamento',
    'processado',
    'constantes-normalizacao.json',
  ),
  vetoresReferencia: path.join(
    RAIZ_PROJETO,
    'armazenamento',
    'processado',
    'vetores-referencia.json',
  ),
  resultados: path.join(RAIZ_PROJETO, 'resultados'),
});

/**
 * Número padrão de vizinhos (k) usados pelo k-NN.
 * @type {number}
 */
export const K_PADRAO = 5;

/**
 * Limiar padrão do score de fraude (0–1).
 * Score >= limiar → suspeita; abaixo → aprovada.
 * @type {number}
 */
export const LIMIAR_PADRAO = 0.5;

/**
 * Formas de pagamento aceitas no CSV.
 * @type {readonly string[]}
 */
export const FORMAS_PAGAMENTO = Object.freeze([
  'pix',
  'cartao_credito',
  'cartao_debito',
  'boleto',
  'ted',
]);

/**
 * Canais de compra aceitos no CSV.
 * @type {readonly string[]}
 */
export const CANAIS = Object.freeze(['online', 'presencial']);
