import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { ETAPAS } from "../data/etapas.jsx";

const QuizContext = createContext(null);

export function QuizProvider({ children }) {
  // Só em desenvolvimento: ?etapa=23 abre direto numa etapa, pra testar uma
  // tela sem responder o quiz inteiro. Em produção o parâmetro é ignorado.
  const [indice, setIndice] = useState(() => {
    if (!import.meta.env.DEV) return 0;
    const n = Number(new URLSearchParams(window.location.search).get("etapa"));
    return Number.isInteger(n) && n >= 0 && n < ETAPAS.length ? n : 0;
  });
  const [respostas, setRespostas] = useState({});
  const [dados, setDados] = useState({ fotoUrl: null, resultado: null });

  const avancar = useCallback(() => {
    setIndice((i) => Math.min(ETAPAS.length - 1, i + 1));
    window.scrollTo({ top: 0 });
  }, []);

  const voltar = useCallback(() => {
    setIndice((i) => Math.max(0, i - 1));
    window.scrollTo({ top: 0 });
  }, []);

  const responder = useCallback((campo, valor) => {
    setRespostas((r) => ({ ...r, [campo]: valor }));
  }, []);

  const alternar = useCallback((campo, valor) => {
    setRespostas((r) => {
      const atual = r[campo] || [];
      return {
        ...r,
        [campo]: atual.includes(valor) ? atual.filter((v) => v !== valor) : [...atual, valor],
      };
    });
  }, []);

  const definir = useCallback((campos) => {
    setDados((d) => ({ ...d, ...campos }));
  }, []);

  const etapa = ETAPAS[indice];

  const valor = useMemo(
    () => ({ indice, etapa, total: ETAPAS.length, respostas, dados, avancar, voltar, responder, alternar, definir }),
    [indice, etapa, respostas, dados, avancar, voltar, responder, alternar, definir],
  );

  return <QuizContext.Provider value={valor}>{children}</QuizContext.Provider>;
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error("useQuiz precisa estar dentro de QuizProvider");
  return ctx;
}
