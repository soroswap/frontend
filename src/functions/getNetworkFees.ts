import * as StellarSdk from 'stellar-sdk';
import { useSorobanReact, SorobanContextType } from '@soroban-react/core';
import { contractTransaction } from '@soroban-react/contracts';
import axios from 'axios';
import { fetchRouter } from 'services/router';
import { useSwapCallback } from 'hooks/useSwapCallback';
import { InterfaceTrade } from 'state/routing/types';
import { RouterMethod } from 'hooks/useRouterCallback';

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
  trade: InterfaceTrade | undefined,
) {
  if (!trade) {
    console.error('Trade data is not available.');
    return;
  }

  if (!sorobanContext.activeChain || !sorobanContext.activeChain.sorobanRpcUrl) {
    console.error('Error getting Soroban context.');
    return;
  }

  let op = RouterMethod.SWAP_EXACT_OUT;
  if (trade.tradeType === 'EXACT_INPUT') {
    op = RouterMethod.SWAP_EXACT_IN;
  }

  const passphrase = sorobanContext.activeChain.networkPassphrase;
  const network = sorobanContext.activeChain.id;

  const adminSecretKey = process.env.NEXT_PUBLIC_TEST_TOKENS_ADMIN_SECRET_KEY;
  let adminPublicKey;
  if (adminSecretKey) {
    adminPublicKey = StellarSdk.Keypair.fromSecret(adminSecretKey).publicKey();
  } else {
    console.error('No secret key found.');
    return;
  }
  const sorobanRpcUrl = sorobanContext.activeChain.sorobanRpcUrl;
  const routerData = await fetchRouter(network);
  const routerId = routerData.address;
  const path = trade.path?.map((address) => new StellarSdk.Address(address));
  const scValParams = [
    StellarSdk.nativeToScVal(Number(trade.inputAmount?.value), { type: 'i128' }),
    StellarSdk.nativeToScVal(Number(trade.outputAmount?.value), { type: 'i128' }),
    StellarSdk.nativeToScVal(path, { type: 'Vec' }),
    new StellarSdk.Address(adminPublicKey).toScVal(),
    StellarSdk.nativeToScVal(getCurrentTimePlusOneHour(), { type: 'u64' }),
  ];

  const server = new StellarSdk.SorobanRpc.Server(sorobanRpcUrl, {
    allowHttp: true,
  });

  const account = await server.getAccount(adminPublicKey);

  const txn = contractTransaction({
    networkPassphrase: passphrase,
    source: account,
    contractAddress: routerId,
    method: op,
    args: scValParams,
  });

  const simulated: StellarSdk.SorobanRpc.Api.SimulateTransactionResponse =
    await server?.simulateTransaction(txn);

  if (StellarSdk.SorobanRpc.Api.isSimulationError(simulated)) {
    throw new Error(simulated.error);
  } else if (!simulated.result) {
    throw new Error(`invalid simulation: no result in ${simulated}`);
  }

  return simulated.minResourceFee;
}

export async function calculateAddLiquidityFees(sorobanContext: SorobanContextType, args: any) {
  if (!sorobanContext.activeChain || !sorobanContext.activeChain.sorobanRpcUrl) {
    console.error('Error getting Soroban context.');
    return;
  }

  const passphrase = sorobanContext.activeChain.networkPassphrase;
  const network = sorobanContext.activeChain.id;

  const adminSecretKey = process.env.NEXT_PUBLIC_TEST_TOKENS_ADMIN_SECRET_KEY;
  let adminPublicKey;
  if (adminSecretKey) {
    adminPublicKey = StellarSdk.Keypair.fromSecret(adminSecretKey).publicKey();
  } else {
    console.error('No secret key found.');
    return;
  }
  const sorobanRpcUrl = sorobanContext.activeChain.sorobanRpcUrl;
  const routerData = await fetchRouter(network);
  const routerId = routerData.address;

  const server = new StellarSdk.SorobanRpc.Server(sorobanRpcUrl, {
    allowHttp: true,
  });

  const account = await server.getAccount(adminPublicKey);

  const txn = contractTransaction({
    networkPassphrase: passphrase,
    source: account,
    contractAddress: routerId,
    method: RouterMethod.ADD_LIQUIDITY,
    args,
  });

  const simulated: StellarSdk.SorobanRpc.Api.SimulateTransactionResponse =
    await server?.simulateTransaction(txn);

  if (StellarSdk.SorobanRpc.Api.isSimulationError(simulated)) {
    throw new Error(simulated.error);
  } else if (!simulated.result) {
    throw new Error(`invalid simulation: no result in ${simulated}`);
  }

  return simulated.minResourceFee;
}
