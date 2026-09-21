import { IMG } from "./imagens.js";

/**
 * Conteúdo da página de vendas, copiado 1:1 da página de referência.
 *
 * Único texto que NÃO veio de lá é a `chamada`: na referência ela era
 * "ASSISTA ESSE VÍDEO RÁPIDO PARA LIBERAR SEU ACESSO AO DESAFIO", que só faz
 * sentido com a VSL no lugar. Como a leitura corporal ocupa essa posição
 * agora, a chamada teve de mudar — ajuste à vontade.
 */

export const VENDAS = {
  checkout: "https://pay.kirvano.com/e837e1aa-4e85-480b-ac94-099532199110",

  chamada: "SEU RESULTADO ESTÁ LIBERADO",
  chamadaDestaque: "GARANTA SUA VAGA NO DESAFIO",

  cta: "CLIQUE AQUI PRA PARTICIPAR",

  precos: {
    faixa: "ÚLTIMAS VAGAS OFERTA",
    de: "DE R$97,00",
    desconto: "72%OFF",
    por: "R$27,00",
    condicao: "à vista",
  },

  tituloDepoimentos: "Veja o que as nossas alunas falam:",
  depoimentos: [
    {
      nome: "Camila.kashioto",
      data: "10/04/2025",
      img: IMG.depoimentoVenda1,
      texto: "Eu amei as aulas, são fáceis e funcionam muito. A professora é nota 10, minha dor do ciático sumiu.",
    },
    {
      nome: "Barbara_89",
      data: "02/05/2025",
      img: IMG.depoimentoVenda2,
      texto: "Tenho 62 anos e minha dor na coluna estava terrível. Em uma semana a dor sumiu e perdi 4kg",
    },
    {
      nome: "Marcinha.rocha",
      data: "29/08/2025",
      img: IMG.depoimentoVenda3,
      texto:
        "Gostaria de agradecer a professora, tenho 65 anos com artrose, hérnia de disco e dor no joelho. Perdi 3kg tbm, em uma semana sou outra mulher.",
    },
  ],

  tituloEntrega: "Veja tudo que você vai receber:",
  imagemEntrega: IMG.apresentacao,
  entregaveis: [
    <>
      Uma semana (seg a sex) de <b>aulas AO VIVO</b> de pilates em casa,{" "}
      <u>direto no seu whatsapp.</u>
    </>,
    <>
      <b>Gravação das aulas</b> por 30 dias, pra você fazer quando quiser.
    </>,
    <>
      <b>Grupo de apoio</b> e motivação no whatsapp.
    </>,
    <>
      <b>Guia de compras</b> para saber o que comprar e como economizar no mercado.
    </>,
  ],

  tituloProfessora: "Conheça sua professora",
  fotoProfessora: IMG.lays,
  bio: [
    <>
      Eu me chamo Lays Trancoso, sou profissional de educação física e{" "}
      <b>professora de pilates certificada há mais de 7 anos.</b>
    </>,
    <>
      Já ajudei mais de <b>20 mil mulheres acima dos 50 anos</b> a recuperar os músculos, melhorar a qualidade de
      vida e diminuir as dores.
    </>,
    <>
      Sou conhecida como uma das <b>maiores referências de pilates em casa no Brasil.</b>
    </>,
  ],
};


/**
 * O preço como número, pros eventos da Meta (`value`).
 *
 * Sai do próprio texto da oferta de propósito: o preço já mudou uma vez, e um
 * segundo lugar pra atualizar é um segundo lugar pra esquecer — aí o anúncio
 * passa a otimizar por um valor que não existe mais.
 */
export const VALOR = Number(VENDAS.precos.por.replace(/[^\d,]/g, "").replace(",", "."));

export const MOEDA = "BRL";
