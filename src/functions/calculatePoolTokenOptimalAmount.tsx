import { BigNumber } from "bignumber.js";

function calculatePoolTokenOptimalAmount(
  amount0: BigNumber,
  reserve0: BigNumber,
  reserve1: BigNumber
): BigNumber {
  if (reserve0.isEqualTo(0) || reserve1.isEqualTo(0)) return amount0;
  return amount0.multipliedBy(reserve1).dividedBy(reserve0);
}

export default calculatePoolTokenOptimalAmount;