import { useEffect, useRef, useState } from "react";
import { Topo } from "../components/Base.jsx";
import Anel from "../components/Anel.jsx";
import { useQuiz } from "../state/QuizContext.jsx";

/**
 * Loading com anel, mais a matéria ou o depoimento embaixo quando a etapa
 * pede — a espera vira mais um momento de argumento em vez de tempo morto.
 *
 * Vai de 0 a 100% e só então avança. (O funil de referência travava num alvo
 * parcial — 30%, 23%, 10% — e pulava de lá. Fica com cara de travado, então
 * aqui fecha a conta.)
 */
export default function LoadingStep() {
  const { etapa, avancar } = useQuiz();
  const duracao = etapa.duracao || 4200;
  const [progresso, setProgresso] = useState(0);
  const avancou = useRef(false);

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
    if (progresso >= 100 && !avancou.current) {
      avancou.current = true;
      const t = setTimeout(avancar, 600);
      return () => clearTimeout(t);
    }
  }, [progresso, avancar]);

  return (
    <>
      <Topo voltar={false} />

      {etapa.materia && (
        <div className="cartao" style={{ padding: 0, overflow: "hidden" }}>
          <img src={etapa.materia.img} alt="" style={{ width: "100%", display: "block" }} />
          <div style={{ padding: "14px 18px" }}>
            <span className="selo" style={{ marginBottom: 8 }}>
              Na imprensa
            </span>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.4, fontWeight: 700, textAlign: "center" }}>
              {etapa.materia.manchete}
            </p>
          </div>
        </div>
      )}

      <div className="loading">
        <Anel progresso={progresso} />
        <p className="loading-label">{etapa.label}</p>
        <p className="loading-sub">{etapa.sub}</p>
      </div>

      {etapa.depoimento && (
        <div className="cartao" style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
          <img
            src={etapa.depoimento.img}
            alt={etapa.depoimento.nome}
            style={{ width: 54, height: 54, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
          />
          <div>
            <p style={{ margin: "0 0 3px", fontSize: 11, letterSpacing: 1, color: "#F5B301" }}>★★★★★</p>
            <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700 }}>{etapa.depoimento.nome}</p>
            <p style={{ margin: "0 0 6px", fontSize: 12, color: "var(--texto-fraco)" }}>{etapa.depoimento.papel}</p>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "var(--texto-suave)" }}>
              {etapa.depoimento.texto}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
