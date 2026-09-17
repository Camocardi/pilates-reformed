/**
 * Marcação de etapas no Microsoft Clarity.
 *
 * O funil é uma página só: a URL nunca muda. Sem isto, toda gravação cai sob
 * o mesmo endereço e não há como saber onde cada mulher parou — que é
 * exatamente o relatório que interessa.
 *
 * Cada troca de tela manda duas coisas:
 *  - TAG ("etapa"): filtra as gravações no painel. "Ver quem parou na 12."
 *  - EVENTO ("etapa_12-diagnostico"): é o que o Clarity usa pra montar funil
 *    e comparar quantas chegaram em cada etapa.
 *
 * A tag leva o número na frente, com zero à esquerda, pra lista do painel sair
 * na ordem do funil em vez de em ordem alfabética.
 *
 * Nada aqui quebra se o Clarity estiver bloqueado (adblock) ou ainda não tiver
 * carregado: o próprio snippet cria uma fila antes do script chegar, e o
 * try/catch cobre o resto.
 */

function chama(...args) {
  try {
    window.clarity?.(...args);
  } catch {
    /* Clarity indisponível: seguir sem medir é melhor que travar o funil */
  }
}

export function nomeDaEtapa(indice, etapa) {
  return `${String(indice).padStart(2, "0")}-${etapa.id}`;
}

export function marcaEtapa(indice, etapa) {
  const nome = nomeDaEtapa(indice, etapa);
  chama("set", "etapa", nome);
  chama("set", "etapa_numero", String(indice));
  chama("event", `etapa_${nome}`);
}

/** Momentos que valem virar evento próprio, fora da sequência de etapas. */
export function marcaEvento(nome) {
  chama("event", nome);
}
