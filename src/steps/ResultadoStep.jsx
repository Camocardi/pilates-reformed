import { Botao, Tique, TituloForte } from "../components/Base.jsx";
import { useQuiz } from "../state/QuizContext.jsx";
import { montaAchados, COR_ACHADO } from "../lib/achados.js";
import { VENDAS } from "../data/vendas.jsx";
import { marcaEvento } from "../lib/clarity.js";

function Estrelas() {
  return <span className="estrelas">★★★★★</span>;
}

function Preco() {
  const p = VENDAS.precos;
  return (
    <div className="preco">
      <div className="preco-faixa">{p.faixa}</div>
      <div className="preco-corpo">
        <span className="preco-de">{p.de}</span>
        <div className="preco-caixa">
          <span className="preco-off">{p.desconto}</span>
          <span className="preco-por">{p.por}</span>
          <span className="preco-condicao">{p.condicao}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Botão de ação.
 *
 * O PRIMEIRO da página não manda pro checkout: rola até o bloco da oferta.
 * Quem acabou de ver a leitura ainda não viu preço, depoimento nem o que
 * recebe — jogar direto pro pagamento nesse ponto queima o argumento. Os
 * demais botões, que já vêm depois da oferta, vão direto pro checkout.
 */
function Cta({ paraOferta = false }) {
  function clique() {
    if (paraOferta) {
      marcaEvento("cta_ver_oferta");
      document.getElementById("oferta")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    marcaEvento("checkout_clique");
    window.location.href = VENDAS.checkout;
  }

  return <Botao onClick={clique}>{VENDAS.cta}</Botao>;
}

/**
 * Página de vendas. Abre com o resultado da leitura corporal — que é o que
 * a usuária acabou de "ganhar" e o motivo de ela ter chegado até aqui — e
 * segue com a estrutura da página de referência: depoimentos, preço, o que
 * ela recebe e quem é a professora, com o CTA repetido entre os blocos.
 */
export default function ResultadoStep() {
  const { dados, respostas } = useQuiz();
  const achados = montaAchados(dados.resultado, respostas);
  const foto = dados.resultado?.dataUrl;

  return (
    <>
      <div style={{ height: 26 }} />
      <span className="selo">Leitura corporal concluída</span>
      <h1 className="titulo">O seu protocolo está pronto</h1>
      <p className="subtitulo">
        {dados.resultado?.detectado
          ? "Foi isso que a leitura encontrou na sua foto:"
          : "Montamos a leitura a partir das suas respostas:"}
      </p>

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

      <p className="nota-privacidade" style={{ marginBottom: 22 }}>
        A sua foto não foi enviada para lugar nenhum: a leitura rodou dentro do seu aparelho.
      </p>

      {/* ── Oferta ─────────────────────────────────────────────── */}
      <TituloForte>
        {VENDAS.chamada} <span className="marca">{VENDAS.chamadaDestaque}</span>
      </TituloForte>

      <div style={{ marginTop: 18 }}>
        <Cta paraOferta />
      </div>

      {/* ── Depoimentos ────────────────────────────────────────── */}
      <h2 className="secao">{VENDAS.tituloDepoimentos}</h2>
      {VENDAS.depoimentos.map((d) => (
        <div className="depo" key={d.nome}>
          <img className="depo-foto" src={d.img} alt={d.nome} loading="lazy" />
          <div className="depo-corpo">
            <Estrelas />
            <p className="depo-nome">{d.nome}</p>
            <p className="depo-data">{d.data}</p>
            <p className="depo-texto">{d.texto}</p>
          </div>
        </div>
      ))}

      <div id="oferta" className="ancora-oferta" style={{ marginTop: 18 }}>
        <Preco />
        <Cta />
      </div>

      {/* ── O que recebe ───────────────────────────────────────── */}
      <h2 className="secao">{VENDAS.tituloEntrega}</h2>
      <div className="imagem-bloco" style={{ background: "transparent" }}>
        <img src={VENDAS.imagemEntrega} alt="Aulas no computador e no celular" loading="lazy" />
      </div>
      <ul className="entrega">
        {VENDAS.entregaveis.map((item, i) => (
          <li key={i}>
            <span className="tick">
              <Tique />
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <Cta />

      {/* ── Professora ─────────────────────────────────────────── */}
      <h2 className="secao">{VENDAS.tituloProfessora}</h2>
      <div className="imagem-bloco">
        <img src={VENDAS.fotoProfessora} alt="Lays Trancoso" loading="lazy" />
      </div>
      {VENDAS.bio.map((p, i) => (
        <p className="bio" key={i}>
          {p}
        </p>
      ))}

      <div style={{ marginTop: 18 }}>
        <Preco />
        <Cta />
      </div>

      <div style={{ height: 10 }} />
    </>
  );
}
