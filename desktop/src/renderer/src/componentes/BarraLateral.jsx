export function BarraLateral({ pagina, cachePronto, analisePronta, aoNavegar }) {
  const itens = [
    { id: 'preprocessamento', numero: '01', titulo: 'Base de referência', descricao: 'Pré-processar o histórico' },
    { id: 'analise', numero: '02', titulo: 'Analisar transações', descricao: 'Rodar o k-NN', bloqueado: !cachePronto },
    { id: 'resultados', numero: '03', titulo: 'Resultados', descricao: 'Score e vizinhos', bloqueado: !analisePronta },
  ];

  return (
    <aside className="barra-lateral">
      <div className="marca">
        <span className="marca-sigla">FS</span>
        <div>
          <strong>FraudScore</strong>
          <span>k-NN · TCC</span>
        </div>
      </div>

      <nav className="nav-etapas">
        {itens.map((item) => {
          const concluida =
            (item.id === 'preprocessamento' && cachePronto) ||
            (item.id === 'analise' && analisePronta) ||
            (item.id === 'resultados' && analisePronta);
          const ativa = pagina === item.id;

          return (
            <button
              key={item.id}
              type="button"
              className={`nav-item${ativa ? ' ativa' : ''}${concluida ? ' concluida' : ''}`}
              disabled={item.bloqueado}
              onClick={() => aoNavegar(item.id)}
            >
              <span className="nav-numero">{concluida && !ativa ? '✓' : item.numero}</span>
              <span className="nav-texto">
                <strong>{item.titulo}</strong>
                <small>{item.descricao}</small>
              </span>
            </button>
          );
        })}
      </nav>

      <p className="barra-nota">A lógica do algoritmo vive no CLI. Esta janela só dispara as mesmas funções.</p>
    </aside>
  );
}
