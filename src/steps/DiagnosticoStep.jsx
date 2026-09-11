import { Topo, Titulo, Botao } from "../components/Base.jsx";
import Grafico from "../components/Grafico.jsx";
import { useQuiz } from "../state/QuizContext.jsx";

export default function DiagnosticoStep() {
  const { etapa, avancar } = useQuiz();

  return (
    <>
      <Topo />

      <div className="aviso aviso-vermelho" style={{ padding: 16 }}>
        <p style={{ margin: "0 0 5px", fontSize: 13, fontWeight: 800, letterSpacing: "0.03em" }}>{etapa.alerta}</p>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 800 }}>{etapa.problema}</p>
        <p
          style={{
            margin: "2px 0 0",
            fontSize: 20,
            fontWeight: 900,
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          {etapa.resultado}
        </p>
      </div>

      <Titulo>{etapa.titulo}</Titulo>
      <Grafico tag={etapa.tagGrafico} eixo={etapa.eixo} />

      <div className="cartao">
        {etapa.fatos.map((f, i) => (
          <p className="fato" key={i}>
            <span className="marca" style={{ fontWeight: 700 }}>
              {f.marca}
            </span>
            {f.resto}
          </p>
        ))}
      </div>

      <div className="aviso aviso-verde" style={{ fontSize: 13.5 }}>
        {etapa.boaNoticia}
      </div>

      <div className="espaco" />
      <Botao onClick={avancar}>
        {etapa.botao}
      </Botao>
    </>
  );
}
