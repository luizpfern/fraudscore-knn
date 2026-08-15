export function CartaoResumo({ rotulo, valor, destaque, subtexto }) {
  return (
    <article className={`cartao-resumo${destaque ? ` destaque-${destaque}` : ''}`}>
      <p className="cartao-rotulo">{rotulo}</p>
      <p className="cartao-valor">{valor}</p>
      {subtexto ? <p className="cartao-sub">{subtexto}</p> : null}
    </article>
  );
}
