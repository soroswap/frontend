import { SorobanContextType } from "@soroban-react/core";
import { formatTokenAmount } from "../helpers/format";
import { scvalToBigNumber } from "../helpers/utils";
import { useTokenDecimals, useTokenScVal } from "../hooks";

interface PairBalanceProps {
  pairAddress: string;
  sorobanContext: SorobanContextType;
}

export function PairBalance({ pairAddress, sorobanContext }: PairBalanceProps) {
  const pairBalance = useTokenScVal(pairAddress, sorobanContext.address!);
  const tokenDecimals = useTokenDecimals(pairAddress);

  return (
    <p>
      {pairBalance.result !== undefined
        ? formatTokenAmount(scvalToBigNumber(pairBalance.result), tokenDecimals)
        : "0"}
    </p>
  );
}
