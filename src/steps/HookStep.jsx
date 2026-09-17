import Opcoes from "../components/Opcoes.jsx";
import { useQuiz } from "../state/QuizContext.jsx";

/**
 * Primeira tela, no layout da capa de referência. Sem barra de progresso e
 * sem voltar: o compromisso ainda não começou, e mostrar "1 de 26" aqui só
 * informa quanto trabalho ainda falta.
 */
export default function HookStep() {
  const { etapa, respostas, responder, avancar } = useQuiz();

  function escolher(valor) {
    responder(etapa.campo, valor);
    setTimeout(avancar, 380);
  }

  return (
    <div className="hook">
      {/* as duas cores correm na MESMA frase, quebrando onde a largura mandar —
          em blocos separados a manchete perde o ritmo de uma frase só */}
      <h1 className="hook-titulo">
        <span className="hook-cor">{etapa.linha1}</span> {etapa.linha2}
      </h1>

      <p className="hook-destaque">
        <span className="hook-marca">{etapa.destaque}</span>
      </p>

      <div className="hook-imagem">
        <img src={etapa.imagem} alt="Antes e depois" />
      </div>

      <h2 className="titulo hook-pergunta">{etapa.pergunta}</h2>
      <p className="subtitulo">{etapa.subtitulo}</p>

      <Opcoes etapa={etapa} valor={respostas[etapa.campo]} onEscolher={escolher} onAlternar={() => {}} />

      <div className="hook-aviso">{etapa.rodape.aviso}</div>
      <p className="hook-tempo">✅ {etapa.rodape.tempo}</p>
    </div>
  );
}
