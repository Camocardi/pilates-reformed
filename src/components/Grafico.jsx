import { useEffect, useRef } from "react";

/**
 * Curva do diagnóstico: sai do mínimo ideal (alto, à esquerda) e desce até o
 * ponto onde a usuária está. A linha se desenha em vez de aparecer pronta —
 * é a diferença entre "gráfico ilustrativo" e "acabaram de calcular isso".
 */
export default function Grafico({ tag = "Mínimo ideal", eixo = ["Alta hormonal", "Baixa hormonal"] }) {
  const linha = useRef(null);

  useEffect(() => {
    const el = linha.current;
    if (el) el.style.setProperty("--len", String(el.getTotalLength()));
  }, []);

  return (
    <div className="cartao">
      <p style={{ margin: "0 0 4px" }}>
        <span
          style={{
            display: "inline-block",
            padding: "4px 10px",
            borderRadius: 99,
            background: "var(--card)",
            border: "1px solid var(--linha)",
            boxShadow: "var(--sombra-card)",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {tag}
        </span>
      </p>

      <svg viewBox="0 0 300 160" width="100%" height="146" role="img" aria-label="Curva hormonal">
        <defs>
          <linearGradient id="gradLinha" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#E11D48" />
            <stop offset="55%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
          <linearGradient id="gradArea" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#E11D48" stopOpacity="0.2" />
            <stop offset="55%" stopColor="#F59E0B" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {[30, 60, 90, 120].map((y) => (
          <line key={y} x1="28" y1={y} x2="288" y2={y} stroke="#EBE6F7" strokeWidth="1" />
        ))}
        <line x1="28" y1="22" x2="28" y2="140" stroke="#EBE6F7" strokeWidth="1" />
        <line x1="28" y1="140" x2="288" y2="140" stroke="#EBE6F7" strokeWidth="1" />

        <polygon points="28,28 288,112 288,140 28,140" fill="url(#gradArea)" />
        <polyline
          ref={linha}
          className="gr-linha"
          points="28,28 288,112"
          fill="none"
          stroke="url(#gradLinha)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        <circle cx="28" cy="28" r="5.5" fill="#E11D48" />
        <g className="gr-ponto">
          <circle cx="288" cy="112" r="6" fill="#10B981" />
          <rect x="246" y="86" width="44" height="18" rx="9" fill="#10B981" />
          <text x="268" y="99" fontSize="11" fill="#fff" fontWeight="700" textAnchor="middle">
            Você
          </text>
        </g>

        {[["80", 32], ["60", 62], ["40", 92], ["20", 122], ["0", 143]].map(([t, y]) => (
          <text key={t} x="4" y={y} fontSize="10" fill="#A29BB5">
            {t}
          </text>
        ))}
      </svg>

      <div className="gr-eixo">
        <span>{eixo[0]}</span>
        <span>{eixo[1]}</span>
      </div>
    </div>
  );
}
