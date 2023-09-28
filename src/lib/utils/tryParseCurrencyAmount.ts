import BigNumber from 'bignumber.js';
import { TokenType, CurrencyAmount } from 'interfaces';
import { parseUnits } from 'helpers/format';

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
    if (value !== '0') {
      return {
        currency: currency,
        value: parseUnits(value, currency.decimals ?? 7).toString(),
      };
    }
  } catch (error) {
    // fails if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error);
  }
  return undefined;
}
