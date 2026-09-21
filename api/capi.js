/**
 * API de Conversões da Meta — o lado servidor do pixel.
 *
 * O pixel do browser perde evento o tempo todo: bloqueador, iOS, aba fechada
 * antes do script carregar. Esta rota manda o MESMO evento direto pro servidor
 * da Meta. Os dois chegam, e o `event_id` idêntico nos dois lados faz a Meta
 * descartar a cópia em vez de contar a conversão duas vezes (deduplicação).
 *
 * Não é Next.js: o projeto é Vite puro. Na Vercel, qualquer arquivo em /api
 * vira serverless function sem configuração nenhuma — o build do site continua
 * sendo o `vite build` de sempre.
 *
 * REGRA QUE NÃO PODE SER QUEBRADA: esta rota nunca derruba o funil. Qualquer
 * erro aqui responde 200 e segue a vida. Medição atrapalhada é ruim; checkout
 * travado por causa da medição é muito pior.
 */

import crypto from "node:crypto";

// O ID do pixel não é segredo — ele já está no index.html, à vista de todos.
// A env existe pra poder trocar sem mexer no código; a constante é o mesmo
// número do index.html, pra rota funcionar mesmo sem ninguém configurar nada.
const PIXEL_ID = process.env.FB_PIXEL_ID || "2822134581499321";

// O token é segredo e só existe aqui no servidor. Se ele tivesse o prefixo
// NEXT_PUBLIC_ / VITE_, iria parar no bundle do browser e vazaria.
const TOKEN = process.env.FB_CAPI_TOKEN;

// Só durante os testes: faz os eventos aparecerem na aba "Testar eventos".
const TEST_CODE = process.env.FB_TEST_EVENT_CODE;

const API_VERSION = "v21.0";

/** A Meta exige SHA-256 do valor em minúsculas e sem espaços nas pontas. */
function hash(valor) {
  if (typeof valor !== "string") return undefined;
  const limpo = valor.trim().toLowerCase();
  if (!limpo) return undefined;
  return crypto.createHash("sha256").update(limpo).digest("hex");
}

/** Telefone: só dígitos e sempre com DDI, senão a Meta não casa o contato. */
function hashTelefone(valor) {
  if (typeof valor !== "string") return undefined;
  const digitos = valor.replace(/\D/g, "");
  if (!digitos) return undefined;
  const comDdi = digitos.startsWith("55") ? digitos : `55${digitos}`;
  return crypto.createHash("sha256").update(comDdi).digest("hex");
}

/** A Meta espera lista em todo campo de contato, mesmo com um valor só. */
function lista(valorHasheado) {
  return valorHasheado ? [valorHasheado] : undefined;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, erro: "metodo_nao_permitido" });
  }

  // Sem token não dá pra falar com a Meta. Responde ok:false em 200 de
  // propósito: o client não trata erro, e não deve mesmo.
  if (!TOKEN) {
    console.error("CAPI: FB_CAPI_TOKEN nao configurado na Vercel");
    return res.status(200).json({ ok: false, erro: "token_ausente" });
  }

  try {
    // Na Vercel o body já vem parseado quando o content-type é JSON, mas
    // string crua acontece (fetch sem header, por exemplo).
    const corpo = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { event_name, event_id, event_source_url, custom_data = {}, user_data = {} } = corpo;

    if (!event_name || !event_id) {
      return res.status(400).json({ ok: false, erro: "event_name e event_id sao obrigatorios" });
    }

    // O IP de quem está navegando. Na Vercel vem em x-forwarded-for, e o
    // primeiro da lista é o visitante — os seguintes são os proxies do caminho.
    const encaminhado = req.headers["x-forwarded-for"] || "";
    const ip = String(encaminhado).split(",")[0].trim() || undefined;
    const userAgent = req.headers["user-agent"] || undefined;

    const payload = {
      data: [
        {
          event_name,
          event_time: Math.floor(Date.now() / 1000),
          event_id, // é isto, e só isto, que casa este evento com o do browser
          event_source_url,
          action_source: "website",
          user_data: {
            em: lista(hash(user_data.email)),
            ph: lista(hashTelefone(user_data.phone)),
            fn: lista(hash(user_data.first_name)),
            ln: lista(hash(user_data.last_name)),
            ct: lista(hash(user_data.city)),
            country: lista(hash(user_data.country || "br")),
            // Identificador próprio e anônimo do visitante. Como este funil
            // não pede e-mail em lugar nenhum, ele é o que dá à Meta algo
            // estável pra reconhecer a mesma pessoa entre uma visita e outra.
            external_id: lista(hash(user_data.external_id)),
            client_ip_address: ip,
            client_user_agent: userAgent,
            fbp: user_data.fbp, // cookie _fbp, criado pelo próprio pixel
            fbc: user_data.fbc, // cookie _fbc, derivado do fbclid do anúncio
          },
          custom_data,
        },
      ],
      ...(TEST_CODE ? { test_event_code: TEST_CODE } : {}),
    };

    const resposta = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        // A Meta é rápida, mas não vale segurar a function esperando.
        signal: AbortSignal.timeout(5000),
      },
    );

    const resultado = await resposta.json();

    if (!resposta.ok) {
      console.error("CAPI erro:", JSON.stringify(resultado));
      return res.status(200).json({ ok: false, resultado });
    }

    return res.status(200).json({ ok: true, resultado });
  } catch (erro) {
    console.error("CAPI excecao:", erro);
    return res.status(200).json({ ok: false, erro: "excecao" });
  }
}
