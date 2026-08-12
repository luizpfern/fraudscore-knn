import fs from 'node:fs';
import { parse } from 'csv-parse/sync';
import { ErroAplicacao } from '../utils/erros.js';

/**
 * @typedef {Object.<string, string>} RegistroBruto
 * Registro lido do CSV com todos os campos ainda como string.
 */

/**
 * Lê um arquivo CSV e devolve um array de objetos com os campos brutos (strings).
 *
 * @param {string} caminhoArquivo - Caminho absoluto ou relativo do arquivo CSV.
 * @returns {Promise<RegistroBruto[]>}
 * @throws {ErroAplicacao} Se o arquivo não existir ou o CSV estiver mal formado.
 */
export async function lerCsv(caminhoArquivo) {
  if (!fs.existsSync(caminhoArquivo)) {
    throw new ErroAplicacao(
      `Arquivo CSV não encontrado: "${caminhoArquivo}". Verifique o caminho informado.`,
      { codigo: 'CSV_NAO_ENCONTRADO' },
    );
  }

  let conteudo;
  try {
    conteudo = await fs.promises.readFile(caminhoArquivo, 'utf8');
  } catch (causa) {
    throw new ErroAplicacao(`Não foi possível ler o arquivo CSV: "${caminhoArquivo}".`, {
      codigo: 'CSV_LEITURA_FALHOU',
      causa,
    });
  }

  // TODO: ajustar opções de parse (delimiter, bom, trim) conforme o formato real dos CSVs do TCC.
  try {
    /** @type {RegistroBruto[]} */
    const registros = parse(conteudo, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: false,
    });

    return registros;
  } catch (causa) {
    throw new ErroAplicacao(
      `CSV mal formado em "${caminhoArquivo}". Verifique cabeçalhos, delimitadores e aspas.`,
      { codigo: 'CSV_MAL_FORMADO', causa },
    );
  }
}
