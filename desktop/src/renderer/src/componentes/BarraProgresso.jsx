export function BarraProgresso({ ativo, mensagem }) {
  if (!ativo) return null;

  return (
    <div className="progresso" role="status">
      <div className="progresso-trilha">
        <div className="progresso-indeterminado" />
      </div>
      <p>{mensagem || 'Processando...'}</p>
    </div>
  );
}
