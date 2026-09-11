const R = 64;
const CIRC = 2 * Math.PI * R;

/** Anel de progresso do loading: preenche de 0 a 100%. */
export default function Anel({ progresso }) {
  return (
    <div className="anel">
      <svg viewBox="0 0 148 148">
        <circle className="trilha" cx="74" cy="74" r={R} fill="none" strokeWidth="9" />
        <circle
          className="prog"
          cx="74"
          cy="74"
          r={R}
          fill="none"
          strokeWidth="9"
          strokeDasharray={CIRC}
          strokeDashoffset={CIRC * (1 - progresso / 100)}
        />
      </svg>
      <div className="pct">{Math.round(progresso)}%</div>
    </div>
  );
}
