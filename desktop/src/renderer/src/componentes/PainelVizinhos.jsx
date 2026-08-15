import { formatarPercentual } from '../formatadores.js';

export function PainelVizinhos({ vizinhos }) {
  if (!vizinhos?.length) {
    return <p className="vizinhos-vazio">Nenhum vizinho retornado para esta transação.</p>;
  }

  return (
    <div className="painel-vizinhos">
      <p className="vizinhos-titulo">
        Vizinhos usados na decisão <small>({vizinhos.length} mais próximos)</small>
      </p>
      <table>
        <thead>
          <tr>
            <th>ID na base</th>
            <th>Rótulo</th>
            <th>Distância</th>
          </tr>
        </thead>
        <tbody>
          {vizinhos.map((v) => (
            <tr key={`${v.idTransacao}-${v.distancia}`}>
              <td>
                <code>{v.idTransacao}</code>
              </td>
              <td>
                <span className={`selo ${v.fraude === 1 ? 'risco' : 'ok'}`}>
                  {v.fraude === 1 ? 'Fraude' : 'Legítima'}
                </span>
              </td>
              <td>{Number(v.distancia).toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="vizinhos-nota">
        Score = proporção de vizinhos com rótulo fraude (
        {formatarPercentual(vizinhos.filter((v) => v.fraude === 1).length / vizinhos.length)}).
      </p>
    </div>
  );
}
