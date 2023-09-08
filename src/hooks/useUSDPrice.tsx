import useSWR from "swr";
// TODO: verify type of fetcher args
const fetcher = (...args: [any, any]) => fetch(...args).then((resp) => resp.json());

type stellarPrice = {
  clp: number,
  eur: number,
  usd: number,
}

export const useStellarUSD = () => {
  const { data } = useSWR(
    `https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd%2Ceur%2Cclp`,
    fetcher,
  );

  const stellarPrices: stellarPrice = data.stellar

  return stellarPrices
};