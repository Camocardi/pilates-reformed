const R = 64;
const CIRC = 2 * Math.PI * R;

/**
 * Anel de progresso do loading: preenche de 0 a 100%.
 *
 * A cor vai como ATRIBUTO, não só por CSS. Antes o traço era `url(#gradAnel)`,
 * e referência a um gradiente que não existe mais renderiza invisível — o anel
 * some inteiro, sem erro nenhum no console. Cor literal não tem esse modo de
 * falha, nem depende de o CSS certo ter chegado ao navegador.
 *
 * Sem `transition` no dashoffset de propósito: o valor já chega suave, quadro a
 * quadro, pelo requestAnimationFrame de quem usa o componente. Uma transição
 * por cima disso reinicia a cada quadro e faz o anel arrastar atrás do número.
 */
export default function Anel({ progresso }) {
  const pct = Math.max(0, Math.min(100, progresso || 0));

  return (
    <div className="anel">
      <svg viewBox="0 0 148 148">
        <circle cx="74" cy="74" r={R} fill="none" stroke="#EDE9FE" strokeWidth="9" />
        <circle
          cx="74"
          cy="74"
          r={R}
          fill="none"
          stroke="#6D28D9"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - pct / 100)}
        />
      </svg>
      <div className="pct">{Math.round(pct)}%</div>
    </div>
  );
}
