// TODO: None of these functions are being used
// import BigNumber from 'bignumber.js';
// import * as StellarSdk from '@stellar/stellar-sdk';// import { ERRORS } from './error';
// import { stroopToXlm } from './format';
// import { I128 } from './xdr';

import { contractInvoke } from '@soroban-react/contracts';
import { SorobanContextType } from '@soroban-react/core';
import { xdr } from '@stellar/stellar-sdk';
import { scValToJs } from './convert';

// // TODO: once soroban supports estimated fees, we can fetch this
// export const BASE_FEE = '100';
// export const baseFeeXlm = stroopToXlm(BASE_FEE).toString();

// export const SendTxStatus: {
//   [index: string]: StellarSdk.SorobanRpc.SendTransactionStatus;
// } = {
//   Pending: 'PENDING',
//   Duplicate: 'DUPLICATE',
//   Retry: 'TRY_AGAIN_LATER',
//   Error: 'ERROR',
// };

// export const GetTxStatus: {
//   [index: string]: StellarSdk.SorobanRpc.GetTransactionStatus;
// } = {
//   Success: 'SUCCESS',
//   NotFound: 'NOT_FOUND',
//   Failed: 'FAILED',
// };

// export const XLM_DECIMALS = 7;

// export const RPC_URLS: { [key: string]: string } = {
//   FUTURENET: 'https://rpc-futurenet.stellar.org/',
// };

// // The following 3 decoders can be used to turn an XDR string to a native type
// // XDR -> String
// export const decodeBytesN = (xdr: string) => {
//   const val = StellarSdk.xdr.ScVal.fromXDR(xdr, 'base64');
//   return val.bytes().toString();
// };

// // XDR -> String
// export const decodei128 = (xdr: string) => {
//   const value = StellarSdk.xdr.ScVal.fromXDR(xdr, 'base64');
//   try {
//     return new I128([
//       BigInt(value.i128().lo().low),
//       BigInt(value.i128().lo().high),
//       BigInt(value.i128().hi().low),
//       BigInt(value.i128().hi().high),
//     ]).toString();
//   } catch (error) {
//
//     return 0;
//   }
// };

// // XDR -> Number
// export const decodeu32 = (xdr: string) => {
//   const val = StellarSdk.xdr.ScVal.fromXDR(xdr, 'base64');
//   return val.u32();
// };

// export const decoders = {
//   bytesN: decodeBytesN,
//   i128: decodei128,
//   u32: decodeu32,
// };

// // Helper used in SCVal conversion
// const bigintToBuf = (bn: bigint): Buffer => {
//   let hex = BigInt(bn).toString(16).replace(/^-/, '');
//   if (hex.length % 2) {
//     hex = `0${hex}`;
//   }

//   const len = hex.length / 2;
//   const u8 = new Uint8Array(len);

//   let i = 0;
//   let j = 0;
//   while (i < len) {
//     u8[i] = parseInt(hex.slice(j, j + 2), 16);
//     i += 1;
//     j += 2;
//   }

//   if (bn < BigInt(0)) {
//     // Set the top bit
//     u8[0] |= 0x80;
//   }

//   return Buffer.from(u8);
// };

// // Helper used in SCVal conversion
// const bigNumberFromBytes = (signed: boolean, ...bytes: (string | number | bigint)[]): BigNumber => {
//   let sign = 1;
//   if (signed && bytes[0] === 0x80) {
//     // top bit is set, negative number.
//     sign = -1;
//     bytes[0] &= 0x7f;
//   }
//   let b = BigInt(0);
//   for (const byte of bytes) {
//     b <<= BigInt(8);
//     b |= BigInt(byte);
//   }
//   return BigNumber(b.toString()).multipliedBy(sign);
// };

// // Can be used whenever you need an Address argument for a contract method
// export const accountToScVal = (account: string) => new StellarSdk.Address(account).toScVal();

// // Can be used whenever you need an i128 argument for a contract method
// // export const numberToI128 = (value: number): StellarSdk.xdr.ScVal => {
// //   const bigValue = BigNumber(value);
// //   const b: bigint = BigInt(bigValue.toFixed(0));
// //   const buf = bigintToBuf(b);
// //   if (buf.length > 16) {
// //     throw new Error("BigNumber overflows i128");
// //   }

// //   if (bigValue.isNegative()) {
// //     // Clear the top bit
// //     buf[0] &= 0x7f;
// //   }

// //   // left-pad with zeros up to 16 bytes
// //   const padded = Buffer.alloc(16);
// //   buf.copy(padded, padded.length - buf.length);
// //   console.debug({ value: value.toString(), padded });

