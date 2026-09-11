import {
  detectPose,
  segmentBody,
  larguraNaAltura,
  contornoDaSilhueta,
  extremosVerticais,
} from "./poseDetection.js";

// Índices do PoseLandmarker que interessam aqui (dos 33 disponíveis)
const LM = {
  NARIZ: 0,
  ORELHA_E: 7, ORELHA_D: 8,
  BOCA_E: 9, BOCA_D: 10,
  OMBRO_E: 11, OMBRO_D: 12,
  COTOVELO_E: 13, COTOVELO_D: 14,
  PUNHO_E: 15, PUNHO_D: 16,
  QUADRIL_E: 23, QUADRIL_D: 24,
  JOELHO_E: 25, JOELHO_D: 26,
  TORNOZELO_E: 27, TORNOZELO_D: 28,
};

// Tons da mesma família, separados por luminosidade em vez de matiz:
// quatro cores diferentes sobre uma foto viram arco-íris.
export const LINHA_COR = {
  cintura: "#FFFFFF",
  barriga: "#C4B5FD",
  coxa: "#A78BFA",
  braco: "#8B5CF6",
  papada: "#DDD6FE",
};
export const LINHA_ESPESSURA = { cintura: 4, barriga: 3.6, coxa: 3.4, braco: 3.2, papada: 2.8 };
export const LINHA_ORDEM = ["cintura", "barriga", "coxa", "braco", "papada"];
export const LINHA_ROTULO = {
  cintura: "Cintura",
  barriga: "Abdômen",
  coxa: "Coxa",
  braco: "Braço",
  papada: "Linha do queixo",
};

// cor dos pontos que contornam o corpo
export const COR_CONTORNO = "#F472B6";

// retrato 2:3 — foto de corpo inteiro é alta, e um recorte quadrado obrigaria
// a tela do scan a dar zoom demais pra cobrir o celular, cortando pés e cabeça
export const CANVAS = { W: 480, H: 720 };

/* ── vetores ─────────────────────────────────────────────────────────── */
const meio = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const lerp = (a, b, t) => a + (b - a) * t;
const lerpP = (a, b, t) => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });

function recorteCover(imgW, imgH, W, H) {
  const ri = imgW / imgH;
  const rc = W / H;
  if (ri > rc) {
    const sh = imgH;
    const sw = sh * rc;
    return { sx: (imgW - sw) / 2, sy: 0, sw, sh };
  }
  const sw = imgW;
  const sh = sw / rc;
  return { sx: 0, sy: (imgH - sh) / 2, sw, sh };
}

/**
 * Linha horizontal "de fita métrica": atravessa o corpo na altura pedida e
 * cai um pouco no meio, como uma fita apoiada na pele. O arco é proporcional
 * à largura, então não exagera em corpo estreito nem some em corpo largo.
 * As pontas passam um pouco da silhueta pra leitura ficar de medição, não de
 * risco por cima do corpo.
 */
function fita(x1, x2, y, arco = 0.05, folga = 6) {
  const e = x1 - folga;
  const d = x2 + folga;
  const queda = (d - e) * arco;
  return [
    { x: e, y },
    { x: lerp(e, d, 0.33), y: y + queda },
    { x: lerp(e, d, 0.66), y: y + queda },
    { x: d, y },
  ];
}

/**
 * Monta as linhas a partir dos pontos reais do corpo.
 *
 * Duas decisões que mudam tudo em relação a chutar frações da foto:
 *
 * 1. A CINTURA É PROCURADA, não estimada. O código varre a silhueta entre o
 *    peito e o quadril e escolhe a linha mais ESTREITA — que é, por definição,
 *    a cintura daquele corpo. O abdômen é a linha mais LARGA abaixo dela.
 *    Assim a marcação acerta tanto em quem tem cintura marcada quanto em quem
 *    não tem, sem depender de proporção "média".
 *
 * 2. Quando não há silhueta, a largura estimada parte dos landmarks CORRIGIDOS.
 *    Ombro e quadril do modelo são centros de articulação, bem dentro do corpo:
 *    usar a distância crua entre eles desenha uma linha visivelmente mais
 *    estreita que a pessoa. Os fatores abaixo compensam isso.
 */
