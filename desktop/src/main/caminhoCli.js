import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { app } from 'electron';

/**
 * Localiza a raiz do projeto CLI (irmã de `desktop/`), para importar
 * `src/pipeline/` sem empacotar esses módulos no bundle do Electron.
 * Assim `import.meta.url` em `src/config/constantes.js` continua apontando
 * para a pasta correta de `armazenamento/` e `resultados/`.
 *
 * @returns {string}
 */
export function obterRaizCli() {
  const candidatos = [
    path.resolve(app.getAppPath(), '..'),
    path.resolve(process.cwd(), '..'),
    process.cwd(),
    path.resolve(app.getAppPath()),
  ];

  for (const raiz of candidatos) {
    const alvo = path.join(raiz, 'src', 'pipeline', 'executarPreprocessamento.js');
    if (fs.existsSync(alvo)) {
      return raiz;
    }
  }

  throw new Error(
    'Não foi possível localizar o projeto CLI. Rode a interface a partir da pasta desktop/, com src/ na raiz do repositório.',
  );
}

/**
 * Importa um módulo ESM do projeto CLI pelo caminho relativo à raiz.
 *
 * @param {string} moduloRelativo Ex.: `src/pipeline/executarPreprocessamento.js`
 * @returns {Promise<unknown>}
 */
export async function importarDoCli(moduloRelativo) {
  const arquivo = path.join(obterRaizCli(), moduloRelativo);
  if (!fs.existsSync(arquivo)) {
    throw new Error(`Módulo do CLI não encontrado: ${arquivo}`);
  }
  return import(pathToFileURL(arquivo).href);
}

/**
 * @param {unknown} erro
 * @returns {{ ok: false, mensagem: string, codigo: string }}
 */
export function responderErro(erro) {
  return {
    ok: false,
    mensagem: erro instanceof Error ? erro.message : String(erro),
    codigo: /** @type {{ codigo?: string }} */ (erro)?.codigo ?? 'ERRO_DESCONHECIDO',
  };
}

/**
 * @template T
 * @param {T} dados
 * @returns {{ ok: true, dados: T }}
 */
export function responderOk(dados) {
  return { ok: true, dados };
}
