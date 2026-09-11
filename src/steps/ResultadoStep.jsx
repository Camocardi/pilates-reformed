import { Titulo, Subtitulo, Botao, Tique } from "../components/Base.jsx";
import { useQuiz } from "../state/QuizContext.jsx";
import { montaAchados, COR_ACHADO } from "../lib/achados.js";
import { IMG } from "../data/imagens.js";

const LINK_CHECKOUT = "#"; // trocar pela URL do checkout

export default function ResultadoStep() {
  const { dados, respostas } = useQuiz();
  const achados = montaAchados(dados.resultado, respostas);
  const foto = dados.resultado?.dataUrl;

  return (
    <>
      <div style={{ height: 26 }} />
      <span className="selo">Leitura corporal concluída</span>
      <Titulo>
        O seu <em>protocolo</em> está pronto
      </Titulo>
      <Subtitulo>
        {dados.resultado?.detectado
          ? "Foi isso que a leitura encontrou na sua foto:"
          : "Montamos a leitura a partir das suas respostas:"}
      </Subtitulo>

      {foto && (
        <div className="resultado-foto">
          <img src={foto} alt="Leitura corporal com as linhas marcadas" />
        </div>
      )}

      {achados.map((a, i) => (
        <div className="achado" key={a.chave} style={{ "--i": i }}>
          <span className="achado-cor" style={{ background: COR_ACHADO[a.chave] || "var(--cor-400)" }} />
          <div>
            <h3>{a.titulo}</h3>
            <p>{a.texto}</p>
          </div>
        </div>
      ))}

      <div className="cartao" style={{ marginTop: 18, display: "flex", gap: 14, alignItems: "center" }}>
        <img
          src={IMG.lays}
          alt="Lays"
          style={{ width: 68, height: 68, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
        />
        <div>
          <p style={{ margin: "0 0 3px", fontWeight: 700, fontSize: 15 }}>Quem conduz o desafio</p>
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: "var(--texto-suave)" }}>
            Aulas guiadas do começo ao fim, pensadas para quem tem dor e nunca fez pilates.
          </p>
        </div>
      </div>

      <div className="cartao">
        <p style={{ margin: "0 0 10px", fontWeight: 700, fontSize: 15 }}>O que entra no seu protocolo</p>
        <ul className="lista-check">
          {[
            "Sequência inicial montada a partir da sua leitura corporal",
            "Exercícios seguros, sem impacto e sem equipamento",
            "Poucos minutos por dia, feitos em casa",
            "Progressão semana a semana, no seu ritmo",
          ].map((t) => (
            <li key={t}>
              <span className="tick">
                <Tique />
              </span>
              {t}
            </li>
          ))}
        </ul>
      </div>

      <div className="carrossel">
        {[IMG.depoimentoVenda1, IMG.depoimentoVenda2, IMG.depoimentoVenda3].map((img, i) => (
          <div className="carrossel-item" key={i}>
            <div className="foto">
              <img src={img} alt={`Resultado de aluna ${i + 1}`} loading="lazy" />
            </div>
          </div>
        ))}
      </div>

      <div className="espaco" />
      <Botao onClick={() => { window.location.href = LINK_CHECKOUT; }}>
        Quero começar o desafio
      </Botao>
      <p className="nota-privacidade">
        A sua foto não foi enviada para lugar nenhum: a leitura rodou dentro do seu aparelho.
      </p>
    </>
  );
}