function pontosDosLandmarks(lm, mask) {
  const { W, H } = CANVAS;

  const ombroE = lm[LM.OMBRO_E];
  const ombroD = lm[LM.OMBRO_D];
  const quadrilE = lm[LM.QUADRIL_E];
  const quadrilD = lm[LM.QUADRIL_D];

  const centroOmbros = meio(ombroE, ombroD);
  const centroQuadril = meio(quadrilE, quadrilD);
  const largOmbros = dist(ombroE, ombroD);
  const largQuadril = dist(quadrilE, quadrilD);

  // articulação -> contorno externo
  const FATOR_OMBRO = 1.34;
  const FATOR_QUADRIL = 1.5;

  function estimada(t) {
    const centro = lerpP(centroOmbros, centroQuadril, t);
    const larg = lerp(largOmbros * FATOR_OMBRO, largQuadril * FATOR_QUADRIL, t);
    return { x1: centro.x - larg / 2, x2: centro.x + larg / 2, y: centro.y, larg };
  }

  // Perfil de larguras ao longo do tronco. Vai um pouco além do quadril
  // (t > 1) porque em muitos corpos a parte mais larga do abdômen fica
  // abaixo da linha dos landmarks de quadril.
  const amostras = [];
  for (let t = 0.42; t <= 1.08; t += 0.02) {
    const centro = lerpP(centroOmbros, centroQuadril, t);
    const medido = larguraNaAltura(mask, centro.y, centro.x, W, H);
    if (!medido) continue;
    const larg = medido.x2 - medido.x1;
    // descarta leitura absurda: braço solto colado no tronco alarga demais,
    // e vazamento da máscara pro fundo alarga mais ainda
    if (larg < largQuadril * 0.6 || larg > largOmbros * 4) continue;
    amostras.push({ t, y: centro.y, x1: medido.x1, x2: medido.x2, larg });
  }

  let cintura;
  let barriga;

  const naFaixaCintura = amostras.filter((a) => a.t >= 0.48 && a.t <= 0.82);
  if (naFaixaCintura.length >= 3) {
    cintura = naFaixaCintura.reduce((m, a) => (a.larg < m.larg ? a : m));
    const abaixo = amostras.filter((a) => a.t >= cintura.t + 0.08);
    barriga = abaixo.length ? abaixo.reduce((m, a) => (a.larg > m.larg ? a : m)) : estimada(cintura.t + 0.2);
  } else {
    cintura = estimada(0.66);
    barriga = estimada(0.88);
  }

  // Coxa: medida a 38% do caminho quadril -> joelho, que é onde ela é mais
  // cheia. Mede numa perna só (a do lado escolhido pro braço), porque uma fita
  // atravessando as duas leria como "quadril", não como coxa.
  const joelhoE = lm[LM.JOELHO_E];
  const joelhoD = lm[LM.JOELHO_D];

  // braço mais visível dos dois — numa foto de frente costuma haver um lado
  // melhor iluminado ou menos encoberto pelo tronco
  const vis = (i) => lm[i]?.visibility ?? 1;
  const ladoE = vis(LM.OMBRO_E) + vis(LM.COTOVELO_E) + vis(LM.PUNHO_E);
  const ladoD = vis(LM.OMBRO_D) + vis(LM.COTOVELO_D) + vis(LM.PUNHO_D);
  const usarE = ladoE >= ladoD;
  const ombro = usarE ? lm[LM.OMBRO_E] : lm[LM.OMBRO_D];
  const cotovelo = usarE ? lm[LM.COTOVELO_E] : lm[LM.COTOVELO_D];
  const punho = usarE ? lm[LM.PUNHO_E] : lm[LM.PUNHO_D];

  const quadrilLado = usarE ? quadrilE : quadrilD;
  const joelhoLado = usarE ? joelhoE : joelhoD;
  const centroCoxa = lerpP(quadrilLado, joelhoLado, 0.38);
  const medidaCoxa = larguraNaAltura(mask, centroCoxa.y, centroCoxa.x, W, H);
  const largCoxaEstimada = dist(quadrilE, quadrilD) * 0.78;
  const coxa =
    medidaCoxa && medidaCoxa.x2 - medidaCoxa.x1 < largQuadril * 1.6
      ? { x1: medidaCoxa.x1, x2: medidaCoxa.x2, y: centroCoxa.y }
      : {
          x1: centroCoxa.x - largCoxaEstimada / 2,
          x2: centroCoxa.x + largCoxaEstimada / 2,
          y: centroCoxa.y,
        };

  // Linha do queixo: de orelha a orelha, mergulhando abaixo do queixo.
  // A altura do queixo sai do TAMANHO DA CABEÇA (distância entre as orelhas),
  // não do vetor nariz->boca: esse vetor é curto demais e colocava a linha em
  // cima da boca.
  const orelhaE = lm[LM.ORELHA_E];
  const orelhaD = lm[LM.ORELHA_D];
  const boca = meio(lm[LM.BOCA_E], lm[LM.BOCA_D]);
  const nariz = lm[LM.NARIZ];
  const larguraCabeca = dist(orelhaE, orelhaD) || largOmbros * 0.45;

  // direção "pra baixo" do rosto, tirada do próprio rosto (funciona com a
  // cabeça inclinada); se degenerar, cai no eixo do tronco
  let baixo = { x: boca.x - nariz.x, y: boca.y - nariz.y };
  const modulo = Math.hypot(baixo.x, baixo.y);
  if (modulo < 1) {
    baixo = { x: centroQuadril.x - centroOmbros.x, y: centroQuadril.y - centroOmbros.y };
  }
  const norma = Math.hypot(baixo.x, baixo.y) || 1;
  baixo = { x: baixo.x / norma, y: baixo.y / norma };

  const queixo = {
    x: boca.x + baixo.x * larguraCabeca * 0.62,
    y: boca.y + baixo.y * larguraCabeca * 0.62,
  };
  // encolhe um pouco em direção ao centro pra linha acompanhar a mandíbula
  // em vez de passar por fora das orelhas
  const ancoraE = lerpP(orelhaE, queixo, 0.18);
  const ancoraD = lerpP(orelhaD, queixo, 0.18);

  // Contorno: pontos acompanhando a borda do corpo, do pescoço aos pés.
  // Começa abaixo do queixo pra não disputar com a linha da mandíbula.
  const extremos = extremosVerticais(mask, W, H);
  const inicioContorno = queixo.y + larguraCabeca * 0.25;
  const fimContorno = extremos
    ? extremos.base
    : Math.max(lm[LM.TORNOZELO_E]?.y || 0, lm[LM.TORNOZELO_D]?.y || 0) || H * 0.95;
  const contorno =
    fimContorno > inicioContorno
      ? contornoDaSilhueta(mask, W, H, inicioContorno, fimContorno, 24)
      : [];

  return {
    contorno,
    cintura: fita(cintura.x1, cintura.x2, cintura.y),
    barriga: fita(barriga.x1, barriga.x2, barriga.y, 0.06),
    coxa: fita(coxa.x1, coxa.x2, coxa.y, 0.07, 4),
    braco: [ombro, cotovelo, cotovelo, punho].map((p) => ({ x: p.x, y: p.y })),
    papada: [
      ancoraE,
      { x: lerp(ancoraE.x, queixo.x, 0.75), y: queixo.y },
      { x: lerp(ancoraD.x, queixo.x, 0.75), y: queixo.y },
      ancoraD,
    ],
    // pontos só nas EXTREMIDADES das medições e nas articulações do braço.
    // Antes eram seis pontos espalhados pelo tronco, que liam como sujeira;
    // nas pontas da fita eles liam como paquímetro.
    marcos: [
      { x: cintura.x1, y: cintura.y },
      { x: cintura.x2, y: cintura.y },
      { x: barriga.x1, y: barriga.y },
      { x: barriga.x2, y: barriga.y },
      { x: cotovelo.x, y: cotovelo.y },
    ],
    medidas: {
      largOmbros: largOmbros * FATOR_OMBRO,
      largQuadril: largQuadril * FATOR_QUADRIL,
      largCintura: cintura.x2 - cintura.x1,
      largBarriga: barriga.x2 - barriga.x1,
      largCoxa: coxa.x2 - coxa.x1,
      medidoNaSilhueta: naFaixaCintura.length >= 3,
    },
  };
}

