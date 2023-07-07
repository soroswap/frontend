import BigNumber from "bignumber.js";

export default function calculatePoolTokenOptimalAmount(
  amount0: BigNumber,
  reserve0: BigNumber,
  reserve1: BigNumber,
):BigNumber {
  return amount0.multipliedBy(reserve1).dividedBy(reserve0);
}
