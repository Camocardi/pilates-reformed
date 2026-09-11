import { useState } from "react";
import { Tique } from "./Base.jsx";

/**
 * Lista de opções do quiz, nos quatro formatos que o funil usa:
 *
 *   cheia  → cartão preenchido com o gradiente (só a primeira tela)
 *   thumb  → texto à esquerda, miniatura à direita (classificação do corpo)
 *   img    → cartão vertical, imagem em cima (corpo desejado)
 *   emoji  → emoji à esquerda, ou à direita quando a etapa pede `emojiDir`
 *
 * Na escolha única o avanço é adiado em ~380ms de propósito: sem essa pausa
 * a tela troca antes de a animação de seleção terminar e a usuária nunca vê
 * o próprio toque ser registrado — é o detalhe que faz um quiz parecer travado.
 */
export default function Opcoes({ etapa, valor, onEscolher, onAlternar }) {
  const [travado, setTravado] = useState(false);
  const multi = etapa.tipo === "multi";
  const variante = etapa.variante || "lista";
  const marcados = multi ? valor || [] : [];

  const classeLista =
    etapa.grade === 3 ? "opcoes opcoes-grid3" : etapa.grade === 2 ? "opcoes opcoes-grid2" : "opcoes";

  function escolher(opcao) {
    if (multi) {
      onAlternar(opcao);
      return;
    }
    if (travado) return;
    setTravado(true);
    onEscolher(opcao.valor);
  }

  const Marca = () => (
    <span className="opcao-marca">
      <Tique />
    </span>
  );

  return (
    <div className={classeLista}>
      {etapa.opcoes.map((opcao, i) => {
        const marcada = multi ? marcados.includes(opcao.valor) : valor === opcao.valor;

        return (
          <button
            type="button"
            key={opcao.valor}
            style={{ "--i": i }}
            className={[
              "opcao",
              variante === "cheia" ? "opcao-cheia" : "",
              variante === "thumb" ? "opcao-thumb" : "",
              variante === "img" ? "opcao-img" : "",
              marcada ? "marcada" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => escolher(opcao)}
            aria-pressed={marcada}
          >
            {variante === "img" ? (
              <>
                <div className="moldura">
                  <img src={opcao.img} alt={opcao.rotulo} loading="lazy" />
                </div>
                <div className="rodape">
                  <Marca />
                  <span className="opcao-texto">{opcao.rotulo}</span>
                </div>
              </>
            ) : variante === "thumb" ? (
              <>
                <Marca />
                <span className="opcao-texto">{opcao.rotulo}</span>
                <span className="thumb">
                  <img src={opcao.img} alt={opcao.rotulo} loading="lazy" />
                </span>
              </>
            ) : etapa.emojiDir ? (
              <>
                <Marca />
                <span className="opcao-texto">{opcao.rotulo}</span>
                {opcao.emoji && <span className="opcao-emoji">{opcao.emoji}</span>}
              </>
            ) : (
              <>
                {opcao.emoji && <span className="opcao-emoji">{opcao.emoji}</span>}
                <Marca />
                <span className="opcao-texto">{opcao.rotulo}</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
