import { useCallback, useState } from 'react';
import { BarraLateral } from './componentes/BarraLateral.jsx';
import { Analise } from './paginas/Analise.jsx';
import { PreProcessamento } from './paginas/PreProcessamento.jsx';
import { Resultados } from './paginas/Resultados.jsx';

export default function App() {
  const [pagina, setPagina] = useState('preprocessamento');
  const [cache, setCache] = useState(null);
  const [analise, setAnalise] = useState(null);

  const aoAtualizarCache = useCallback((proximo) => {
    setCache(proximo);
  }, []);

  const cachePronto = Boolean(cache?.existe);
  const analisePronta = Boolean(analise);

  function navegar(destino) {
    if (destino === 'analise' && !cachePronto) return;
    if (destino === 'resultados' && !analisePronta) return;
    setPagina(destino);
  }

  return (
    <div className="app">
      <BarraLateral
        pagina={pagina}
        cachePronto={cachePronto}
        analisePronta={analisePronta}
        aoNavegar={navegar}
      />
      <main className="conteudo">
        {pagina === 'preprocessamento' ? (
          <PreProcessamento
            cache={cache}
            aoAtualizarCache={aoAtualizarCache}
            aoAvancar={() => setPagina('analise')}
          />
        ) : null}
        {pagina === 'analise' ? (
          <Analise
            cachePronto={cachePronto}
            aoConcluir={(dados) => {
              setAnalise(dados);
              setPagina('resultados');
            }}
          />
        ) : null}
        {pagina === 'resultados' ? <Resultados analise={analise} /> : null}
      </main>
    </div>
  );
}
