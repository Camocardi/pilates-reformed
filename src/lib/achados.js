import { LINHA_COR, LINHA_ROTULO } from "./bodyDrawing.js";

/**
 * Transforma as medidas do scan + as respostas do quiz na copy do resultado.
 *
 * Importante para quem for ajustar os textos: as faixas abaixo são gatilhos de
 * COPY, não diagnóstico. O que a silhueta mede de verdade é proporção em
 * pixels numa foto — ângulo, roupa e distância da câmera mexem nisso. Por isso
 * os textos falam de tendência e de o que treinar, e nunca de número de
 * medida, percentual de gordura ou qualquer coisa com cara de exame.
 */

function faixa(valor, cortes) {
  for (const [limite, chave] of cortes) {
    if (valor <= limite) return chave;
  }
  return cortes[cortes.length - 1][1];
}

export function montaAchados(resultado, respostas = {}) {
  const medidas = resultado?.pontos?.medidas;
  const detectado = !!resultado?.detectado;

  // Sem detecção (foto pulada, corpo não reconhecido) a leitura vira genérica e
  // puxa das respostas do quiz — nunca inventa um achado sobre a foto.
  if (!detectado || !medidas) {
    return [
      {
        chave: "cintura",
        titulo: "Região central",
        texto:
          respostas.barriga === "sim"
            ? "Você mesma apontou a barriga como o principal ponto de acúmulo. O protocolo começa pela ativação do core, que é o que sustenta essa região."
            : "O trabalho começa pelo core: é ele que sustenta a postura e dá o contorno da cintura.",
      },
      {
        chave: "barriga",
        titulo: "Postura e sustentação",
        texto:
          respostas.patologias?.includes("coluna")
            ? "Como você relatou dor na coluna, a sequência inicial evita impacto e prioriza estabilização."
            : "A sequência inicial prioriza estabilização antes de qualquer exercício de carga.",
      },
      {
        chave: "braco",
        titulo: "Braços e flacidez",
        texto: "Exercícios de sustentação com o próprio peso, que é o que devolve firmeza sem sobrecarregar a articulação.",
      },
    ];
  }

  const { largOmbros, largQuadril, largCintura, largBarriga } = medidas;
  const cinturaQuadril = largCintura / largQuadril;
  const barrigaCintura = largBarriga / largCintura;
  const ombroCintura = largOmbros / largCintura;

  const perfilCintura = faixa(cinturaQuadril, [
    [0.82, "definida"],
    [0.95, "media"],
    [Infinity, "reta"],
  ]);

  const textoCintura = {
    definida:
      "A leitura encontrou uma diferença clara entre cintura e quadril. Esse contorno já existe — o trabalho é de sustentação, pra ele não se perder com a perda de tônus.",
    media:
      "A leitura encontrou uma cintura pouco marcada em relação ao quadril. É o padrão mais comum depois dos 45 e responde rápido a trabalho de core.",
    reta:
      "A leitura encontrou a cintura quase na mesma largura do quadril. É o sinal clássico de perda de tônus abdominal, e é exatamente o que o protocolo ataca primeiro.",
  }[perfilCintura];

  const achados = [
    { chave: "cintura", titulo: LINHA_ROTULO.cintura, texto: textoCintura },
    {
      chave: "barriga",
      titulo: LINHA_ROTULO.barriga,
      texto:
        barrigaCintura > 1.04
          ? "Abaixo da linha da cintura a silhueta abre em vez de fechar. É acúmulo na região baixa do abdômen, a parte que quase nenhum exercício comum alcança."
          : "A região abdominal acompanha a linha da cintura, sem projeção acentuada. A prioridade aqui é firmeza, não redução.",
    },
    {
      chave: "braco",
      titulo: LINHA_ROTULO.braco,
      texto:
        respostas.objetivos?.includes("flacidez")
          ? "Você marcou flacidez como objetivo. O traçado do braço entra no protocolo com exercícios de sustentação do próprio peso."
          : "O traçado do braço serve de referência de progresso: é onde a firmeza costuma aparecer primeiro.",
    },
  ];

  if (ombroCintura < 1.15) {
    achados.push({
      chave: "papada",
      titulo: "Postura de ombros",
      texto:
        "Os ombros aparecem fechados em relação à cintura — postura enrolada pra frente. É o que mais rápido muda de aparência com pilates, em questão de semanas.",
    });
  }

  return achados;
}

export const COR_ACHADO = LINHA_COR;
