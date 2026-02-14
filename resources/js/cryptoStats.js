let cryptoData = null;

export async function loadCryptoStatsData() {
  const response = await fetch('/getCryptoStats');
  cryptoData = await response.json();
  return cryptoData;
}

export function getCryptoData() {
  return cryptoData;
}
