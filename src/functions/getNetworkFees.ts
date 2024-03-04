import * as StellarSdk from 'stellar-sdk';
import { SorobanContextType } from '@soroban-react/core';
import axios from 'axios';
import { fetchKeys } from 'services/keys';
import { fetchRouter } from 'services/router';

const getCurrentTimePlusOneHour = (): number => {
  // Get the current time in milliseconds
  const now = Date.now();

  // Add one hour (3600000 milliseconds)
  const oneHourLater = now + 36000000;

  const oneHourLaterSeconds = Math.floor(oneHourLater / 1000);
  return oneHourLaterSeconds;
};

export async function calculateSwapFees(
  sorobanContext: SorobanContextType,
  pathAddresses: string[],
  amountIn: number,
  amountOutMin: number,
) {
  console.log(sorobanContext);
  if (!sorobanContext.activeChain || !sorobanContext.activeChain.sorobanRpcUrl) {
    return;
  }

  const passphrase = sorobanContext.activeChain.networkPassphrase;
  const network = sorobanContext.activeChain.id;

  const keysData = await fetchKeys();
  const keys = keysData.filter((key: { network: string }) => key.network === network)[0];
  const adminPublicKey = keys.admin_public;
  const adminSecretKey = keys.admin_secret;

  const sorobanRpcUrl = sorobanContext.activeChain.sorobanRpcUrl;

  const routerData = await fetchRouter();
  const router = routerData.filter((key: { network: string }) => key.network === network)[0];
  const routerId = router.router_id;

  const routerContract = new StellarSdk.Contract(routerId);
  const fee = StellarSdk.BASE_FEE;
  const path = pathAddresses.map((address) => new StellarSdk.Address(address));
  const scValParams = [
    StellarSdk.nativeToScVal(Number(amountIn), { type: 'i128' }),
    StellarSdk.nativeToScVal(Number(amountOutMin), { type: 'i128' }),
    StellarSdk.nativeToScVal(path, { type: 'Vec' }),
    new StellarSdk.Address(adminPublicKey).toScVal(),
    StellarSdk.nativeToScVal(getCurrentTimePlusOneHour(), { type: 'u64' }),
  ];

  const op = routerContract.call('swap_exact_tokens_for_tokens', ...scValParams);
  console.log('OPERATION: ', op);
  const server = new StellarSdk.SorobanRpc.Server(sorobanRpcUrl, {
    allowHttp: true,
  });
  const account = await server.getAccount(adminPublicKey);
  const transaction = new StellarSdk.TransactionBuilder(account, { fee })
    .setNetworkPassphrase(passphrase)
    .setTimeout(30) // valid for the next 30s
    .addOperation(op)
    .build();

  console.log('TRANSACTION: ', transaction);
  transaction.sign(StellarSdk.Keypair.fromSecret(adminSecretKey));
  console.log('SIGNED TRANSACTION: ', transaction);
  const preparedTransaction = await server.prepareTransaction(transaction);
  console.log('PREPARED TRANSACTION: ', preparedTransaction);
  const simulatedTransaction = await server.simulateTransaction(preparedTransaction);
  type simulatedTransactionKey = keyof typeof simulatedTransaction;
  const minResourceFeeVar = 'minResourceFee' as simulatedTransactionKey;
  const minResourceFee = simulatedTransaction[minResourceFeeVar];
  console.log('minResourceFee:', minResourceFee);
}
