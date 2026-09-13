import { useLayoutEffect, useRef, useState } from "react";

/**
 * Ilustração animada da tela de captura — o equivalente, pro corpo, do
 * scanner da mão da Constella.
 *
 * Mesma receita em camadas: uma "tela" escura com cantoneiras, o desenho em
 * traço, as marcações redesenhando em loop e um feixe varrendo de cima a
 * baixo. A diferença é que aqui tudo é vetor desenhado no próprio SVG, sem
 * PNG exportado de Lottie: não há imagem pra baixar, fica nítido em qualquer
 * densidade de tela, e trocar a cor do funil troca a ilustração junto.
 *
 * O corpo é desenhado pela METADE e espelhado. Garante simetria exata sem
 * precisar manter dois caminhos em sincronia na mão.
 */

// metade direita da silhueta (x > 100), do pescoço até o meio das pernas,
// passando pelo braço levemente afastado do tronco
const METADE =
  "M108,64 C116,66 128,68 134,74 C140,80 141,92 142,104 C143,120 145,134 146,146 " +
  "C148,160 150,172 151,184 C153,194 152,202 147,204 C142,205 141,196 141,186 " +
  "C140,174 137,160 135,148 C133,134 131,118 128,104 C129,112 128,120 124,128 " +
  "C120,136 118,142 119,150 C120,160 127,168 129,180 C131,194 128,210 125,226 " +
  "C123,240 124,254 122,266 C120,278 118,284 119,290 C120,296 110,297 106,293 " +
  "C104,284 106,270 106,258 C106,244 105,232 104,218 C103,206 102,196 100,190";

const CABELO = "M100,12 C113,12 121,22 120,38 C119,50 122,58 127,66";
const PESCOCO = "M107,52 C106,58 107,62 108,64";
const ESPELHO = "translate(200 0) scale(-1 1)";

// fitas de medição, na mesma ordem em que aparecem na leitura de verdade
const MEDIDAS = [
  "M89,49 Q100,59 111,49", // queixo
  "M127,108 Q135,115 143,108", // braço
  "M80,149 Q100,157 120,149", // cintura
  "M74,167 Q100,176 126,167", // abdômen
  "M103,206 Q115,213 128,206", // coxa
];

const ETIQUETAS = [
  { texto: "Queixo", estilo: { top: "11%", right: "-7%" } },
  { texto: "Braços", estilo: { top: "35%", right: "-9%" } },
  { texto: "Cintura", estilo: { top: "46%", left: "-9%" } },
  { texto: "Abdômen", estilo: { top: "56%", right: "-10%" } },
  { texto: "Coxas", estilo: { top: "67%", left: "-6%" } },
];

const PONTOS_POR_LADO = 14;
const INTRO_MS = 1800; // tempo do contorno se desenhando antes do resto começar

export default function ScannerCorpo() {
  const metadeRef = useRef(null);
  const tracos = useRef([]);
  const medidas = useRef([]);
  const [pontos, setPontos] = useState([]);

  useLayoutEffect(() => {
    // comprimento real de cada traço, pro efeito de "caneta desenhando"
    [...tracos.current, ...medidas.current].forEach((el) => {
      if (el) el.style.setProperty("--len", String(el.getTotalLength()));
    });

    // pontos distribuídos por igual AO LONGO do contorno (não por altura), e
    // depois espelhados — então o braço e as pernas recebem pontos na mesma
    // densidade que o tronco
    const caminho = metadeRef.current;
    if (!caminho) return;
    const total = caminho.getTotalLength();
    const lado = [];
    for (let i = 0; i < PONTOS_POR_LADO; i++) {
      const p = caminho.getPointAtLength((total * (i + 0.5)) / PONTOS_POR_LADO);
      lado.push({ x: p.x, y: p.y });
    }
    // acendem de cima pra baixo, no sentido do feixe
    const todos = [...lado, ...lado.map((p) => ({ x: 200 - p.x, y: p.y }))].sort((a, b) => a.y - b.y);
    setPontos(todos);
  }, []);

  const guardaTraco = (i) => (el) => {
    tracos.current[i] = el;
  };

  return (
    <div className="scanner" aria-hidden="true">
      <div className="scanner-tela">
        <svg className="scanner-grade">
          <defs>
            <pattern id="gradePontos" width="14" height="14" patternUnits="userSpaceOnUse">
              <circle cx="7" cy="7" r="0.9" fill="rgba(255,255,255,0.08)" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gradePontos)" />
        </svg>

        <svg className="scanner-corpo" viewBox="0 0 200 300">
          <ellipse ref={guardaTraco(0)} className="scanner-traco" cx="100" cy="34" rx="17" ry="21" />
          <path ref={guardaTraco(1)} className="scanner-traco" d={CABELO} />
          <path ref={guardaTraco(2)} className="scanner-traco" d={CABELO} transform={ESPELHO} />
          <path ref={guardaTraco(3)} className="scanner-traco" d={PESCOCO} />
          <path ref={guardaTraco(4)} className="scanner-traco" d={PESCOCO} transform={ESPELHO} />
          <path ref={(el) => { metadeRef.current = el; tracos.current[5] = el; }} className="scanner-traco" d={METADE} />
          <path ref={guardaTraco(6)} className="scanner-traco" d={METADE} transform={ESPELHO} />

          {pontos.map((p, i) => (
            <circle
              key={i}
              className="scanner-ponto"
              cx={p.x}
              cy={p.y}
              r="2.4"
              style={{ animationDelay: `${INTRO_MS + (i * 1600) / pontos.length}ms` }}
            />
          ))}

          {MEDIDAS.map((d, i) => (
            <path
              key={d}
              ref={(el) => {
                medidas.current[i] = el;
              }}
              className="scanner-medida"
              d={d}
              style={{ animationDelay: `${INTRO_MS + 300 + i * 380}ms` }}
            />
          ))}
        </svg>

        <span className="cantoneira ce" />
        <span className="cantoneira cd" />
        <span className="cantoneira be" />
        <span className="cantoneira bd" />

        <div className="scanner-feixe" />

        <div className="scanner-status">
          <i />
          Pronto para escanear
        </div>
      </div>

      {ETIQUETAS.map((e, i) => (
        <span
          key={e.texto}
          className="scanner-etiqueta"
          style={{
            ...e.estilo,
            animationDelay: `${INTRO_MS / 1000 + 0.2 + i * 0.25}s, ${i * 0.45}s`,
          }}
        >
          {e.texto}
        </span>
      ))}
    </div>
  );
}
