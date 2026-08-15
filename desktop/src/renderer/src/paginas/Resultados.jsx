import { CartaoResumo } from '../componentes/CartaoResumo.jsx';
import { GraficoPadroes } from '../componentes/GraficoPadroes.jsx';
import { TabelaResultados } from '../componentes/TabelaResultados.jsx';
import { formatarMoeda, formatarPercentual } from '../formatadores.js';

export function Resultados({ analise }) {
  if (!analise) {
    return (
      <section className="pagina">
        <header className="pagina-cabecalho">
          <p className="etapa">Etapa 3</p>
          <h1>Resultados</h1>
          <p>Rode uma análise para ver o resumo e o detalhamento por transação.</p>
        </header>
      </section>
    );
  }

  async function abrirPasta() {
    await window.api.abrirPastaResultados();
  }

  return (
    <section className="pagina">
      <header className="pagina-cabecalho">
        <p className="etapa">Etapa 3</p>
        <h1>Resultados</h1>
        <p>
          k = {analise.k}, limiar = {analise.limiar}. Relatório completo gravado pelo CLI em{' '}
          <code>resultados/</code>.
        </p>
        <button type="button" className="btn secundario" onClick={abrirPasta}>
          Abrir pasta de resultados
        </button>
      </header>

      <div className="grade-cards">
        <CartaoResumo rotulo="Analisadas" valor={analise.totalAnalisadas} />
        <CartaoResumo
          rotulo="Suspeitas"
          valor={analise.totalSuspeitas}
          destaque="risco"
          subtexto={formatarPercentual(analise.taxaSuspeita)}
        />
        <CartaoResumo rotulo="Taxa de suspeita" valor={formatarPercentual(analise.taxaSuspeita)} destaque="risco" />
        <CartaoResumo
          rotulo="Valor em risco"
          valor={formatarMoeda(analise.valorEmRisco)}
          destaque="risco"
          subtexto="Soma das transações suspeitas"
        />
      </div>

      <GraficoPadroes transacoes={analise.transacoes} />
      <TabelaResultados transacoes={analise.transacoes} />
    </section>
  );
}
