import { LINHA_COR } from "../lib/bodyDrawing.js";

/**
 * Silhueta decorativa da etapa da foto: mostra, antes de a usuária enviar
 * qualquer coisa, exatamente quais marcações o scan vai fazer. Serve de
 * enquadramento ("de frente, em pé, corpo inteiro") e de promessa do resultado.
 */
export default function Silhueta() {
  return (
    <svg className="silhueta" viewBox="0 0 130 230" fill="none" aria-hidden="true">
      <g stroke="var(--cor-400)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="65" cy="24" r="14" />
        <path d="M65 38c-6 0-9 3-11 6l-9 17c-3 6-4 12-3 18l3 19c1 6 1 11 0 17l-3 20c-1 8 0 16 1 24l4 30" />
        <path d="M65 38c6 0 9 3 11 6l9 17c3 6 4 12 3 18l-3 19c-1 6-1 11 0 17l3 20c1 8 0 16-1 24l-4 30" />
        <path d="M65 152v37" />
        <path d="M46 55 34 92l-4 26" />
        <path d="M84 55l12 37 4 26" />
      </g>

      {/* marcações que o scan vai desenhar, piscando devagar */}
      <g strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 5">
        <path className="pisca" d="M39 104h52" stroke={LINHA_COR.cintura} />
        <path className="pisca" d="M37 128h56" stroke={LINHA_COR.barriga} style={{ animationDelay: "0.5s" }} />
        <path className="pisca" d="M46 55 34 92" stroke={LINHA_COR.braco} style={{ animationDelay: "1s" }} />
        <path className="pisca" d="M54 36q11 8 22 0" stroke={LINHA_COR.papada} style={{ animationDelay: "1.5s" }} />
      </g>
    </svg>
  );
}
