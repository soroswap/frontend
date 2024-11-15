import BigNumber from "bignumber.js";
import { RouterEventType } from "../types/router-events";

const soroswapAppUrl = process.env.NEXT_PUBLIC_SOROSWAP_APP_URL;

export const formatNumberToMoney = (
  number: number | undefined,
  decimals: number = 7
) => {
  if (!number) return "-";

  if (typeof number === "string") {
    number = parseFloat(number);
  }

  if (typeof number !== "number") return "$0.00";

  if (number > 1000000000) {
    return `$${(number / 1000000000).toFixed(2)}b`;
  }
  if (number > 1000000) {
    return `$${(number / 1000000).toFixed(2)}m`;
  }
  if (number > 1000) {
    return `$${(number / 1000).toFixed(2)}k`;
  }
  return `$${number.toFixed(decimals)}`;
};

export const formatNumberToToken = (number: number | undefined) => {
  if (number === 0) return "0";

  if (!number) return "-";

  if (typeof number === "string") {
    number = parseFloat(number);
  }

  if (typeof number !== "number") return "$0.00";

  if (number > 1000000000) {
    return `${(number / 1000000000).toFixed(2)}b`;
  }
  if (number > 1000000) {
    return `${(number / 1000000).toFixed(2)}m`;
  }
  if (number > 1000) {
    return `${(number / 1000).toFixed(2)}k`;
  }
  return `${number.toFixed(7)}`;
};

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.substring(0, chars)}...${address.substring(56 - chars)}`;
}

export const getExpectedAmountOfOne = (
  reserve0: number | string | undefined,
  reserve1: number | string | undefined
) => {
  if (!reserve0 || !reserve1) return;

  const one = BigNumber(1);

  const reserveIn = BigNumber(reserve0);
  const reserveOut = BigNumber(reserve1);

  let amountInWithFee = one.multipliedBy(997);
  let numerator = amountInWithFee.multipliedBy(reserveOut);
  let denominator = reserveIn.multipliedBy(1000).plus(amountInWithFee);

  return numerator.dividedBy(denominator).toFixed(7);
};

export const getSoroswapAddLiquidityUrl = (
  token0?: string | undefined,
  token1?: string | undefined
) => {
  if (!soroswapAppUrl) return;

  if (token0 && !token1) {
    return `${soroswapAppUrl}/liquidity/add/${token0}`;
  }

  if (!token0 && token1) {
    return `${soroswapAppUrl}/liquidity/add/${token1}`;
  }

  return `${soroswapAppUrl}/liquidity/add/${token0}/${token1}`;
};

export const getSoroswapSwapUrl = (
  token0?: string | undefined,
  token1?: string | undefined
) => {
  if (!soroswapAppUrl) return;

  if (token0 && !token1) {
    return `${soroswapAppUrl}/swap/${token0}`;
  }

  if (!token0 && token1) {
    return `${soroswapAppUrl}/swap/${token1}`;
  }

  return `${soroswapAppUrl}/swap/${token0}/${token1}`;
};

export const openInNewTab = (url: string) => {
  const newWindow = window.open(url, "_blank", "noopener,noreferrer");
  if (newWindow) newWindow.opener = null;
};

export const roundNumber = (number: number, decimals: number): number => {
  return Number(number.toFixed(decimals));
};

export const toCamelCase = (text: string): string => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const adjustAmountByDecimals = (
  amount: number | string,
  decimals: number | undefined
): string => {
  const defaultDecimals = 7;
  const actualDecimals = decimals ?? defaultDecimals;

  let amountStr = amount.toString();

  while (amountStr.length <= actualDecimals) {
    amountStr = "0" + amountStr;
  }

  const integerPart = amountStr.slice(0, -actualDecimals);
  const decimalPart = amountStr.slice(-actualDecimals);
  const result = integerPart + "." + decimalPart;

  return result.replace(/(\.\d*[1-9])0+$|\.0*$/, "$1");
};

export const shouldShortenCode = (contract: string) => {
  if (!contract) return;
  if (contract.length > 10) return shortenAddress(contract);
  return contract;
};

export const formatEvent = (
  event: RouterEventType,
  symbol0: string,
  symbol1: string
) => {
  if (event === "init") return toCamelCase(event);
  return `${toCamelCase(event)} ${shouldShortenCode(symbol0)} ${
    event === "swap" ? "for" : "and"
  } ${shouldShortenCode(symbol1)}`;
};

type Formatter = "money" | "token";

export const formatTokenAmount = (
  amount: BigNumber | string | number | undefined | null,
  decimals: number = 7,
  formatter?: Formatter
): string => {
  if (!amount) {
    return "-";
  }

  if (!(amount instanceof BigNumber)) {
    amount = BigNumber(amount);
  }

  let formatted = amount.toString();

  if (decimals > 0) {
    formatted = amount.shiftedBy(-decimals).toFixed(decimals).toString();

    while (formatted[formatted.length - 1] === "0") {
      formatted = formatted.substring(0, formatted.length - 1);
    }

    if (formatted.endsWith(".")) {
      formatted = formatted.substring(0, formatted.length - 1);
    }
  }

  if (formatter) {
    if (formatter === "money")
      formatted = formatNumberToMoney(parseFloat(formatted));
    if (formatter === "token")
      formatted = formatNumberToToken(parseFloat(formatted));
  }

  return formatted;
};
