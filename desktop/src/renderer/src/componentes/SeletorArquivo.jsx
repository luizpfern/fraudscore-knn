export function SeletorArquivo({ rotulo, nomeArquivo, desabilitado, aoSelecionar }) {
  return (
    <div className="seletor-arquivo">
      <button type="button" className="btn secundario" disabled={desabilitado} onClick={aoSelecionar}>
        {rotulo}
      </button>
      <span className={`arquivo-nome${nomeArquivo ? '' : ' vazio'}`}>
        {nomeArquivo ?? 'Nenhum arquivo selecionado'}
      </span>
    </div>
  );
}
