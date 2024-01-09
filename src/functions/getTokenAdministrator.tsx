import { contractInvoke } from '@soroban-react/contracts';
import { SorobanContextType } from '@soroban-react/core';
import { scValToJs } from 'helpers/convert';
import { xdr } from 'stellar-sdk';

export async function getTokenAdministrator(
  tokenAddres: string,
  sorobanContext: SorobanContextType,
) {
  if (!tokenAddres) return '';

  //This method only exists in the contract :( )
  const response = await contractInvoke({
    contractAddress: tokenAddres,
    method: 'read_administrator',
    args: [],
    sorobanContext,
  });

  if (response) {
    const tokenAdmin = scValToJs(response as xdr.ScVal) as string;
    return tokenAdmin;
  } else {
    return '';
  }
}
