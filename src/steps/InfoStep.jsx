import { useRef, useState } from "react";
import { Topo, Botao, Tique, TituloForte } from "../components/Base.jsx";
import { useQuiz } from "../state/QuizContext.jsx";

/**
 * Tela de conteúdo (prova social, solução). Monta só os blocos que a etapa
 * declarou, então o mesmo componente serve para formatos bem diferentes sem
 * virar uma pilha de exceções.
 */
export default function InfoStep() {
  const { etapa, avancar } = useQuiz();
  const [slide, setSlide] = useState(0);
  const trilho = useRef(null);

  // acompanha o arrasto do carrossel só pra acender o ponto certo
  function aoRolar() {
    const el = trilho.current;
    if (!el) return;
    setSlide(Math.round((el.scrollLeft / el.scrollWidth) * etapa.carrossel.length));
  }

  return (
    <>
      <Topo />

      {etapa.faixaVerde && <div className="aviso aviso-verde">{etapa.faixaVerde}</div>}

      {etapa.imagem && (
        <div className="imagem-bloco">
          <img src={etapa.imagem} alt="" />
        </div>
      )}

      {etapa.tituloForte && <TituloForte>{etapa.tituloForte}</TituloForte>}

      {etapa.link && (
        <p style={{ textAlign: "center", margin: "0 0 16px" }}>
          <span
            style={{
              fontSize: 13.5,
              fontWeight: 700,
              color: "var(--cor-700)",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            {etapa.link}
          </span>
        </p>
      )}

      {etapa.carrossel && (
        <>
          <div className="carrossel" ref={trilho} onScroll={aoRolar}>
            {etapa.carrossel.map((item, i) => (
              <div className="carrossel-item" key={i}>
                <div className="foto">
                  <img src={item.img} alt={item.legenda || `Depoimento ${i + 1}`} loading="lazy" />
                </div>
                {item.legenda && <div className="legenda">{item.legenda}</div>}
              </div>
            ))}
          </div>
          <div className="pontos">
            {etapa.carrossel.map((_, i) => (
              <span key={i} className={i === slide ? "on" : ""} />
            ))}
          </div>
        </>
      )}

      {etapa.cartoes && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 14 }}>
          {etapa.cartoes.map((c) => (
            <div className="cartao" key={c.tag} style={{ marginBottom: 0, padding: 15, textAlign: "center" }}>
              <p style={{ margin: "0 0 7px" }}>
                <span className="marca" style={{ fontSize: 13, fontWeight: 700, color: "var(--cor-700)" }}>
                  {c.tag}
                </span>
              </p>
              <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.5, color: "var(--texto-suave)" }}>{c.texto}</p>
            </div>
          ))}
        </div>
      )}

      {etapa.lista && (
        <div className="cartao">
          {etapa.listaTitulo && (
            <p style={{ margin: "0 0 4px", fontWeight: 800, fontSize: 13.5, textAlign: "center", letterSpacing: "0.02em" }}>
              {etapa.listaTitulo}
            </p>
          )}
          <ul className="lista-check">
            {etapa.lista.map((item) => (
              <li key={item}>
                <span className="tick">
                  <Tique />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {etapa.pergunta && <TituloForte>{etapa.pergunta}</TituloForte>}

      <div className="espaco" />
      <Botao onClick={avancar}>
        {etapa.botao}
      </Botao>
      {etapa.nota && <p className="nota">{etapa.nota}</p>}
    </>
  );
}
