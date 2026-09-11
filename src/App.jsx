import { useQuiz } from "./state/QuizContext.jsx";

import HookStep from "./steps/HookStep.jsx";
import PerguntaStep from "./steps/PerguntaStep.jsx";
import InfoStep from "./steps/InfoStep.jsx";
import LoadingStep from "./steps/LoadingStep.jsx";
import DiagnosticoStep from "./steps/DiagnosticoStep.jsx";
import CapturaStep from "./steps/CapturaStep.jsx";
import ScanStep from "./steps/ScanStep.jsx";
import ResultadoStep from "./steps/ResultadoStep.jsx";

const TELAS = {
  hook: HookStep,
  unica: PerguntaStep,
  multi: PerguntaStep,
  info: InfoStep,
  loading: LoadingStep,
  diagnostico: DiagnosticoStep,
  captura: CapturaStep,
  scan: ScanStep,
  resultado: ResultadoStep,
};

export default function App() {
  const { etapa, indice } = useQuiz();
  const Tela = TELAS[etapa.tipo] || PerguntaStep;

  // o scan ocupa a tela inteira e tem fundo próprio: fica fora do .app
  if (etapa.tipo === "scan") return <Tela />;

  return (
    <>
      <div className="app">
        {/* a key força o React a remontar a tela a cada etapa, e é isso que
            dispara a animação de entrada — sem ela a troca seria seca */}
        <div className="tela" key={indice}>
          <Tela />
        </div>
      </div>
    </>
  );
}
