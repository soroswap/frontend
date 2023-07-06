import { useSorobanReact } from "@soroban-react/core";
import { useContractValue } from "@soroban-react/contracts";
import { accountToScVal } from "../utils";

export function getExpectedAmount(
  contractId: string,
  token0: string,
  token1: string,
  amount0: number,
) {
  const sorobanContext = useSorobanReact();
  let reserveIn = 0,
    reserveOut = 0;

  if (amount0 <= 0) return "UNEXPECTED AMOUNT";

  // test this function
  const reserves = useContractValue({
    contractId: contractId,
    method: "get_reserves",
    params: [accountToScVal(token0), accountToScVal(token1)],
    sorobanContext: sorobanContext,
  });

  //this is not working
  if (reserves.result) {
    reserveIn = reserves.result[0].value();
    reserveOut = reserves.result[1].value();
  }

  if (reserveIn === 0 || reserveOut === 0) return "INSUFFICIENT_LIQUIDITY";

  // Validate that the amount is not greater than the reserves
  let amountInWithFee = amount0 * 997;
  let numerator = amountInWithFee * reserveOut;
  let denominator = reserveIn * 1000 + amountInWithFee;
  let returnAmount = numerator / denominator;
  return returnAmount;
}
