import { useState } from 'react';
import { BarraProgresso } from '../componentes/BarraProgresso.jsx';
import { SeletorArquivo } from '../componentes/SeletorArquivo.jsx';
import { useProgresso } from '../hooks/useProgresso.js';

export function Analise({ cachePronto, aoConcluir }) {
  const [arquivo, setArquivo] = useState(null);
  const [k, setK] = useState(5);
  const [limiar, setLimiar] = useState(0.5);
  const [erro, setErro] = useState('');
  const [executando, setExecutando] = useState(false);
  const progresso = useProgresso();

  async function selecionar() {
    setErro('');
    const resposta = await window.api.selecionarArquivo();
    if (!resposta.ok) {
      setErro(resposta.mensagem);
      return;
    }
    if (!resposta.dados.cancelado) {
      setArquivo(resposta.dados);
    }
  }

  async function analisar() {
    if (!arquivo?.caminho) return;
    setErro('');
    setExecutando(true);
    progresso.iniciar();
    try {
      const resposta = await window.api.analisar(arquivo.caminho, { k: Number(k), limiar: Number(limiar) });
      if (!resposta.ok) {
        setErro(resposta.mensagem);
        return;
      }
      aoConcluir(resposta.dados);
    } finally {
      progresso.encerrar();
      setExecutando(false);
    }
  }

  return (
    <section className="pagina">
      <header className="pagina-cabecalho">
        <p className="etapa">Etapa 2</p>
        <h1>Analisar transações</h1>
        <p>
          Selecione o CSV de transações novas (sem a coluna <code>fraude</code>). O k-NN compara cada
          linha com a base já vetorizada e gera um score de risco.
        </p>
      </header>

      {!cachePronto ? (
        <div className="aviso alerta">Processe a base de referência antes de analisar transações novas.</div>
      ) : null}

      <div className="painel">
        <SeletorArquivo
          rotulo="Selecionar CSV de transações"
          nomeArquivo={arquivo?.nome}
          desabilitado={executando || !cachePronto}
          aoSelecionar={selecionar}
        />

        <div className="grade-campos">
          <label>
            <span className="campo-rotulo">
              k (vizinhos)
              <abbr title="Quantos vizinhos mais próximos entram na votação. Ímpar costuma evitar empate.">?</abbr>
            </span>
            <input
              type="number"
              min={1}
              step={1}
              value={k}
              disabled={executando}
              onChange={(e) => setK(e.target.value)}
            />
          </label>
          <label>
            <span className="campo-rotulo">
              Limiar de decisão
              <abbr title="Score maior ou igual a este valor vira suspeita. Padrão 0,5 (maioria dos vizinhos).">?</abbr>
            </span>
            <input
              type="number"
              min={0}
              max={1}
              step={0.05}
              value={limiar}
              disabled={executando}
              onChange={(e) => setLimiar(e.target.value)}
            />
          </label>
        </div>

        <div className="acoes">
          <button
            type="button"
            className="btn primario"
            disabled={!cachePronto || !arquivo?.caminho || executando}
            onClick={analisar}
          >
            Analisar
          </button>
        </div>
        <BarraProgresso ativo={executando || progresso.ativo} mensagem={progresso.mensagem} />
        {erro ? <p className="erro-inline">{erro}</p> : null}
      </div>
    </section>
  );
}
