#!/usr/bin/env node
/**
 * Ponto de entrada CLI do pré-processamento.
 * Uso: npm run preprocess
 *      npm run preprocess -- --referencia=dados/referencia.csv
 */
import path from 'node:path';
import { CAMINHOS } from '../src/config/constantes.js';
import { preprocessar } from '../src/pipeline/executarPreprocessamento.js';
import { ehErroAplicacao } from '../src/utils/erros.js';
import { info, sucesso, erro } from '../src/utils/logger.js';

/**
 * Extrai argumentos `--chave=valor` da linha de comando.
 * @param {string[]} argv
 * @returns {Record<string, string>}
 */
function parseArgs(argv) {
  /** @type {Record<string, string>} */
  const args = {};
  for (const item of argv) {
    if (!item.startsWith('--')) continue;
    const [chave, ...resto] = item.slice(2).split('=');
    args[chave] = resto.join('=') || 'true';
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const caminhoReferencia = path.resolve(args.referencia ?? CAMINHOS.csvReferencia);

  info('Iniciando pré-processamento da base de referência...');

  const resultado = await preprocessar(caminhoReferencia, {
    onProgresso: (mensagem) => info(mensagem),
  });

  sucesso(
    `Pré-processamento concluído: ${resultado.totalRegistros} registro(s) vetorizados.`,
  );
  info(`Constantes: ${resultado.caminhoConstantes}`);
  info(`Vetores: ${resultado.caminhoVetores}`);
}

main().catch((err) => {
  if (ehErroAplicacao(err)) {
    erro(err.message);
    process.exitCode = 1;
    return;
  }

  erro(err?.message ?? String(err));
  if (process.env.DEBUG) {
    console.error(err);
  }
  process.exitCode = 1;
});