// //   if (bigValue.isNegative()) {
// //     // Set the top bit
// //     padded[0] |= 0x80;
// //   }

// //   const hi = new StellarSdk.xdr.Int64(
// //     bigNumberFromBytes(false, ...padded.slice(4, 8)).toNumber(),
// //     bigNumberFromBytes(false, ...padded.slice(0, 4)).toNumber(),
// //   );
// //   const lo = new StellarSdk.xdr.Uint64(
// //     bigNumberFromBytes(false, ...padded.slice(12, 16)).toNumber(),
// //     bigNumberFromBytes(false, ...padded.slice(8, 12)).toNumber(),
// //   );

// //   return StellarSdk.xdr.ScVal.scvI128(
// //     new StellarSdk.xdr.Int128Parts({ lo, hi }),
// //   );
// // };

// // Given a display value for a token and a number of decimals, return the correspding BigNumber
// export const parseTokenAmount = (value: string, decimals: number) => {
//   const comps = value.split('.');

//   let whole = comps[0];
//   let fraction = comps[1];
//   if (!whole) {
//     whole = '0';
//   }
//   if (!fraction) {
//     fraction = '0';
//   }

//   // Trim trailing zeros
//   while (fraction[fraction.length - 1] === '0') {
//     fraction = fraction.substring(0, fraction.length - 1);
//   }

//   // If decimals is 0, we have an empty string for fraction
//   if (fraction === '') {
//     fraction = '0';
//   }

//   // Fully pad the string with zeros to get to value
//   while (fraction.length < decimals) {
//     fraction += '0';
//   }

//   const wholeValue = new BigNumber(whole);
//   const fractionValue = new BigNumber(fraction);

//   return wholeValue.shiftedBy(decimals).plus(fractionValue);
// };

// // Get a server configfured for a specific network
// // export const getServer = (networkDetails: NetworkDetails) =>
// //   new StellarSdk.Server(RPC_URLS[networkDetails.network], {
// //     allowHttp: networkDetails.networkUrl.startsWith("http://"),
// //   });

// // Get a TransactionBuilder configured with our public key
// export const getTxBuilder = async (
//   pubKey: string,
//   fee: string,
//   server: StellarSdk.Server,
//   networkPassphrase: string,
// ) => {
//   const source = await server.getAccount(pubKey);
//   return new StellarSdk.TransactionBuilder(source, {
//     fee,
//     networkPassphrase,
//   });
// };

// //  Can be used whenever we need to perform a "read-only" operation
// //  Used in getTokenSymbol, getTokenName, getTokenDecimals, and getTokenBalance
// export const simulateTx = async <ArgType>(
//   tx: StellarSdk.Transaction<
//     StellarSdk.Memo<StellarSdk.MemoType>,
//     StellarSdk.Operation[]
//   >,
//   decoder: (xdr: string) => ArgType,
//   server: StellarSdk.Server,
// ) => {
//   const { results } = await server.simulateTransaction(tx);
//   if (!results || results.length !== 1) {
//     throw new Error('Invalid response from simulateTransaction');
//   }
//   const result = results[0];
//   return decoder(result.xdr);
// };

// // Build and submits a transaction to the Soroban RPC
// // Polls for non-pending state, returns result after status is updated
// export const submitTx = async (
//   signedXDR: string,
//   networkPassphrase: string,
//   server: StellarSdk.Server,
// ) => {
//   const tx = StellarSdk.TransactionBuilder.fromXDR(signedXDR, networkPassphrase);

//   const sendResponse = await server.sendTransaction(tx);

//   if (sendResponse.errorResultXdr) {
//     throw new Error(ERRORS.UNABLE_TO_SUBMIT_TX);
//   }

//   if (sendResponse.status === SendTxStatus.Pending) {
//     let txResponse = await server.getTransaction(sendResponse.hash);

//     // Poll this until the status is not "NOT_FOUND"
//     while (txResponse.status === GetTxStatus.NotFound) {
//       // See if the transaction is complete
//       // eslint-disable-next-line no-await-in-loop
//       txResponse = await server.getTransaction(sendResponse.hash);
//       // Wait a second
//       // eslint-disable-next-line no-await-in-loop
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//     }

//     return txResponse.resultXdr!;
//     // eslint-disable-next-line no-else-return
//   } else {
//     throw new Error(`Unabled to submit transaction, status: ${sendResponse.status}`);
//   }
// };

