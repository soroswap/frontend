import { SorobanContextType, useSorobanReact } from "@soroban-react/core";
import { InterfaceTrade, TradeType } from "state/routing/types";
import {Asset, TransactionBuilder, Operation, BASE_FEE} from "@stellar/stellar-sdk";
import { getAmount } from "./getHorizonPath";

export const createStellarPathPayment = async (trade: InterfaceTrade, sorobanContext: SorobanContextType) => {
  const {address, activeConnector, serverHorizon, activeChain} = sorobanContext;
  if(!address || !activeConnector || !serverHorizon || !activeChain) return;
  const amount = getAmount(trade.inputAmount?.value!);
  const sourceAsset = new Asset(trade.inputAmount?.currency.code!, trade.inputAmount?.currency.issuer)
  const destinationAsset = new Asset(trade.outputAmount?.currency.code!, trade.outputAmount?.currency.issuer)
  const account = await serverHorizon?.loadAccount(address!);
  const path = trade.path?.map((asset) => {
    const assetParts = asset.split(":")
    if(assetParts.length == 1 && assetParts[0] == "native"){
      return Asset.native()
    }
    return new Asset(assetParts[0], assetParts[1])
  })
  if(!account){
    throw new Error("Account not found")
  }
  let transaction;
  if(trade.tradeType == TradeType.EXACT_INPUT){
    transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: activeChain?.networkPassphrase
    }).addOperation(Operation.pathPaymentStrictSend({
      sendAsset: sourceAsset,
      sendAmount: amount!,
      destination: address!,
      destAsset: destinationAsset,
      destMin: amount!,
      path: path
    })).setTimeout(180).build();
  } else {
    transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: activeChain?.networkPassphrase
    }).addOperation(Operation.pathPaymentStrictReceive({
      sendAsset: sourceAsset,
      sendMax: amount!,
      destination: address!,
      destAsset: destinationAsset,
      destAmount: amount!,
    })).setTimeout(180).build();
  }
  const transactionXDR = transaction.toXDR();
  const signedTransaction = await activeConnector?.signTransaction(transactionXDR, {
    networkPassphrase: activeChain?.networkPassphrase,
  });
  if(!signedTransaction){
    throw new Error("Couldn't sign transaction");
  }
  const transactionToSubmit = TransactionBuilder.fromXDR(
    signedTransaction!,
    activeChain?.networkPassphrase ?? '',
  );
  const transactionResult = await serverHorizon?.submitTransaction(transactionToSubmit);
  return transactionResult;
}
