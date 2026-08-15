import { useEffect, useState } from 'react';
import { BarraProgresso } from '../componentes/BarraProgresso.jsx';
import { SeletorArquivo } from '../componentes/SeletorArquivo.jsx';
import { formatarDataHora, formatarPercentual, rotuloFormaPagamento } from '../formatadores.js';
import { useProgresso } from '../hooks/useProgresso.js';

export function PreProcessamento({ cache, aoAtualizarCache, aoAvancar }) {
  const [arquivo, setArquivo] = useState(null);
  const [erro, setErro] = useState('');
  const [executando, setExecutando] = useState(false);
  const progresso = useProgresso();

  useEffect(() => {
    let cancelado = false;
    window.api.obterStatusCache().then((resposta) => {
      if (cancelado) return;
      if (resposta.ok && resposta.dados?.existe) {
        aoAtualizarCache(resposta.dados);
      }
    });
    return () => {
      cancelado = true;
    };
  }, [aoAtualizarCache]);

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

  async function processar() {
    if (!arquivo?.caminho) return;
    setErro('');
    setExecutando(true);
    progresso.iniciar();
    try {
      const resposta = await window.api.preprocessar(arquivo.caminho);
      if (!resposta.ok) {
        setErro(resposta.mensagem);
        return;
      }
      aoAtualizarCache(resposta.dados.cache);
    } finally {
      progresso.encerrar();
      setExecutando(false);
    }
  }

  const pronto = Boolean(cache?.existe);

  return (
    <section className="pagina">
      <header className="pagina-cabecalho">
        <p className="etapa">Etapa 1</p>
        <h1>Base de referência</h1>
        <p>
          Escolha o CSV histórico já rotulado (com a coluna <code>fraude</code>). O sistema calcula as
          constantes de normalização e vetoriza a base — o mesmo fluxo do CLI, sem recalcular nada na
          análise.
        </p>
      </header>

      {pronto ? (
        <div className="aviso sucesso">
          <div>
            <strong>Cache pronto.</strong> {cache.totalRegistros} transações processadas em{' '}
            {formatarDataHora(cache.processadoEm)}. Taxa de fraude na base:{' '}
            {formatarPercentual(cache.taxaFraudeGlobal)}.
          </div>
          <span>Você pode reprocessar com outro CSV se a base mudou.</span>
        </div>
      ) : (
        <div className="aviso">
          Ainda não há base processada. Selecione o CSV de referência para continuar.
        </div>
      )}

      <div className="painel">
        <SeletorArquivo
          rotulo="Selecionar CSV de referência"
          nomeArquivo={arquivo?.nome}
          desabilitado={executando}
          aoSelecionar={selecionar}
        />
        <div className="acoes">
          <button type="button" className="btn primario" disabled={!arquivo?.caminho || executando} onClick={processar}>
            {pronto ? 'Reprocessar base' : 'Processar base'}
          </button>
          <button type="button" className="btn" disabled={!pronto} onClick={aoAvancar}>
            Avançar para análise
          </button>
        </div>
        <BarraProgresso ativo={executando || progresso.ativo} mensagem={progresso.mensagem} />
        {erro ? <p className="erro-inline">{erro}</p> : null}
      </div>

      {pronto ? (
        <div className="painel">
          <header>
            <h3>Distribuição de risco na base</h3>
            <p>Taxa histórica de fraude por forma de pagamento (fraudes ÷ total naquela forma).</p>
          </header>
          <ul className="lista-taxas">
            {Object.entries(cache.formaPagamento ?? {}).map(([chave, taxa]) => (
              <li key={chave}>
                <span>{rotuloFormaPagamento(chave)}</span>
                <strong>{formatarPercentual(taxa)}</strong>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
