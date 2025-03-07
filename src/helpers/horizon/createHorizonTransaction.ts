import { SorobanContextType, useSorobanReact } from "soroban-react-stellar-wallets-kit";
import { InterfaceTrade, TradeType } from "state/routing/types";
import { Asset, TransactionBuilder, Operation, BASE_FEE } from "@stellar/stellar-sdk";
import { getAmount } from "./getHorizonPath";
import BigNumber from "bignumber.js";

export const createStellarPathPayment = async (trade: InterfaceTrade, allowedSlippage: any, sorobanContext: SorobanContextType) => {
  const { address, activeConnector, serverHorizon, activeChain } = sorobanContext;
  if (!address || !activeConnector || !serverHorizon || !activeChain) return;
  const amount = getAmount(trade.inputAmount?.value!);
  const sourceAsset = new Asset(trade.inputAmount?.currency.code!, trade.inputAmount?.currency.issuer)
  const destinationAsset = new Asset(trade.outputAmount?.currency.code!, trade.outputAmount?.currency.issuer)
  const destinationAmount = getAmount(trade.outputAmount?.value!);
  const account = await serverHorizon?.loadAccount(address!);
  const path = trade.path?.map((asset) => {
    const assetParts = asset.split(":")
    if (assetParts.length == 1 && assetParts[0] == "native") {
      return Asset.native()
    }
    return new Asset(assetParts[0], assetParts[1])
  })

  if (!account) {
    throw new Error("Account not found")
  }
  let transaction;
  if (!amount || !sourceAsset || !destinationAsset || !path || !destinationAmount) throw new Error("Invalid trade");
  if (trade.tradeType == TradeType.EXACT_INPUT) {
    const percentageSlippage = new BigNumber(100).minus(allowedSlippage).dividedBy(100);
    const destMin = new BigNumber(destinationAmount).multipliedBy(percentageSlippage).toFixed(7).toString();
    transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: activeChain?.networkPassphrase
    }).addOperation(Operation.pathPaymentStrictSend({
      sendAsset: sourceAsset,
      sendAmount: amount,
      destination: address,
      destAsset: destinationAsset,
      destMin: destMin,
      path: path
    })).setTimeout(180).build();
  } else {
    const maxPercentage = new BigNumber(100).plus(allowedSlippage).dividedBy(100);
    const sendMax = new BigNumber(amount).multipliedBy(maxPercentage).toFixed(7).toString();
    console.log(sendMax)
    transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: activeChain?.networkPassphrase
    }).addOperation(Operation.pathPaymentStrictReceive({
      sendAsset: sourceAsset,
      sendMax: sendMax,
      destination: address,
      destAsset: destinationAsset,
      destAmount: destinationAmount,
      path: path
    })).setTimeout(180).build();
  }
  const transactionXDR = transaction.toXDR();
  const signedTransaction = await activeConnector?.signTransaction(transactionXDR, {
    networkPassphrase: activeChain?.networkPassphrase,
  });
  if (!signedTransaction) {
    throw new Error("Couldn't sign transaction");
  }
  const transactionToSubmit = TransactionBuilder.fromXDR(
    signedTransaction!,
    activeChain?.networkPassphrase ?? '',
  );
  try {
    const transactionResult = await serverHorizon?.submitTransaction(transactionToSubmit);
    return transactionResult;
  } catch (e: any) {
    const errorResponseArray = e.response.data.extras.result_codes?.operations;
    if (errorResponseArray) {
      console.log(errorResponseArray)
      const operations = e.response.data.extras.result_codes?.operations
      for (let operation of operations) {
        switch (operation) {
          case "op_under_dest_min":
            throw new Error("Try increasing slippage");
          case "op_underfunded":
            throw new Error("Underfunded");
          case "op_no_destination":
            throw new Error("No destination account");
          case "op_no_trust":
            throw new Error("No trustline");
          case "op_too_few_offers":
            throw new Error("Too few offers");
          case "op_not_Authorized":
            throw new Error("Not authorized");
          case "op_over_source_max":
            throw new Error("Over source max");
          case "AxiosError: Request failed with status code 504":
            throw new Error("Connection timeout");
          default:
            throw new Error(operation)
        }
      }
    }

    
    throw e
  }
}
