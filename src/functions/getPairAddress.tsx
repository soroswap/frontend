import { contractInvoke } from 'stellar-react';
import { SorobanContextType } from 'stellar-react';
import { addressToScVal, scValToJs } from 'helpers/convert';
import { fetchFactory } from 'services/factory';
import { xdr } from '@stellar/stellar-sdk';
import { passphraseToBackendNetworkName } from 'services/pairs';

export async function getPairAddress(
  address_0: string | undefined,
  address_1: string | undefined,
  sorobanContext: SorobanContextType,
) {

  if (!address_0 || !address_1) return '';
  const { activeNetwork } = sorobanContext;
  const activeChain = passphraseToBackendNetworkName[activeNetwork!].toLowerCase();

  const factory = await fetchFactory(activeChain);


  console.log("getPairAddress: Calling get_pair with addresses:", address_0, address_1);

  const response = await contractInvoke({
    contractAddress: factory.address,
    method: 'get_pair',
    args: [addressToScVal(address_0), addressToScVal(address_1)],
    sorobanContext,
  });

  if (response) {
    const pairAddress = scValToJs(response as xdr.ScVal) as string;
    return pairAddress;
  } else {
    return '';
  }
}
