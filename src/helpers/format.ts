import BigNumber from "bignumber.js";

// used for display purposes
export const truncateString = (str: string) =>
  str ? `${str.slice(0, 5)}…${str.slice(-5)}` : "";

// conversion used to display the base fee
export const stroopToXlm = (
  stroops: BigNumber | string | number,
): BigNumber => {
  if (stroops instanceof BigNumber) {
    return stroops.dividedBy(1e7);
  }
  return new BigNumber(Number(stroops) / 1e7);
};

export const xlmToStroop = (lumens: BigNumber | string): BigNumber => {
  if (lumens instanceof BigNumber) {
    return lumens.times(1e7);
  }
  // round to nearest stroop
  return new BigNumber(Math.round(Number(lumens) * 1e7));
};

// Token BigNumber to human redeable
// With a tokens set number of decimals, display the formatted value for an amount.
// Returns a string
// Example - User A has 1000000001 of a token set to 7 decimals,
// display should be 100.0000001
export const formatTokenAmount = (
  amount: BigNumber | string,
  decimals: number = 7,
): string => {
  if (!amount) {
    return "0";
  }

  if (!(amount instanceof BigNumber)) {
    amount = BigNumber(amount);
  }

  let formatted = amount.toString();

  if (decimals > 0) {
    formatted = amount.shiftedBy(-decimals).toFixed(decimals).toString();

    // Trim trailing zeros
    while (formatted[formatted.length - 1] === "0") {
      formatted = formatted.substring(0, formatted.length - 1);
    }

    if (formatted.endsWith(".")) {
      formatted = formatted.substring(0, formatted.length - 1);
    }
  }

  return formatted;
};

export const formatFixedAmount = (value: BigNumber, decimals = 7): string => {
  return value.toFixed(decimals).toString();
};

export const parseUnits = (value: string, decimals: number): BigNumber => {
  return BigNumber(value).shiftedBy(decimals);
};

export function twoDecimalsPercentage(value: string) {
  // convert string to number
  const numericValue = parseFloat(value);

  return Math.round(numericValue * 10000) / 100;
}
