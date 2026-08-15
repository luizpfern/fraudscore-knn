import { rotuloFormaPagamento } from '../formatadores.js';

/**
 * @param {Array<{ dataHora: string|null, decisao: string, formaPagamento: string|null }>} transacoes
 */
function agregarPorHora(transacoes) {
  const buckets = Array.from({ length: 24 }, (_, hora) => ({ hora, total: 0, suspeitas: 0 }));
  for (const t of transacoes) {
    if (!t.dataHora) continue;
    const hora = new Date(t.dataHora).getHours();
    if (!Number.isInteger(hora) || hora < 0 || hora > 23) continue;
    buckets[hora].total += 1;
    if (t.decisao === 'suspeita') buckets[hora].suspeitas += 1;
  }
  return buckets
    .filter((b) => b.total > 0)
    .map((b) => ({
      rotulo: `${String(b.hora).padStart(2, '0')}h`,
      taxa: b.suspeitas / b.total,
      detalhe: `${b.suspeitas}/${b.total}`,
    }));
}

/**
 * @param {Array<{ formaPagamento: string|null, decisao: string }>} transacoes
 */
function agregarPorPagamento(transacoes) {
  /** @type {Map<string, { total: number, suspeitas: number }>} */
  const mapa = new Map();
  for (const t of transacoes) {
    const chave = t.formaPagamento ?? 'desconhecido';
    const atual = mapa.get(chave) ?? { total: 0, suspeitas: 0 };
    atual.total += 1;
    if (t.decisao === 'suspeita') atual.suspeitas += 1;
    mapa.set(chave, atual);
  }
  return [...mapa.entries()].map(([chave, stats]) => ({
    rotulo: rotuloFormaPagamento(chave),
    taxa: stats.suspeitas / stats.total,
    detalhe: `${stats.suspeitas}/${stats.total}`,
  }));
}

function Barras({ itens, vazio }) {
  if (!itens.length) {
    return <p className="grafico-vazio">{vazio}</p>;
  }

  return (
    <ul className="grafico-barras">
      {itens.map((item) => (
        <li key={item.rotulo}>
          <span className="barra-rotulo">{item.rotulo}</span>
          <div className="barra-trilha">
            <div className="barra-preenchimento" style={{ width: `${Math.round(item.taxa * 100)}%` }} />
          </div>
          <span className="barra-valor">
            {Math.round(item.taxa * 100)}% <small>({item.detalhe})</small>
          </span>
        </li>
      ))}
    </ul>
  );
}

export function GraficoPadroes({ transacoes }) {
  const porHora = agregarPorHora(transacoes);
  const porPagamento = agregarPorPagamento(transacoes);

  return (
    <section className="grade-graficos">
      <article className="painel">
        <header>
          <h3>Taxa de suspeita por hora</h3>
          <p>Frações de transações marcadas como suspeitas em cada hora do dia.</p>
        </header>
        <Barras itens={porHora} vazio="Sem data/hora nas transações analisadas." />
      </article>
      <article className="painel">
        <header>
          <h3>Taxa de suspeita por forma de pagamento</h3>
          <p>Onde o k-NN concentrou as decisões de risco.</p>
        </header>
        <Barras itens={porPagamento} vazio="Sem forma de pagamento nas transações analisadas." />
      </article>
    </section>
  );
}
