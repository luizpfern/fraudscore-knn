import fs from 'node:fs';
import path from 'node:path';
import { CAMINHOS } from '../config/constantes.js';
import { ErroAplicacao } from '../utils/erros.js';

/**
 * @typedef {Object} VetorReferencia
 * @property {string} idTransacao
 * @property {0|1|null} fraude
 * @property {number[]} vetor
 */

/**
 * @typedef {Object} DadosProcessados
 * @property {import('./calculadoraConstantes.js').ConstantesNormalizacao} constantes
 * @property {VetorReferencia[]} vetoresReferencia
 */

/**
 * Garante que o diretório de armazenamento processado exista.
 * @returns {Promise<void>}
 */
async function garantirDiretorioProcessado() {
  await fs.promises.mkdir(CAMINHOS.armazenamentoProcessado, { recursive: true });
}

/**
 * Persiste as constantes de normalização e os vetores da base de referência em disco.
 *
 * @param {import('./calculadoraConstantes.js').ConstantesNormalizacao} constantes
 * @param {VetorReferencia[]} vetoresReferencia
 * @returns {Promise<void>}
 */
export async function salvarProcessado(constantes, vetoresReferencia) {
  await garantirDiretorioProcessado();

  try {
    await fs.promises.writeFile(
      CAMINHOS.constantesNormalizacao,
      JSON.stringify(constantes, null, 2),
      'utf8',
    );
    await fs.promises.writeFile(
      CAMINHOS.vetoresReferencia,
      JSON.stringify(vetoresReferencia, null, 2),
      'utf8',
    );
  } catch (causa) {
    throw new ErroAplicacao(
      `Falha ao salvar dados processados em "${CAMINHOS.armazenamentoProcessado}".`,
      { codigo: 'ARMAZENAMENTO_ESCRITA_FALHOU', causa },
    );
  }
}

/**
 * Carrega do disco as constantes e os vetores gerados no pré-processamento.
 *
 * @returns {Promise<DadosProcessados>}
 * @throws {ErroAplicacao} Se os arquivos ainda não existirem (pré-processamento não rodado).
 */
export async function carregarProcessado() {
  const caminhoConstantes = CAMINHOS.constantesNormalizacao;
  const caminhoVetores = CAMINHOS.vetoresReferencia;

  if (!fs.existsSync(caminhoConstantes) || !fs.existsSync(caminhoVetores)) {
    throw new ErroAplicacao(
      'Dados processados não encontrados. Execute `npm run preprocess` antes de analisar.',
      { codigo: 'PROCESSADO_AUSENTE' },
    );
  }

  try {
    const [textoConstantes, textoVetores] = await Promise.all([
      fs.promises.readFile(caminhoConstantes, 'utf8'),
      fs.promises.readFile(caminhoVetores, 'utf8'),
    ]);

    /** @type {import('./calculadoraConstantes.js').ConstantesNormalizacao} */
    const constantes = JSON.parse(textoConstantes);
    /** @type {VetorReferencia[]} */
    const vetoresReferencia = JSON.parse(textoVetores);

    return { constantes, vetoresReferencia };
  } catch (causa) {
    if (causa instanceof ErroAplicacao) throw causa;
    throw new ErroAplicacao(
      `Falha ao carregar dados processados. Arquivos em: "${path.dirname(caminhoConstantes)}".`,
      { codigo: 'ARMAZENAMENTO_LEITURA_FALHOU', causa },
    );
  }
}
