import { IMG } from "./imagens.js";

/**
 * O funil inteiro em dados.
 *
 * A COPY É 1:1 com o funil de referência ("Desafio 50+"): mesmas palavras,
 * mesma pontuação, mesma caixa alta. Onde as telas de referência mostram
 * negrito ou sublinhado dentro da própria opção, o rótulo vira JSX pra
 * reproduzir a ênfase. Não normalizei nada — inclusive o que parece erro de
 * digitação ficou como está (ver anotações no fim do arquivo).
 *
 * A única mudança de roteiro: onde havia a VSL no fim, entram três etapas —
 * foto, scan e resultado.
 */

export const ETAPAS = [
  /* 0 ─ Hook */
  {
    id: "hook",
    tipo: "hook",
    progresso: 2,
    semBarra: true,
    linha1: "ACABE COM AS DORES E EMAGREÇA",
    linha2: "APÓS OS 50 ANOS",
    destaque: "COM EXERCÍCIOS SEGUROS DE PILATES EM CASA",
    imagem: IMG.heroHook,
    pergunta: "Desafio específico para sua idade e objetivo:",
    subtitulo: "Escolha uma opção abaixo:",
    campo: "faixaEtaria",
    variante: "cheia",
    grade: 2,
    opcoes: [
      { valor: "40-50", rotulo: "40-50 anos" },
      { valor: "51-60", rotulo: "51-60 anos" },
      { valor: "61-70", rotulo: "61-70 anos" },
      { valor: "71+", rotulo: "71 anos mais" },
    ],
    rodape: {
      aviso: "Faça esse teste para ter um protocolo específico para seu caso. Ao final você ganha seu diagnóstico grátis.",
      tempo: "TEMPO ESTIMADO: 49 SEGUNDOS",
    },
  },

  /* 1 ─ Classificação do corpo */
  {
    id: "corpo-atual",
    tipo: "unica",
    progresso: 6,
    titulo: "Como você classifica seu corpo hoje?",
    campo: "corpoAtual",
    variante: "thumb",
    grade: 2,
    opcoes: [
      { valor: "muito-acima", rotulo: "Muito acima do peso", img: IMG.corpoObesa },
      { valor: "pouco-acima", rotulo: "Um pouco acima do peso", img: IMG.corpoGordinha },
      { valor: "falsa-magra", rotulo: "Falsa magra", img: IMG.corpoMedio },
      { valor: "magra", rotulo: "Magra", img: IMG.corpoMagra },
    ],
  },

  /* 2 ─ Patologias */
  {
    id: "patologias",
    tipo: "multi",
    progresso: 10,
    titulo: "Você tem alguma patologia?",
    subtitulo: "Pode escolher várias opções:",
    alinhar: "esq",
    campo: "patologias",
    botao: "Continuar",
    opcoes: [
      { valor: "coluna", rotulo: "Dor na coluna/lombar/cervical" },
      { valor: "articulacao", rotulo: "Dor no joelho/quadril/ombro" },
      { valor: "hernia", rotulo: "Hérnia de disco/bico papagaio" },
      { valor: "artrite", rotulo: "Artrite/artrose/osteoporose" },
      { valor: "fibromialgia", rotulo: "Fibromialgia" },
      { valor: "outros", rotulo: "Outros" },
      { valor: "nenhuma", rotulo: "Não tenho dores/patologias", exclusiva: true },
    ],
  },

  /* 3 ─ Dificuldades no dia a dia */
  {
    id: "dificuldades",
    tipo: "unica",
    progresso: 14,
    titulo: "Você tem dificuldades para fazer tarefas do dia a dia?",
    campo: "dificuldades",
    variante: "emoji",
    opcoes: [
      { valor: "muitas", emoji: "🤔", rotulo: <>Tenho <b>dificuldade</b> em <u>várias coisas</u></> },
      { valor: "algumas", emoji: "😕", rotulo: <>Tenho <b>dificuldades</b> em <u>algumas coisas</u></> },
      { valor: "nenhuma", emoji: "😄", rotulo: "Não tenho dificuldade em nada" },
    ],
  },

  /* 4 ─ Quilos a eliminar */
  {
    id: "quilos",
    tipo: "unica",
    progresso: 18,
    titulo: "Quantos quilos você gostaria de eliminar?",
    campo: "quilos",
    opcoes: [
      { valor: "0-10", rotulo: "0-10kg" },
      { valor: "11-15", rotulo: "11-15kg" },
      { valor: "16-20", rotulo: "16-20kg" },
      { valor: "21+", rotulo: "Mais de 21kg" },
      { valor: "nenhum", rotulo: "Não quero emagrecer" },
    ],
  },

  /* 5 ─ Prova social */
  {
    id: "prova-social",
    tipo: "info",
    progresso: 22,
    titulo: "Sua meta é super possível de alcançar, em menos tempo que você imagina.",
    link: "Já ajudamos mais de 20 mil mulheres após os 50 anos",
    carrossel: [
      { img: IMG.carrossel1, legenda: "59 anos" },
      { img: IMG.carrossel2, legenda: "58 anos" },
      { img: IMG.carrossel3, legenda: "64 anos" },
    ],
    botao: "CONTINUAR TESTE GRATUITO",
    nota: "Na próxima etapa você irá descobrir a causa das suas dores e da dificuldade de emagrecer",
  },

  /* 6 ─ Corpo desejado */
  {
    id: "corpo-desejado",
    tipo: "unica",
    progresso: 26,
    titulo: "Qual é o corpo que você gostaria de ter?",
    campo: "corpoDesejado",
    variante: "img",
    grade: 3,
    opcoes: [
      { valor: "bem-magro", rotulo: "Bem magro", img: IMG.desejadoMagro },
      { valor: "pouco-magro", rotulo: "Um pouco mais magro", img: IMG.desejadoPoucoMagro },
      { valor: "definido", rotulo: "Definido", img: IMG.desejadoDefinido },
    ],
  },

  /* 7 ─ Metabolismo */
  {
    id: "metabolismo",
    tipo: "unica",
    progresso: 30,
    titulo: "Como é seu metabolismo?",
    campo: "metabolismo",
    variante: "emoji",
    opcoes: [
      { valor: "lento", emoji: "🐢", rotulo: <><b>Lento-</b> Difícil para perder e fácil para ganhar peso</> },
      { valor: "acelerado", emoji: "🔥", rotulo: <><b>Acelerado-</b> Fácil de perder e difícil para ganhar peso</> },
    ],
  },

  /* 8 ─ Insegurança */
  {
    id: "inseguranca",
    tipo: "unica",
    progresso: 34,
    titulo: "Se sente insegura na hora de fazer exercícios?",
    campo: "inseguranca",
    variante: "emoji",
    opcoes: [
      { valor: "sim", emoji: "😳", rotulo: <><b>Sim</b>, fico com dúvidas do que posso fazer</> },
      { valor: "nao", emoji: "😎", rotulo: <><b>Não,</b> faço qualquer coisa</> },
    ],
  },

  /* 9 ─ Gordura na barriga */
  {
    id: "barriga",
    tipo: "unica",
    progresso: 38,
    titulo: "Você acumula gordura na barriga com facilidade?",
    campo: "barriga",
    variante: "emoji",
    emojiDir: true,
    opcoes: [
      { valor: "sim", emoji: "😖", rotulo: "Sim, é o principal lugar" },
      { valor: "nao", emoji: "😔", rotulo: "Acumulo mais em outros locais" },
    ],
  },

  /* 10 ─ Dores após os 40 */
  {
    id: "dores-40",
    tipo: "unica",
    progresso: 42,
    titulo: "Após os 40 anos, percebeu aumento das dores e ganho de peso?",
    campo: "dores40",
    variante: "emoji",
    emojiDir: true,
    opcoes: [
      { valor: "sim", emoji: "😫", rotulo: "Sim, bastante" },
      { valor: "sempre", emoji: "😔", rotulo: "Não, sempre tive esses problemas" },
    ],
  },

  /* 11 ─ Loading: causa raiz */
  {
    id: "loading-causa",
    tipo: "loading",
    progresso: 44,
    duracao: 4200,
    label: "Analisando suas respostas",
    sub: "Identificando a causa raiz do problema",
  },

  /* 12 ─ Diagnóstico */
  {
    id: "diagnostico",
    tipo: "diagnostico",
    progresso: 46,
    alerta: "⚠ CAUSA RAIZ IDENTIFICADA ⚠",
    problema: "SEU PROBLEMA É:",
    resultado: "BAIXA HORMONAL",
    titulo: "Veja seu estado atual:",
    tagGrafico: "Mínimo ideal",
    eixo: ["Alta hormonal", "Baixa hormonal"],
    fatos: [
      { marca: "1- Seu metabolismo", resto: " está trabalhando em apenas 27% da sua capacidade." },
      { marca: "2-Seus hormônios estão em baixa,", resto: " aproximadamente apenas 32% da produção máxima." },
    ],
    boaNoticia: "MAS CALMA QUE ISSO TEM SOLUÇÃO",
    botao: "CONTINUAR PARA SOLUÇÃO",
  },

  /* 13 ─ Outros objetivos */
  {
    id: "objetivos",
    tipo: "multi",
    progresso: 50,
    titulo: "Quais são seus outros objetivos?",
    subtitulo: "Pode marcar vários:",
    alinhar: "esq",
    campo: "objetivos",
    botao: "Continuar",
    opcoes: [
      { valor: "flacidez", rotulo: "Melhorar flacidez" },
      { valor: "qualidade", rotulo: "Melhorar qualidade de vida" },
      { valor: "energia", rotulo: "Mais disposição e energia" },
      { valor: "saude", rotulo: "Melhorar a saúde" },
    ],
  },

  /* 14 ─ O que impede */
  {
    id: "impedimentos",
    tipo: "multi",
    progresso: 54,
    titulo: "O que mais te impede de fazer exercícios e cuidar da sua saúde?",
    subtitulo: "Pode escolher várias opções:",
    alinhar: "esq",
    campo: "impedimentos",
    variante: "emoji",
    emojiDir: true,
    botao: "Continuar",
    opcoes: [
      { valor: "tempo", emoji: "🏃", rotulo: "Falta de tempo" },
      { valor: "cansaco", emoji: "😴", rotulo: "Cansaço e indisposição" },
      { valor: "medo", emoji: "😨", rotulo: "Medo de me machucar" },
      { valor: "apoio", emoji: "👎", rotulo: "Falta de apoio familiar" },
    ],
  },

  /* 15 ─ Dia a dia */
  {
    id: "rotina",
    tipo: "unica",
    progresso: 58,
    titulo: "Como é seu dia a dia?",
    campo: "rotina",
    variante: "emoji",
    emojiDir: true,
    opcoes: [
      { valor: "corrida", emoji: "🚗", rotulo: "Trabalho fora e tenho uma rotina corrida" },
      { valor: "flexivel", emoji: "🏠", rotulo: "Trabalho em casa e tenho uma rotina flexível" },
      { valor: "livre", emoji: "😊", rotulo: "Atualmente não trabalho" },
    ],
  },

  /* 16 ─ Faz exercício */
  {
    id: "exercicio",
    tipo: "unica",
    progresso: 62,
    titulo: "Atualmente você faz algum tipo de exercício?",
    campo: "exercicio",
    opcoes: [
      { valor: "sim", rotulo: "SIM" },
      { valor: "nao", rotulo: "NÃO" },
    ],
  },

  /* 17 ─ Loading com matéria */
  {
    id: "loading-solucao",
    tipo: "loading",
    progresso: 64,
    duracao: 5000,
    label: "Analisando suas respostas",
    sub: "Identificando a solução para seu caso",
    materia: {
      manchete: <>Pilates em casa é a modalidade <u>mais recomendada pelos médicos</u> após os 50 anos</>,
      img: IMG.materiaNoticia,
    },
  },

  /* 18 ─ Por que o pilates */
  {
    id: "solucao",
    tipo: "info",
    progresso: 70,
    faixaVerde: "PARABÉNS, SEU TESTE IDENTIFICOU QUE O PILATES EM CASA É PERFEITO PARA SEU CASO",
    imagem: IMG.parabensPilates,
    tituloForte: "POR QUE O PILATES É PERFEITO PARA SEU CASO?",
    cartoes: [
      { tag: "Emagrece rápido", texto: "Regula os hormônios, acelera o metabolismo, fazendo você emagrecer" },
      { tag: "Melhora as dores", texto: "Recupera os músculos, fortalece o corpo e diminui as dores." },
    ],
    listaTitulo: "EM POUCOS DIAS VOCÊ VAI:",
    lista: ["MELHOR AS DORES", "EMAGRECER", "FORTALECER E DESTRAVAR O CORPO"],
    pergunta: "VOCÊ DESEJA TER ACESSO AOS EXERCÍCIOS DE PILATES?",
    botao: "SIM, PRECISO MUITO",
  },

  /* 19 ─ Acredita no pilates */
  {
    id: "acredita",
    tipo: "unica",
    progresso: 74,
    titulo: "Você acredita que exercícios seguros e rápidos de pilates irão te ajudar?",
    campo: "acredita",
    variante: "emoji",
    emojiDir: true,
    opcoes: [
      { valor: "sim", emoji: "🤩", rotulo: "Sim, é exatamente o que eu preciso" },
      { valor: "talvez", emoji: "💪", rotulo: "Vale o teste" },
    ],
  },

  /* 20 ─ Se nada mudar */
  {
    id: "se-nada-mudar",
    tipo: "multi",
    progresso: 78,
    titulo: "Se nada mudar, como será sua vida daqui um tempo?",
    campo: "seNadaMudar",
    variante: "emoji",
    emojiDir: true,
    botao: "Continuar",
    opcoes: [
      { valor: "peso", emoji: "😞", rotulo: "Vou estar mais gorda e feia" },
      { valor: "saude", emoji: "😫", rotulo: "Minha saúde vai piorar muito" },
      { valor: "roupa", emoji: "👕", rotulo: "Nenhuma roupa vai vestir bem" },
      { valor: "dores", emoji: "😖", rotulo: "Minhas dores só irão piorar" },
    ],
  },

  /* 21 ─ Disposição */
  {
    id: "disposicao",
    tipo: "unica",
    progresso: 84,
    titulo: "Você está disposta a dedicar poucos minutos por dias nas próximas semanas para mudar sua realidade?",
    campo: "disposicao",
    variante: "emoji",
    emojiDir: true,
    opcoes: [
      { valor: "sim", emoji: "🤩", rotulo: "Sim, preciso mudar" },
      { valor: "tentar", emoji: "🙏", rotulo: "Estou disposta a pelo menos tentar" },
    ],
  },

  /* 22 ─ Loading final com depoimento */
  {
    id: "loading-protocolo",
    tipo: "loading",
    progresso: 90,
    duracao: 4200,
    label: "Analisando suas respostas",
    sub: "PREPARANDO SEU PROTOCOLO",
    depoimento: {
      nome: "Camila Ferreira",
      papel: "Do lar/vendedora",
      texto: "Após os 50 eu achava que não seria possível recuperar meu corpo. Com 1 mês de desafio eu eliminei 6kg e estou tonificando músculos",
      img: IMG.depoimento1,
    },
  },

  /* 23 ─ Foto do corpo (entra no lugar da VSL) */
  {
    id: "captura",
    tipo: "captura",
    progresso: 94,
    tituloForte: "FALTA SÓ A SUA LEITURA CORPORAL",
    subtitulo:
      "Envie uma foto de corpo inteiro, de frente e em pé. É com ela que o protocolo marca os seus pontos de atenção.",
  },

  /* 24 ─ Scan animado */
  { id: "scan", tipo: "scan", progresso: 98, semBarra: true },

  /* 25 ─ Resultado da leitura */
  { id: "resultado", tipo: "resultado", progresso: 100, semBarra: true },
];

/* ─────────────────────────────────────────────────────────────────────
   Mantidos exatamente como no funil de referência, apesar de parecerem
   erro. Se quiser corrigir, é só trocar aqui:
     - etapa 18, lista: "MELHOR AS DORES"  (provável "MELHORA AS DORES")
     - etapa 21, título: "poucos minutos por dias"  (provável "por dia")
     - etapa 12, fato 2: "2-Seus hormônios" sem espaço depois do traço
   ───────────────────────────────────────────────────────────────────── */
