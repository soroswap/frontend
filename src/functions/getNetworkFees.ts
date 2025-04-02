import * as StellarSdk from '@stellar/stellar-sdk';
import { useSorobanReact, SorobanContextType } from 'stellar-react';
import { contractTransaction } from 'stellar-react';
import axios from 'axios';
import { fetchRouter } from 'services/router';
import { useSwapCallback } from 'hooks/useSwapCallback';
import { InterfaceTrade, PlatformType } from 'state/routing/types';
import { RouterMethod, useRouterCallback } from 'hooks/useRouterCallback';
import { passphraseToBackendNetworkName } from 'services/pairs';

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
  if (!sorobanContext.activeNetwork || !sorobanContext.sorobanServer) {
    console.error('Error getting Soroban context.');
    return;
  }
  if (trade.platform === PlatformType.STELLAR_CLASSIC) {
    return await sorobanContext.horizonServer?.fetchBaseFee()
  }

  let op = RouterMethod.SWAP_EXACT_OUT;
  if (trade.tradeType === 'EXACT_INPUT') {
    op = RouterMethod.SWAP_EXACT_IN;
  }
  const {activeNetwork, sorobanServer} = sorobanContext;
  const activeChain = passphraseToBackendNetworkName[activeNetwork!].toLowerCase();
  const { networkPassphrase:passphrase,
          id: network, 
        } = {
          networkPassphrase: activeNetwork,
          id: activeChain,
        };
  if(!passphrase || !network || !sorobanServer) throw new Error('Missing soroban context')
  const adminPublicKey = process.env.NEXT_PUBLIC_TRUSTLINE_WALLET_PUBLIC_KEY;
  if (!adminPublicKey) {
    console.error('No secret key found.');
    return;
  }
  console.log('🟡',network)
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

  const server = new StellarSdk.SorobanRpc.Server(sorobanServer.serverURL, {
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

export async function calculateLiquidityFees(
  sorobanContext: SorobanContextType,
  args: any,
  op: RouterMethod,
) {
  if (!sorobanContext.activeNetwork || !sorobanContext.sorobanServer) {
    console.error('Error getting Soroban context.');
    return;
  }

  const passphrase = sorobanContext.activeNetwork;
  const network = passphraseToBackendNetworkName[passphrase!].toLowerCase();

  const adminPublicKey = process.env.NEXT_PUBLIC_TRUSTLINE_WALLET_PUBLIC_KEY;
  if (!adminPublicKey) {
    console.error('No secret key found.');
    return;
  }
  const sorobanRpcUrl = sorobanContext.sorobanServer.serverURL;
  console.log('🔵',network)
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
    method: op,
    args,
  });

  const simulated: StellarSdk.SorobanRpc.Api.SimulateTransactionResponse =
    await server?.simulateTransaction(txn);

  if (StellarSdk.SorobanRpc.Api.isSimulationError(simulated)) {
    console.error(simulated.error);
    return;
  } else if (!simulated.result) {
    console.error(`invalid simulation: no result in ${simulated}`);
    return;
  }

  return simulated.minResourceFee;
}
