/**
 * Calcula a distância euclidiana entre dois vetores de mesma dimensionalidade.
 *
 * Fórmula: √(Σ (a_i - b_i)²)
 *
 * @param {number[]} vetorA
 * @param {number[]} vetorB
 * @returns {number}
 */
export function distanciaEuclidiana(vetorA, vetorB) {
  if (!Array.isArray(vetorA) || !Array.isArray(vetorB)) {
    throw new Error('Os vetores de distância devem ser arrays numéricos.');
  }

  if (vetorA.length !== vetorB.length) {
    throw new Error(
      `Dimensões incompatíveis para distância: ${vetorA.length} vs ${vetorB.length}.`,
    );
  }

  let somaQuadrados = 0;
  for (let i = 0; i < vetorA.length; i += 1) {
    const diff = vetorA[i] - vetorB[i];
    somaQuadrados += diff * diff;
  }

  return Math.sqrt(somaQuadrados);
}
