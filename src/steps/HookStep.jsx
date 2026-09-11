import { Titulo, Subtitulo } from "../components/Base.jsx";
import Opcoes from "../components/Opcoes.jsx";
import { useQuiz } from "../state/QuizContext.jsx";

/**
 * Primeira tela. Sem barra de progresso e sem botão de voltar: o
 * compromisso ainda não começou, e mostrar "1 de 26" aqui só informa quanto
 * trabalho ela ainda vai ter pela frente.
 */
export default function HookStep() {
  const { etapa, respostas, responder, avancar } = useQuiz();

  function escolher(valor) {
    responder(etapa.campo, valor);
    setTimeout(avancar, 380);
  }

  return (
    <>
      <div style={{ height: 30 }} />

      <h1 className="titulo-forte" style={{ fontSize: 22, marginBottom: 10 }}>
        {etapa.linha1}
        <span style={{ display: "block", color: "var(--texto)" }}>{etapa.linha2}</span>
      </h1>
      <p style={{ textAlign: "center", margin: "0 0 16px" }}>
        <span className="marca-forte" style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.03em" }}>
          {etapa.destaque}
        </span>
      </p>

      <div className="imagem-bloco">
        <img src={etapa.imagem} alt="Antes e depois" />
      </div>

      <Titulo alinhar="esq">{etapa.pergunta}</Titulo>
      <Subtitulo alinhar="esq">{etapa.subtitulo}</Subtitulo>

      <Opcoes etapa={etapa} valor={respostas[etapa.campo]} onEscolher={escolher} onAlternar={() => {}} />

      <div className="aviso aviso-roxo" style={{ marginTop: 18 }}>
        {etapa.rodape.aviso}
      </div>
      <p className="nota-privacidade" style={{ margin: 0, fontWeight: 600, letterSpacing: "0.04em" }}>
        ✅ {etapa.rodape.tempo}
      </p>
    </>
  );
}
