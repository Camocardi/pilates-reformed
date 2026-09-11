/**
 * Ponto único de entrada das imagens.
 *
 * Elas vivem em src/assets (e não em public/), então passam pelo Vite: ganham
 * hash no nome e cache eterno no CDN. O preço é que precisam ser importadas —
 * e como os arquivos vieram com espaço, parêntese e acento no nome, o import
 * fica todo concentrado aqui e o resto do funil usa só os nomes limpos abaixo.
 *
 * Fora daqui de propósito: "mini vsl.mp4". É a VSL que o scan corporal
 * substituiu, e são 25 MB — entraria no bundle sem ninguém usar.
 */

import heroHook from "../assets/step1 e step6 3 de 3.webp";
import corpoMagra from "../assets/step2 magra.webp";
import corpoMedio from "../assets/step2 medio.webp";
import corpoGordinha from "../assets/step3 gordinha.webp";
import corpoObesa from "../assets/step3 obesa.webp";
import desejadoMagro from "../assets/md-IzBhC-muito-magro.jpg";
import desejadoPoucoMagro from "../assets/md-pZzZw-um-pouco-mais-magro.jpg";
import desejadoDefinido from "../assets/md-TGY8F-definido.jpg";
import carrossel1 from "../assets/step6 carrosel1 de 3.webp";
import carrossel2 from "../assets/step6 carrosel2 de 3.webp";
import depoimento1 from "../assets/depoimento1.jpg";
import depoimento2 from "../assets/depoimento2.jpg";
import materiaNoticia from "../assets/step loading noticia.jpg";
import parabensPilates from "../assets/PARABÉNS, SEU TESTE IDENTIFICOU QUE O PILATES EM CASA É.jpg";
import lays from "../assets/lays.webp";
import depoimentoVenda1 from "../assets/depoimento sales page.jpg";
import depoimentoVenda2 from "../assets/depoimento sales page (1).jpg";
import depoimentoVenda3 from "../assets/depoimento sales page (2).jpg";
import apresentacao from "../assets/sales page apresentacao.png";

export const IMG = {
  heroHook,
  corpoMagra,
  corpoMedio,
  corpoGordinha,
  corpoObesa,
  desejadoMagro,
  desejadoPoucoMagro,
  desejadoDefinido,
  carrossel1,
  carrossel2,
  carrossel3: heroHook,
  depoimento1,
  depoimento2,
  materiaNoticia,
  parabensPilates,
  lays,
  depoimentoVenda1,
  depoimentoVenda2,
  depoimentoVenda3,
  apresentacao,
};
