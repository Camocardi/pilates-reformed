import { Topo, Titulo, Subtitulo, Botao } from "../components/Base.jsx";
import Opcoes from "../components/Opcoes.jsx";
import { useQuiz } from "../state/QuizContext.jsx";

export default function PerguntaStep() {
  const { etapa, respostas, responder, alternar, avancar } = useQuiz();
  const multi = etapa.tipo === "multi";
  const valor = respostas[etapa.campo];

  function escolherUnica(v) {
    responder(etapa.campo, v);
    // deixa a animação de seleção terminar antes de trocar de tela
    setTimeout(avancar, 380);
  }

  /**
   * Numa pergunta de múltipla escolha, a opção marcada como `exclusiva`
   * ("Não tenho dores/patologias") não convive com as outras: marcar ela
   * limpa o resto, e marcar qualquer outra desmarca ela.
   */
  function alternarMulti(opcao) {
    const atual = respostas[etapa.campo] || [];
    const exclusivas = etapa.opcoes.filter((o) => o.exclusiva).map((o) => o.valor);

    if (opcao.exclusiva) {
      responder(etapa.campo, atual.includes(opcao.valor) ? [] : [opcao.valor]);
      return;
    }
    if (atual.some((v) => exclusivas.includes(v))) {
      responder(etapa.campo, [opcao.valor]);
      return;
    }
    alternar(etapa.campo, opcao.valor);
  }

  return (
    <>
      <Topo />
      <Titulo alinhar={etapa.alinhar}>{etapa.titulo}</Titulo>
      {etapa.subtitulo && <Subtitulo alinhar={etapa.alinhar}>{etapa.subtitulo}</Subtitulo>}

      <Opcoes etapa={etapa} valor={valor} onEscolher={escolherUnica} onAlternar={alternarMulti} />

      {multi && (
        <>
          <div className="espaco" />
          <Botao onClick={avancar} disabled={!valor || valor.length === 0}>
            {etapa.botao || "Continuar"}
          </Botao>
        </>
      )}
    </>
  );
}
