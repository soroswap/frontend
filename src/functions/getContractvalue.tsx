import { SorobanContextType } from "@soroban-react/core/dist/SorobanContext";
import * as SorobanClient from "soroban-client";
import { xdr } from "soroban-client";

export default async function getContractValue({
  contractAddress,
  method,
  params,
  sorobanContext,
}: {
  contractAddress: string;
  method: string;
  params: xdr.ScVal[];
  sorobanContext: SorobanContextType;
}) {
  const contract = new SorobanClient.Contract(contractAddress);
  const networkPassphrase = sorobanContext.activeChain?.networkPassphrase ?? "";
  const transaction = new SorobanClient.TransactionBuilder(
    new SorobanClient.Account(sorobanContext.address ?? "", "0"),
    {
      // fee doesn't matter, we're not submitting
      fee: "100",
      networkPassphrase,
    },
  )
    .addOperation(contract.call(method, ...params))
    .setTimeout(SorobanClient.TimeoutInfinite)
    .build();
  const { results } = (await sorobanContext.server?.simulateTransaction(
    transaction,
  )) ?? { results: null };
  if (!results || results.length !== 1) {
    throw new Error("Invalid response from simulateTransaction");
  }
  const result = results[0];
  return xdr.ScVal.fromXDR(result.xdr, "base64");
}