/** Traçado genérico, em frações da tela, quando nenhum corpo foi detectado. */
function pontosGenericos(W, H) {
  return {
    contorno: [],
    cintura: fita(W * 0.29, W * 0.71, H * 0.47),
    barriga: fita(W * 0.27, W * 0.73, H * 0.56, 0.06),
    coxa: fita(W * 0.34, W * 0.48, H * 0.68, 0.07, 4),
    braco: [
      { x: W * 0.31, y: H * 0.3 },
      { x: W * 0.24, y: H * 0.42 },
      { x: W * 0.24, y: H * 0.42 },
      { x: W * 0.26, y: H * 0.55 },
    ],
    papada: [
      { x: W * 0.43, y: H * 0.165 },
      { x: W * 0.46, y: H * 0.205 },
      { x: W * 0.54, y: H * 0.205 },
      { x: W * 0.57, y: H * 0.165 },
    ],
    marcos: [
      { x: W * 0.29, y: H * 0.47 }, { x: W * 0.71, y: H * 0.47 },
      { x: W * 0.27, y: H * 0.56 }, { x: W * 0.73, y: H * 0.56 },
    ],
    medidas: null,
  };
}

/* ── desenho ─────────────────────────────────────────────────────────── */
export function paraPathD(p) {
  return `M ${p[0].x} ${p[0].y} C ${p[1].x} ${p[1].y}, ${p[2].x} ${p[2].y}, ${p[3].x} ${p[3].y}`;
}

