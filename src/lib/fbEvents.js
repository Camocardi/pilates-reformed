/**
 * Eventos da Meta disparados nos dois caminhos ao mesmo tempo.
 *
 * Cada `dispara()` manda o evento pelo pixel do browser E pela API de
 * Conversões (rota /api/capi), com o MESMO `event_id` nos dois. A Meta
 * recebe duas cópias, entende que são o mesmo acontecimento e conta uma só.
 *
 * O ganho não é contar melhor: é contar o que hoje se perde. Bloqueador,
 * iOS e aba fechada cedo derrubam o pixel do browser; o caminho do servidor
 * passa por cima disso. Quanto mais evento chega, melhor o anúncio otimiza.
 *
 * Nada aqui pode quebrar o funil. Toda chamada é "dispara e esquece", com
 * falha silenciosa — igual ao clarity.js.
 */

/** Lê um cookie pelo nome. */
function cookie(nome) {
  if (typeof document === "undefined") return undefined;
  const achou = document.cookie.match(new RegExp("(^| )" + nome + "=([^;]+)"));
  return achou ? decodeURIComponent(achou[2]) : undefined;
}

/**
 * O _fbc é o que liga a conversão ao clique no anúncio, e é o campo que mais
 * pesa depois do e-mail. O pixel cria esse cookie sozinho, mas leva um
 * instante — se alguém clicar rápido demais, ele ainda não existe. Quando for
 * o caso, monta na mão a partir do fbclid da URL, no formato que a Meta pede.
 */
function resolveFbc() {
  const existente = cookie("_fbc");
  if (existente) return existente;
  if (typeof window === "undefined") return undefined;
  const fbclid = new URLSearchParams(window.location.search).get("fbclid");
  return fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined;
}

function novoId() {
  return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 11);
}

/**
 * Um identificador anônimo e estável desta visitante, guardado no navegador.
 *
 * Este funil não pede e-mail nem WhatsApp em etapa nenhuma, então não há o
 * dado forte que a Meta usa pra reconhecer alguém. O external_id é o que
 * sobra: não diz quem a pessoa é, mas permite à Meta perceber que a visita de
 * hoje e a compra de amanhã são da mesma pessoa. Sem isso a nota de
 * correspondência não sai do chão.
 */
function externalId() {
  try {
    const guardado = localStorage.getItem("fb_external_id");
    if (guardado) return guardado;
    const novo = novoId();
    localStorage.setItem("fb_external_id", novo);
    return novo;
  } catch {
    // Navegação anônima ou storage bloqueado: segue sem o campo.
    return undefined;
  }
}

/**
 * Dispara o evento nos dois caminhos.
 *
 * @param {string} nome        Evento padrão da Meta: ViewContent, Lead, InitiateCheckout...
 * @param {object} custom      custom_data (value, currency, content_name...)
 * @param {object} usuario     Dados de contato, se algum dia o funil passar a coletar
 * @param {string} [idPronto]  event_id já existente, pra casar com um fbq disparado fora daqui
 */
export function dispara(nome, custom = {}, usuario = {}, idPronto) {
  const eventId = idPronto || novoId();

  // 1) o pixel do browser
  if (typeof window !== "undefined" && typeof window.fbq === "function" && !idPronto) {
    try {
      window.fbq("track", nome, custom, { eventID: eventId });
    } catch {
      /* pixel bloqueado: o caminho do servidor ainda vai */
    }
  }

  // 2) o mesmo evento pelo servidor
  try {
    fetch("/api/capi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Sem keepalive, o InitiateCheckout morre no meio: o clique manda a
      // pessoa pra Kirvano e o navegador cancela toda requisição pendente da
      // página que está saindo. Com ele, a requisição sobrevive à navegação.
      keepalive: true,
      body: JSON.stringify({
        event_name: nome,
        event_id: eventId,
        event_source_url: window.location.href,
        custom_data: custom,
        user_data: {
          ...usuario,
          external_id: externalId(),
          fbp: cookie("_fbp"),
          fbc: resolveFbc(),
        },
      }),
    }).catch(() => {});
  } catch {
    /* falha silenciosa: medição nunca derruba o funil */
  }
}

const jaDisparados = new Set();

/**
 * Dispara uma vez só por carregamento da página.
 *
 * Existe por dois motivos. O StrictMode do React roda todo efeito duas vezes
 * em desenvolvimento, o que mandaria o evento duplicado com ids diferentes —
 * e aí a Meta conta dois mesmo. E o efeito que marca as etapas roda a cada
 * troca de tela, mas "abriu o quiz" e "começou o quiz" acontecem uma vez só.
 *
 * @param {string} chave Identifica o momento, não o evento: a mesma página
 *                       dispara ViewContent duas vezes (quiz e oferta).
 */
export function disparaUmaVez(chave, nome, custom = {}, usuario = {}) {
  if (jaDisparados.has(chave)) return;
  jaDisparados.add(chave);
  dispara(nome, custom, usuario);
}

/**
 * Manda pelo servidor o PageView que o index.html já disparou no browser.
 *
 * O PageView tem de sair do <head>, antes do React existir, senão perde quem
 * fecha a página nos primeiros segundos. Então o index.html dispara o pixel e
 * deixa o id em window.__fbPageViewId; aqui a cópia do servidor vai com esse
 * mesmo id, e as duas se deduplicam.
 */
export function pageViewServidor() {
  const id = typeof window !== "undefined" ? window.__fbPageViewId : undefined;
  if (!id || jaDisparados.has("pageview")) return;
  jaDisparados.add("pageview");
  // com o id pronto, o `dispara` pula o pixel do browser: ele JÁ saiu no <head>.
  dispara("PageView", {}, {}, id);
}
