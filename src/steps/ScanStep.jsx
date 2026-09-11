import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useQuiz } from "../state/QuizContext.jsx";
import {
  analisaCorpo,
  paraPathD,
  amostraBezier,
  LINHA_COR,
  LINHA_ESPESSURA,
  LINHA_ORDEM,
  COR_CONTORNO,
  CANVAS,
} from "../lib/bodyDrawing.js";

const TOTAL_MS = 9000;

// os pontos do rastro aparecem este tanto antes de a linha começar a se
// desenhar, então a linha parece seguir um caminho já marcado
const RASTRO_ADIANTADO = 450;

const ATRASO_LINHA_BASE = TOTAL_MS * 0.4;
const ATRASO_LINHA_PASSO = TOTAL_MS * 0.09;
const ATRASO_MARCO_BASE = TOTAL_MS * 0.16;
const ATRASO_MARCO_PASSO = TOTAL_MS * 0.025;

// as legendas acompanham o que está aparecendo na tela naquele instante:
// primeiro o contorno acende, depois as fitas de medição, uma a uma
const LEGENDAS = [
  [0, "Localizando você na foto…"],
  [12, "Contornando a sua silhueta…"],
  [32, "Marcando a linha da cintura…"],
  [48, "Avaliando a região abdominal…"],
  [62, "Medindo coxas e pernas…"],
  [78, "Cruzando com as suas respostas…"],
  [90, "Montando o seu protocolo…"],
];

function legendaDe(progresso) {
  let texto = LEGENDAS[0][1];
  for (const [limite, label] of LEGENDAS) {
    if (progresso >= limite) texto = label;
  }
  return texto;
}

export default function ScanStep() {
  const { dados, definir, avancar } = useQuiz();
  const [pontos, setPontos] = useState(null);
  const [progresso, setProgresso] = useState(0);
  const refsLinha = useRef({});
  const rodou = useRef(false);
  const avancou = useRef(false);

  // sem foto (a usuária preferiu pular) o scan não tem o que analisar:
  // encurta a espera em vez de segurar 9 segundos numa tela vazia
  const semFoto = !dados.fotoUrl;
  const duracao = semFoto ? 2600 : TOTAL_MS;

  useEffect(() => {
    let raf;
    const inicio = performance.now();
    function passo(agora) {
      const p = Math.min(100, ((agora - inicio) / duracao) * 100);
      setProgresso(p);
      if (p < 100) raf = requestAnimationFrame(passo);
    }
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [duracao]);

  useEffect(() => {
    if (rodou.current || semFoto) return;
    rodou.current = true;
    (async () => {
      try {
        const resultado = await analisaCorpo(dados.fotoUrl);
        definir({ resultado });
        setPontos(resultado.pontos);
      } catch (err) {
        console.warn("Falha na análise corporal:", err);
        definir({ resultado: null });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (progresso >= 100 && !avancou.current) {
      avancou.current = true;
      const t = setTimeout(avancar, 450);
      return () => clearTimeout(t);
    }
  }, [progresso, avancar]);

  // roda antes da pintura pra que cada linha comece escondida já no primeiro
  // quadro: uma @keyframes sempre parte do próprio `from`, ao contrário de uma
  // transition, que depende do valor anterior ter pintado antes
  useLayoutEffect(() => {
    if (!pontos) return;
    LINHA_ORDEM.forEach((chave, i) => {
      const el = refsLinha.current[chave];
      if (!el || el.dataset.desenhada) return;
      el.dataset.desenhada = "1";
      el.style.setProperty("--len", String(el.getTotalLength()));
      el.style.animationDelay = `${ATRASO_LINHA_BASE + i * ATRASO_LINHA_PASSO}ms`;
      el.classList.add("linha-desenha");
    });
  }, [pontos]);

  return (
    <div className="scan">
      <div className="scan-foto">
        {/* a foto vive DENTRO do svg pra que imagem e pontos detectados
            compartilhem um único sistema de coordenadas em qualquer proporção de tela */}
        <svg
          className="scan-svg"
          viewBox={`0 0 ${CANVAS.W} ${CANVAS.H}`}
          preserveAspectRatio="xMidYMid slice"
        >
          {dados.fotoUrl && (
            <image
              href={dados.fotoUrl}
              width={CANVAS.W}
              height={CANVAS.H}
              preserveAspectRatio="xMidYMid slice"
            />
          )}

          {pontos && (
            <>
              {/* contorno do corpo: os pontos acendem de cima pra baixo, no
                  mesmo sentido do feixe, então lê como o scanner passando */}
              {(pontos.contorno || []).map((p, i) => (
                <circle
                  key={`c-${i}`}
                  className="linha-ponto"
                  cx={p.x}
                  cy={p.y}
                  r={3.2}
                  fill={COR_CONTORNO}
                  style={{ animationDelay: `${600 + i * 34}ms` }}
                />
              ))}

              {LINHA_ORDEM.map((chave, i) => {
                const atraso = ATRASO_LINHA_BASE + i * ATRASO_LINHA_PASSO;
                return amostraBezier(pontos[chave], 6).map((p, j) => (
                  <circle
                    key={`${chave}-${j}`}
                    className="linha-ponto"
                    cx={p.x}
                    cy={p.y}
                    r={2.6}
                    fill={LINHA_COR[chave]}
                    style={{ animationDelay: `${Math.max(0, atraso - RASTRO_ADIANTADO)}ms` }}
                  />
                ));
              })}

              {LINHA_ORDEM.map((chave) => (
                <path
                  key={chave}
                  ref={(el) => {
                    refsLinha.current[chave] = el;
                  }}
                  d={paraPathD(pontos[chave])}
                  stroke={LINHA_COR[chave]}
                  strokeWidth={LINHA_ESPESSURA[chave]}
                  fill="none"
                  strokeLinecap="round"
                  style={{ filter: `drop-shadow(0 0 4px ${LINHA_COR[chave]})` }}
                />
              ))}

              {(pontos.marcos || []).map((m, i) => (
                <circle
                  key={i}
                  className="marco-ponto"
                  cx={m.x}
                  cy={m.y}
                  r={5}
                  fill="rgba(255,255,255,0.9)"
                  style={{ animationDelay: `${ATRASO_MARCO_BASE + i * ATRASO_MARCO_PASSO}ms` }}
                />
              ))}
            </>
          )}
        </svg>

        <div className="scan-veu" />
        {progresso < 97 && <div className="scan-feixe" />}
      </div>

      <div className="scan-painel">
        <div className="scan-pct">{Math.round(progresso)}%</div>
        <div className="scan-trilha">
          <div className="scan-fill" style={{ width: `${progresso}%` }} />
        </div>
        <p className="scan-legenda" key={legendaDe(progresso)}>
          {legendaDe(progresso)}
        </p>
      </div>
    </div>
  );
}
