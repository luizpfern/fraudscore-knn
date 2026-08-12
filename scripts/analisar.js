#!/usr/bin/env node
/**
 * Ponto de entrada CLI da análise de transações novas.
 * Uso:
 *   npm run analyze
 *   npm run analyze -- --entrada=dados/entrada.csv
 *   npm run analyze -- --entrada=dados/entrada.csv --k=7 --limiar=0.4
 */
import path from 'node:path';
import { CAMINHOS, K_PADRAO, LIMIAR_PADRAO } from '../src/config/constantes.js';
import { analisar } from '../src/pipeline/executarAnalise.js';
import { ehErroAplicacao } from '../src/utils/erros.js';
import { info, sucesso, erro } from '../src/utils/logger.js';

/**
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
  const caminhoEntrada = path.resolve(args.entrada ?? CAMINHOS.csvEntrada);
  const k = args.k !== undefined ? Number(args.k) : K_PADRAO;
  const limiar = args.limiar !== undefined ? Number(args.limiar) : LIMIAR_PADRAO;
  const formatoSaida = args.formato === 'csv' ? 'csv' : 'json';

  if (!Number.isInteger(k) || k < 1) {
    erro(`Parâmetro --k inválido: esperado inteiro >= 1. Recebido: "${args.k}".`);
    process.exitCode = 1;
    return;
  }

  if (!Number.isFinite(limiar) || limiar < 0 || limiar > 1) {
    erro(`Parâmetro --limiar inválido: esperado número entre 0 e 1. Recebido: "${args.limiar}".`);
    process.exitCode = 1;
    return;
  }

  info('Iniciando análise de transações...');
  info(`Entrada: ${caminhoEntrada}`);
  info(`Parâmetros: k=${k}, limiar=${limiar}, formato=${formatoSaida}`);

  const resultado = await analisar(caminhoEntrada, {
    k,
    limiar,
    formatoSaida,
    onProgresso: (mensagem) => info(mensagem),
  });

  sucesso(
    `Análise concluída: ${resultado.totalAnalisadas} transação(ões), ${resultado.totalSuspeitas} suspeita(s).`,
  );
  info(`Relatório: ${resultado.caminhoSaida}`);
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
