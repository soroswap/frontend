import BigNumber from "bignumber.js";
import { TokenType } from "interfaces";

export type CurrencyAmount = {
  currency: TokenType;
  value: string;
};

/**
 * Parses a CurrencyAmount from the passed string.
 * Returns the CurrencyAmount, or undefined if parsing fails.
 */
export default function tryParseCurrencyAmount(
  value?: string,
  currency?: TokenType,
): CurrencyAmount | undefined {
  if (!value || !currency) {
    return undefined;
  }
  try {
    return {
      currency: currency,
      value: value,
    };
  } catch (error) {
    // fails if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error);
  }
  return undefined;
}