// Get the tokens symbol, decoded as a string
export const getTokenSymbol = async (
  tokenId: string,
  sorobanContext: SorobanContextType,
): Promise<string | null> => {
  try {
    let result = await contractInvoke({
      contractAddress: tokenId as string,
      method: 'symbol',
      args: [],
      sorobanContext,
    });

    return scValToJs(result as xdr.ScVal);
  } catch (error) {
    return null;
  }
};

// Get the tokens name, decoded as a string
export const getTokenName = async (
  tokenId: string,
  sorobanContext: SorobanContextType,
): Promise<string | null> => {
  try {
    let result = await contractInvoke({
      contractAddress: tokenId as string,
      method: 'name',
      args: [],
      sorobanContext,
    });

    return scValToJs(result as xdr.ScVal);
  } catch (error) {
    return null;
  }
};

// Get the tokens decimals, decoded as a number
export const getTokenDecimals = async (
  tokenId: string,
  sorobanContext: SorobanContextType,
): Promise<number> => {
  try {
    let result = await contractInvoke({
      contractAddress: tokenId as string,
      method: 'decimals',
      args: [],
      sorobanContext,
    });

    return scValToJs(result as xdr.ScVal);
  } catch (error) {
    return 7;
  }
};
// // Get the tokens balance, decoded as a string
// export const getTokenBalance = async (
//   address: string,
//   tokenId: string,
//   txBuilder: StellarSdk.TransactionBuilder,
//   server: StellarSdk.Server,
// ) => {
//   const params = [accountToScVal(address)];
//   const contract = new StellarSdk.Contract(tokenId);
//   const tx = txBuilder
//     .addOperation(contract.call('balance', ...params))
//     .setTimeout(StellarSdk.TimeoutInfinite)
//     .build();

//   const result = await simulateTx<string>(tx, decoders.i128, server);
//   return result;
// };

// // Build a "transfer" operation, and prepare the corresponding XDR
// // https://github.com/stellar/soroban-examples/blob/main/token/src/contract.rs#L27
// export const makePayment = async (
//   tokenId: string,
//   amount: number,
//   to: string,
//   pubKey: string,
//   memo: string,
//   txBuilder: StellarSdk.TransactionBuilder,
//   server: StellarSdk.Server,
//   networkPassphrase: string,
// ) => {
//   const contract = new StellarSdk.Contract(tokenId);
//   const tx = txBuilder
//     .addOperation(
//       contract.call(
//         'transfer',
//         ...[
//           accountToScVal(pubKey), // from
//           accountToScVal(to), // to
//           // numberToI128(amount), // amount
//         ],
//       ),
//     )
//     .setTimeout(StellarSdk.TimeoutInfinite);

//   if (memo.length > 0) {
//     tx.addMemo(StellarSdk.Memo.text(memo));
//   }

//   const preparedTransaction = await server.prepareTransaction(tx.build(), networkPassphrase);

//   return preparedTransaction.toXDR();
// };

// export const getEstimatedFee = async (
//   tokenId: string,
//   amount: number,
//   to: string,
//   pubKey: string,
//   memo: string,
//   txBuilder: StellarSdk.TransactionBuilder,
//   server: StellarSdk.Server,
// ) => {
//   const contract = new StellarSdk.Contract(tokenId);
//   const tx = txBuilder
//     .addOperation(
//       contract.call(
//         'transfer',
//         ...[
//           accountToScVal(pubKey), // from
//           accountToScVal(to), // to
//           // numberToI128(amount), // amount
//         ],
//       ),
//     )
//     .setTimeout(StellarSdk.TimeoutInfinite);

//   if (memo.length > 0) {
//     tx.addMemo(StellarSdk.Memo.text(memo));
//   }

//   const raw = tx.build();

//   const simResponse = await server.simulateTransaction(raw);
//   if (simResponse.error) {
//     throw simResponse.error;
//   }

//   if (!simResponse.results || simResponse.results.length < 1) {
//     throw new Error('transaction simulation failed');
//   }

//   // 'classic' tx fees are measured as the product of tx.fee * 'number of operations', In soroban contract tx,
//   // there can only be single operation in the tx, so can make simplification
//   // of total classic fees for the soroban transaction will be equal to incoming tx.fee + minResourceFee.
//   const classicFeeNum = parseInt(raw.fee, 10) || 0;
//   const minResourceFeeNum = parseInt(simResponse.minResourceFee, 10) || 0;
//   const fee = (classicFeeNum + minResourceFeeNum).toString();
//   return fee;
// };
