import { useQuiz } from "../state/QuizContext.jsx";

/** Tique branco usado nas marcas de seleção e nas listas. */
export function Tique({ cor = "#fff" }) {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2 6.4 4.6 9 10 3.2" stroke={cor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * Topo: só a barra de progresso e, quando faz sentido, uma seta de voltar
 * discreta embaixo dela.
 *
 * Nada de marca nem contador "3/26" aqui. O funil de referência deixa esse
 * espaço limpo de propósito — contar as etapas que faltam só informa à
 * usuária quanto trabalho ela ainda tem, e a marca não ajuda em nada no meio
 * de um quiz que ela já começou.
 */
export function Topo({ voltar = false }) {
  const { indice, etapa, voltar: irAtras } = useQuiz();
  const mostrarVoltar = voltar && indice > 0;

  return (
    <div className="topo">
      {!etapa.semBarra && (
        <div
          className="barra"
          role="progressbar"
          aria-valuenow={etapa.progresso}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <i style={{ width: `${etapa.progresso}%` }} />
        </div>
      )}
      {mostrarVoltar && (
        <button type="button" className="topo-voltar" onClick={irAtras} aria-label="Voltar">
          ←
        </button>
      )}
    </div>
  );
}

export function Botao({ children, onClick, disabled }) {
  return (
    <button type="button" className="botao" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function BotaoLinha({ children, onClick }) {
  return (
    <button type="button" className="botao-linha" onClick={onClick}>
      {children}
    </button>
  );
}

export function BotaoTexto({ children, onClick }) {
  return (
    <button type="button" className="botao-texto" onClick={onClick}>
      {children}
    </button>
  );
}

export function Titulo({ children, alinhar }) {
  return <h1 className={`titulo${alinhar === "esq" ? " titulo-esq" : ""}`}>{children}</h1>;
}

/** Título dos momentos de impacto: caixa alta, curto, cor chapada. */
export function TituloForte({ children }) {
  return <h2 className="titulo-forte">{children}</h2>;
}

export function Subtitulo({ children, alinhar }) {
  return <p className={`subtitulo${alinhar === "esq" ? " subtitulo-esq" : ""}`}>{children}</p>;
}