/** Amostra n pontos ao longo da bézier — usados como "rastro" antes da linha. */
export function amostraBezier(p, n = 6) {
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const mt = 1 - t;
    const a = mt * mt * mt;
    const b = 3 * mt * mt * t;
    const c = 3 * mt * t * t;
    const d = t * t * t;
    out.push({
      x: a * p[0].x + b * p[1].x + c * p[2].x + d * p[3].x,
      y: a * p[0].y + b * p[1].y + c * p[2].y + d * p[3].y,
    });
  }
  return out;
}

export function desenhaNoCanvas(ctx, pts) {
  ctx.save();

  // contorno primeiro, pra as linhas de medição ficarem por cima
  if (pts.contorno?.length) {
    ctx.fillStyle = COR_CONTORNO;
    ctx.shadowColor = COR_CONTORNO;
    ctx.shadowBlur = 6;
    pts.contorno.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 3.4, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  ctx.lineCap = "round";
  ctx.shadowBlur = 6;
  LINHA_ORDEM.forEach((chave) => {
    const p = pts[chave];
    if (!p) return;
    ctx.strokeStyle = LINHA_COR[chave];
    ctx.shadowColor = LINHA_COR[chave];
    ctx.lineWidth = LINHA_ESPESSURA[chave];
    ctx.beginPath();
    ctx.moveTo(p[0].x, p[0].y);
    ctx.bezierCurveTo(p[1].x, p[1].y, p[2].x, p[2].y, p[3].x, p[3].y);
    ctx.stroke();
  });
  ctx.shadowBlur = 8;
  ctx.shadowColor = "#ffffff";
  ctx.fillStyle = "rgba(255,255,255,0.88)";
  (pts.marcos || []).forEach((m) => {
    ctx.beginPath();
    ctx.arc(m.x, m.y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function carregaImagem(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Roda a detecção na foto e devolve tudo que as duas telas precisam: a
 * geometria (para a revelação animada em SVG) e a imagem já com as linhas
 * queimadas (para o resultado e para compartilhar).
 */
export async function analisaCorpo(dataUrl) {
  const img = await carregaImagem(dataUrl);
  const { W, H } = CANVAS;
  const corte = recorteCover(img.width, img.height, W, H);

  // Recorta primeiro, detecta depois: assim os pontos do modelo e a máscara já
  // nascem no mesmo sistema de coordenadas do canvas, sem conversão no meio.
  const base = document.createElement("canvas");
  base.width = W;
  base.height = H;
  const bctx = base.getContext("2d");
  bctx.drawImage(img, corte.sx, corte.sy, corte.sw, corte.sh, 0, 0, W, H);

  let landmarks = null;
  let mask = null;
  try {
    const [bruto, silhueta] = await Promise.all([detectPose(base), segmentBody(base, W, H)]);
    mask = silhueta;
    if (bruto) landmarks = bruto.map((p) => ({ ...p, x: p.x * W, y: p.y * H }));
  } catch {
    landmarks = null;
  }

  const pontos = landmarks ? pontosDosLandmarks(landmarks, mask) : pontosGenericos(W, H);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(base, 0, 0);
  desenhaNoCanvas(ctx, pontos);

  return {
    pontos,
    detectado: !!landmarks,
    temSilhueta: !!pontos.medidas?.medidoNaSilhueta,
    W,
    H,
    dataUrl: canvas.toDataURL("image/jpeg", 0.92),
  };
}

export function arquivoParaDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}
