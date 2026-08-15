import { useMemo, useState } from 'react';
import { formatarDataHora, formatarMoeda, formatarPercentual, rotuloFormaPagamento } from '../formatadores.js';
import { PainelVizinhos } from './PainelVizinhos.jsx';

/**
 * @param {{ transacoes: Array<object> }} props
 */
export function TabelaResultados({ transacoes }) {
  const [ordem, setOrdem] = useState({ campo: 'score', dir: 'desc' });
  const [expandida, setExpandida] = useState(null);

  const linhas = useMemo(() => {
    const copia = [...transacoes];
    copia.sort((a, b) => {
      const dir = ordem.dir === 'asc' ? 1 : -1;
      if (ordem.campo === 'score') return (a.score - b.score) * dir;
      if (ordem.campo === 'valor') return ((a.valor ?? 0) - (b.valor ?? 0)) * dir;
      const va = String(a[ordem.campo] ?? '');
      const vb = String(b[ordem.campo] ?? '');
      return va.localeCompare(vb, 'pt-BR') * dir;
    });
    return copia;
  }, [transacoes, ordem]);

  function alternarOrdem(campo) {
    setOrdem((atual) =>
      atual.campo === campo ? { campo, dir: atual.dir === 'asc' ? 'desc' : 'asc' } : { campo, dir: 'desc' },
    );
  }

  function cabecalho(campo, texto) {
    const ativa = ordem.campo === campo;
    return (
      <button type="button" className={`th-sort${ativa ? ' ativa' : ''}`} onClick={() => alternarOrdem(campo)}>
        {texto}
        {ativa ? (ordem.dir === 'asc' ? ' ↑' : ' ↓') : ''}
      </button>
    );
  }

  return (
    <section className="painel">
      <header>
        <h3>Detalhamento por transação</h3>
        <p>Clique em uma linha para ver os k vizinhos que explicam a decisão.</p>
      </header>
      <div className="tabela-wrap">
        <table className="tabela-resultados">
          <thead>
            <tr>
              <th>{cabecalho('idTransacao', 'ID')}</th>
              <th>{cabecalho('valor', 'Valor')}</th>
              <th>{cabecalho('formaPagamento', 'Pagamento')}</th>
              <th>{cabecalho('dataHora', 'Data/hora')}</th>
              <th>{cabecalho('score', 'Score')}</th>
              <th>{cabecalho('decisao', 'Decisão')}</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((t) => {
              const aberta = expandida === t.idTransacao;
              return (
                <FragmentoLinha
                  key={t.idTransacao}
                  transacao={t}
                  aberta={aberta}
                  aoClicar={() => setExpandida(aberta ? null : t.idTransacao)}
                />
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function FragmentoLinha({ transacao, aberta, aoClicar }) {
  return (
    <>
      <tr className={`linha-clicavel${aberta ? ' aberta' : ''}`} onClick={aoClicar}>
        <td>
          <code>{transacao.idTransacao}</code>
        </td>
        <td>{transacao.valor == null ? '—' : formatarMoeda(transacao.valor)}</td>
        <td>{rotuloFormaPagamento(transacao.formaPagamento)}</td>
        <td>{formatarDataHora(transacao.dataHora)}</td>
        <td className="mono">{formatarPercentual(transacao.score)}</td>
        <td>
          <span className={`selo ${transacao.decisao === 'suspeita' ? 'risco' : 'ok'}`}>
            {transacao.decisao === 'suspeita' ? 'Suspeita' : 'Aprovada'}
          </span>
        </td>
      </tr>
      {aberta ? (
        <tr className="linha-expansao">
          <td colSpan={6}>
            <PainelVizinhos vizinhos={transacao.vizinhos} />
          </td>
        </tr>
      ) : null}
    </>
  );
}
