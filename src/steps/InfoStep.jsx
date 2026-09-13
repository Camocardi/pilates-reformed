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

  // acompanha o arrasto do carrossel só pra acender o ponto certo. Mede pela
  // largura real de um slide + o espaço entre eles: com o slide centralizado,
  // dividir pelo scrollWidth total errava o ponto a partir do segundo slide.
  function aoRolar() {
    const el = trilho.current;
    const primeiro = el?.children[0];
    if (!primeiro) return;
    const passo = primeiro.offsetWidth + parseFloat(getComputedStyle(el).columnGap || 0);
    setSlide(Math.min(etapa.carrossel.length - 1, Math.round(el.scrollLeft / passo)));
  }

  /**
   * Arrasto com MOUSE. No celular a rolagem nativa já responde ao dedo; no
   * computador o navegador não transforma "clicar e arrastar" em rolagem, e o
   * carrossel parecia travado. Só entra quando o ponteiro é mouse — toque
   * segue sendo 100% nativo, com a inércia do próprio sistema.
   *
   * Durante o arrasto o snap fica desligado (senão ele puxa o slide de volta a
   * cada pixel); ao soltar, vai suave até o slide mais próximo.
   */
  const arrasto = useRef(null);

  function irPara(i) {
    const el = trilho.current;
    const alvo = el?.children[i];
    if (!alvo) return;
    el.style.scrollSnapType = "none";
    el.scrollTo({ left: alvo.offsetLeft - (el.clientWidth - alvo.offsetWidth) / 2, behavior: "smooth" });
    // devolve o snap só depois da animação, pra ele não cortar o deslize no meio
    clearTimeout(arrasto.timer);
    arrasto.timer = setTimeout(() => {
      if (trilho.current) trilho.current.style.scrollSnapType = "";
    }, 450);
  }

  function iniciaArrasto(e) {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const el = trilho.current;
    arrasto.current = { x: e.clientX, scroll: el.scrollLeft };
    el.style.scrollSnapType = "none";
    el.classList.add("arrastando");
    el.setPointerCapture(e.pointerId);
  }

  function moveArrasto(e) {
    const a = arrasto.current;
    if (!a) return;
    trilho.current.scrollLeft = a.scroll - (e.clientX - a.x);
  }

  function soltaArrasto() {
    if (!arrasto.current) return;
    arrasto.current = null;
    const el = trilho.current;
    el.classList.remove("arrastando");
    const primeiro = el.children[0];
    const passo = primeiro.offsetWidth + parseFloat(getComputedStyle(el).columnGap || 0);
    irPara(Math.max(0, Math.min(etapa.carrossel.length - 1, Math.round(el.scrollLeft / passo))));
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

      {etapa.titulo && <h1 className="titulo titulo-grande">{etapa.titulo}</h1>}
      {etapa.tituloForte && <TituloForte>{etapa.tituloForte}</TituloForte>}

      {etapa.link && (
        <p style={{ textAlign: "center", margin: "0 0 16px" }}>
          <span
            style={{
              fontSize: 14.5,
              fontWeight: 700,
              color: "var(--cor-600)",
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
          <div
            className="carrossel"
            ref={trilho}
            onScroll={aoRolar}
            onPointerDown={iniciaArrasto}
            onPointerMove={moveArrasto}
            onPointerUp={soltaArrasto}
            onPointerCancel={soltaArrasto}
          >
            {etapa.carrossel.map((item, i) => (
              <div className="carrossel-item" key={i}>
                <div className="foto">
                  <img src={item.img} alt={item.legenda || `Depoimento ${i + 1}`} loading="lazy" draggable={false} />
                </div>
                {item.legenda && <div className="legenda">{item.legenda}</div>}
              </div>
            ))}
          </div>
          <div className="pontos">
            {etapa.carrossel.map((_, i) => (
              <button
                type="button"
                key={i}
                className={i === slide ? "on" : ""}
                onClick={() => irPara(i)}
                aria-label={`Ver depoimento ${i + 1}`}
              />
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

      {/* com carrossel o botão fica logo abaixo dele, como na referência;
          nas outras telas continua empurrado pro rodapé */}
      {etapa.carrossel ? <div style={{ height: 22 }} /> : <div className="espaco" />}
      <Botao onClick={avancar}>
        {etapa.botao}
      </Botao>
      {etapa.nota && <p className="nota">{etapa.nota}</p>}
    </>
  );
}
