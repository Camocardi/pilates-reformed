/**
 * Detecção de corpo no aparelho da usuária.
 *
 * São dois modelos do mesmo pacote e eles se completam:
 *  - PoseLandmarker: 33 pontos (ombro, cotovelo, punho, quadril, joelho...).
 *    Diz ONDE estão as referências do corpo.
 *  - ImageSegmenter: máscara de silhueta. Diz ATÉ ONDE o corpo vai em cada
 *    altura — é ela que faz a linha da cintura encostar no contorno real em
 *    vez de ser uma largura chutada a partir dos ombros.
 *
 * Nada disso sai do aparelho: roda em WASM local, a foto nunca é enviada.
 */

let posePromise = null;
let segPromise = null;

// import dinâmico, não no topo: o MediaPipe é o maior pedaço de JS do funil e
// só é necessário na etapa da foto. No topo do arquivo ele entraria no bundle
// inicial e atrasaria a primeira tela pra todo mundo, inclusive quem nunca
// chega a enviar foto. Mesmo tratamento que a Constella dá ao scan da palma.
async function vision() {
  return import("@mediapipe/tasks-vision");
}

const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";

function getPose() {
  if (!posePromise) {
    posePromise = (async () => {
      const { PoseLandmarker, FilesetResolver } = await vision();
      const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
      return PoseLandmarker.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
        },
        runningMode: "IMAGE",
        numPoses: 1,
        // abaixo do padrão 0.5: foto de corpo inteiro tirada em casa costuma
        // vir torta, contra a luz ou com parte cortada. Uma detecção real com
        // confiança média ainda é muito melhor que cair no traçado genérico.
        minPoseDetectionConfidence: 0.3,
        minPosePresenceConfidence: 0.3,
      });
    })();
  }
  return posePromise;
}

function getSegmenter() {
  if (!segPromise) {
    segPromise = (async () => {
      const { ImageSegmenter, FilesetResolver } = await vision();
      const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
      return ImageSegmenter.createFromOptions(fileset, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/1/selfie_segmenter.tflite",
        },
        runningMode: "IMAGE",
        outputCategoryMask: true,
        outputConfidenceMasks: false,
      });
    })();
  }
  return segPromise;
}

/** Começa a baixar os modelos em segundo plano. Pode ser chamado várias vezes. */
export function warmupBodyDetector() {
  getPose().catch(() => {});
  getSegmenter().catch(() => {});
}

/** 33 pontos normalizados {x,y} do primeiro corpo detectado, ou null. */
export async function detectPose(source) {
  try {
    const landmarker = await getPose();
    const result = landmarker.detect(source);
    if (result?.landmarks?.length) {
      return result.landmarks[0].map((p) => ({ x: p.x, y: p.y, visibility: p.visibility ?? 1 }));
    }
    return null;
  } catch (err) {
    console.warn("Detecção de corpo indisponível:", err);
    return null;
  }
}

/**
 * Máscara da silhueta: { data: Uint8Array de 0|1, width, height }, ou null.
 *
 * O modelo não garante qual índice é pessoa e qual é fundo, e isso já inverteu
 * entre versões. Em vez de fixar o número, olhamos a borda da imagem: o que
 * domina as bordas é fundo, o resto é pessoa. Funciona para qualquer rotulagem.
 */
export async function segmentBody(source, width, height) {
  try {
    const segmenter = await getSegmenter();
    const result = segmenter.segment(source);
    const mask = result?.categoryMask;
    if (!mask) return null;

    const raw = mask.getAsUint8Array();
    const w = mask.width;
    const h = mask.height;

    // rótulo mais frequente nas quatro bordas = fundo
    const contagem = new Map();
    const marcar = (i) => contagem.set(raw[i], (contagem.get(raw[i]) || 0) + 1);
    for (let x = 0; x < w; x++) {
      marcar(x);
      marcar((h - 1) * w + x);
    }
    for (let y = 0; y < h; y++) {
      marcar(y * w);
      marcar(y * w + w - 1);
    }
    let fundo = 0;
    let maior = -1;
    contagem.forEach((qtd, rotulo) => {
      if (qtd > maior) {
        maior = qtd;
        fundo = rotulo;
      }
    });

    const data = new Uint8Array(w * h);
    for (let i = 0; i < data.length; i++) data[i] = raw[i] === fundo ? 0 : 1;

    mask.close?.();
    return { data, width: w, height: h, alvoW: width, alvoH: height };
  } catch (err) {
    console.warn("Segmentação de silhueta indisponível:", err);
    return null;
  }
}

/**
 * Largura do corpo na altura `y` (coordenadas do canvas).
 * Retorna { x1, x2 } ou null se a linha não cruzar a silhueta.
 *
 * Varre do centro pra fora: numa foto tirada em casa, um móvel ao fundo ou a
 * sombra na parede viram manchas soltas, e pegar o primeiro pixel vindo da
 * borda capturaria essas manchas em vez do tronco.
 *
 * Se o pixel exato do centro cair no fundo (acontece quando o eixo do tronco
 * fica torto, ou quando a pessoa está de lado), procura o pixel de corpo mais
 * próximo numa janela em volta antes de desistir — antes disso a medição
 * falhava e caía no traçado estimado, que é o que deixava a linha estreita.
 */
export function larguraNaAltura(mask, y, centroX, W, H) {
  if (!mask) return null;
  const { data, width: mw, height: mh } = mask;
  const my = Math.round((y / H) * mh);
  if (my < 0 || my >= mh) return null;

  const linha = my * mw;
  let mcx = Math.round((centroX / W) * mw);
  mcx = Math.min(mw - 1, Math.max(0, mcx));

  if (!data[linha + mcx]) {
    const janela = Math.round(mw * 0.3);
    let achou = -1;
    for (let d = 1; d <= janela; d++) {
      if (mcx - d >= 0 && data[linha + mcx - d]) { achou = mcx - d; break; }
      if (mcx + d < mw && data[linha + mcx + d]) { achou = mcx + d; break; }
    }
    if (achou === -1) return null;
    mcx = achou;
  }

  let e = mcx;
  while (e > 0 && data[linha + e - 1]) e--;
  let d = mcx;
  while (d < mw - 1 && data[linha + d + 1]) d++;

  return { x1: (e / mw) * W, x2: (d / mw) * W };
}
