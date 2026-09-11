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

## Pendências

- `LINK_CHECKOUT` em [`steps/ResultadoStep.jsx`](src/steps/ResultadoStep.jsx) está como `#`.
- Os pixels (Meta, Utmify, Clarity, TikTok) ainda não foram colocados no `<head>` do `index.html`.
- As legendas 2 e 3 do carrossel da etapa de prova social estão vazias.
