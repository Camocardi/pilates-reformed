# Pilates Reformed — funil

Funil quiz de pilates. React 18 + Vite, CSS próprio, sem framework de UI.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # gera dist/
```

## Como o funil é montado

Todas as 26 etapas vivem em **[`src/data/etapas.jsx`](src/data/etapas.jsx)**, numa lista só.
Trocar uma pergunta, uma imagem, a copy ou a ordem das telas é mexer nesse
arquivo — nenhum componente precisa ser aberto.

Cada etapa declara um `tipo`, e o [`App.jsx`](src/App.jsx) escolhe a tela:

| tipo | tela |
|---|---|
| `hook` | abertura, sem barra e sem voltar |
| `unica` / `multi` | pergunta (escolha única ou múltipla) |
| `info` | conteúdo: prova social, solução |
| `loading` | anel de 0 a 100%, com matéria ou depoimento |
| `diagnostico` | alerta + gráfico + fatos |
| `captura` | foto do corpo |
| `scan` | leitura animada |
| `resultado` | achados + CTA |

As imagens são importadas em [`src/data/imagens.js`](src/data/imagens.js) e ficam
em `src/assets/`, então o Vite versiona com hash e o CDN pode cachear pra sempre.

## Leitura corporal

Substitui a VSL que havia no fim do funil. Roda **inteiramente no aparelho**, em
WASM — a foto não é enviada para servidor nenhum e não fica salva.

- [`lib/poseDetection.js`](src/lib/poseDetection.js) — MediaPipe: `PoseLandmarker`
  (33 pontos do corpo) + `ImageSegmenter` (silhueta). Import dinâmico, então não
  entra no bundle inicial de quem nunca chega na foto.
- [`lib/bodyDrawing.js`](src/lib/bodyDrawing.js) — geometria das linhas. A cintura
  não é estimada por fração: o código varre a silhueta entre peito e quadril e
  escolhe a linha mais estreita; o abdômen é a mais larga abaixo dela.
- [`lib/achados.js`](src/lib/achados.js) — vira copy a partir das proporções
  medidas. Os cortes são gatilhos de texto, não diagnóstico.
- [`steps/ScanStep.jsx`](src/steps/ScanStep.jsx) — revelação animada em SVG.

Sem foto, ou com corpo não reconhecido, o funil não trava: cai numa leitura
genérica montada a partir das respostas do quiz.

## Cor

Uma cor só, chapada, sem degradê. Os cinco tons ficam no topo de
[`src/styles/global.css`](src/styles/global.css) — reescrever os cinco troca o
funil inteiro (os valores do rosa estão comentados lá).

## Medição

Três coisas no `<head>` do [`index.html`](index.html): Meta Pixel, Utmify e Clarity.
Duas delas têm código do lado do app.

**Clarity** — [`lib/clarity.js`](src/lib/clarity.js). O funil é uma página só, a URL
nunca muda; sem marcar a etapa, toda gravação cairia sob o mesmo endereço e não
haveria como saber onde cada mulher parou.

**Meta** — [`lib/fbEvents.js`](src/lib/fbEvents.js) + [`api/capi.js`](api/capi.js).
Cada evento sai por dois caminhos ao mesmo tempo: o pixel do browser e a API de
Conversões pelo servidor, ambos com o mesmo `event_id`. A Meta reconhece que é o
mesmo acontecimento e conta uma conversão só — mas agora conta também o que o
pixel sozinho perdia (bloqueador, iOS, aba fechada antes do script carregar).

| evento | quando |
|---|---|
| `PageView` | no `<head>`, antes do React subir; o servidor manda a cópia depois |
| `ViewContent` (Quiz Pilates) | a capa apareceu |
| `Lead` | saiu da capa, ou seja, respondeu a primeira pergunta |
| `ViewContent` (Oferta) | chegou na tela de resultado |
| `InitiateCheckout` | clicou no botão que leva pra Kirvano |

O `Purchase` **não sai daqui**: a compra acontece na Kirvano, e a página de
obrigado pode nunca ser carregada. Ele tem que vir da integração nativa da
Kirvano com a API de Conversões, ou de um webhook de compra aprovada.

### Configuração

`FB_CAPI_TOKEN` no painel da Vercel (Settings -> Environment Variables), e
redeploy. Veja [`.env.example`](.env.example) pros outros valores. O token é
segredo e só existe no servidor — nunca com prefixo `VITE_`.

A rota `/api/capi` é uma serverless function da Vercel: qualquer arquivo em
`api/` vira uma, sem configuração. `npm run dev` **não** serve essa rota (o Vite
só serve o front); pra testar a rota localmente é `vercel dev`. Em `npm run dev`
o pixel do browser funciona normal e a chamada ao servidor falha em silêncio.

### Nota de correspondência

O funil não pede e-mail nem WhatsApp em etapa nenhuma, e e-mail é de longe o
campo que mais pesa na nota. O que vai hoje é `fbp`, `fbc`, IP, user-agent e um
`external_id` anônimo guardado no navegador. Se algum dia uma etapa passar a
coletar contato, é só passar `{ email, phone }` no terceiro argumento do
`dispara()` — a rota já hasheia e envia.

## Pendências

- O pixel do TikTok ainda não foi colocado no `<head>` do `index.html`.
- `Purchase` depende da Kirvano (integração nativa ou webhook) — ver acima.
- As legendas 2 e 3 do carrossel da etapa de prova social estão vazias.
