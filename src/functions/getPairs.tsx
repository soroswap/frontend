import { contractInvoke } from '@soroban-react/contracts';
import { SorobanContextType } from '@soroban-react/core';
import BigNumber from 'bignumber.js';
import { scValToJs } from 'helpers/convert';
import { getTokenDecimals, getTokenName, getTokenSymbol } from 'helpers/soroban';
import { bigNumberToU32 } from 'helpers/utils';
import { tokenBalance } from 'hooks';
import { reservesBNWithTokens } from 'hooks/useReserves';
import { TokenType } from 'interfaces';
import { FactoryResponseType } from 'interfaces/factory';
import { xdr } from 'soroban-client';
import { getFactory } from './getFactory';
import { getPairAddress } from './getPairAddress';
import { getTotalLpShares } from './getTotalLpShares';

export const getPairs = async (sorobanContext: SorobanContextType) => {
  const fetchResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/pairs`);
  const data = await fetchResponse.json();

  const filtered = data?.filter(
    (item: FactoryResponseType) =>
      item.network === sorobanContext?.activeChain?.name?.toLowerCase(),
  );

  return filtered[0].pairs;
};

export const getPairsFromFactory = async (sorobanContext: SorobanContextType) => {
  const {factory_address} = await getFactory(sorobanContext)
  let pairs = []  
  let allpairs_length = await contractInvoke({
    contractAddress: factory_address,
    method: 'all_pairs_length',
    args: [],
    sorobanContext,
  });
  
  allpairs_length = scValToJs(allpairs_length as xdr.ScVal)

  for (let index = 0; index < Number(allpairs_length); index++) {
    let pairAddress = await contractInvoke({
      contractAddress: factory_address,
      method: 'all_pairs',
      args: [bigNumberToU32(new BigNumber(index))],
      sorobanContext,
    });

    pairs.push(await getPairsFromPairAddress(scValToJs(pairAddress as xdr.ScVal), sorobanContext)) 
  }

  return pairs
}

export const getPairsFromPairAddress = async (pair_address: string, sorobanContext: SorobanContextType) => {

  let token_a_id = await contractInvoke({
    contractAddress: pair_address,
    method: 'token_0',
    sorobanContext,
  });
  token_a_id = scValToJs(token_a_id as xdr.ScVal)

  let token_b_id = await contractInvoke({
    contractAddress: pair_address,
    method: 'token_1',
    sorobanContext,
  });
  token_b_id = scValToJs(token_b_id as xdr.ScVal)

  return {
    token_a_id: String(token_a_id),
    token_b_id: String(token_b_id),
    pair_address,
    token_a_address: String(token_a_id),
    token_b_address: String(token_b_id)
  }

}

export const getPairsInfo = async (
  currencies: [TokenType | undefined, TokenType | undefined][],
  sorobanContext: SorobanContextType,
) => {
  try {
    const pairAddresses = await Promise.all(
      currencies.map(async ([tokenA, tokenB]) => {
        return await getPairAddress(tokenA?.address, tokenB?.address, sorobanContext);
      }),
    );

    const pairReserves = await Promise.all(
      pairAddresses.map(async (pairAddress) => {
        return await reservesBNWithTokens(pairAddress, sorobanContext);
      }),
    );

    return await Promise.all(
      pairReserves.map(async (reserves, i) => {
        const tokenA = currencies[i][0];
        const tokenB = currencies[i][1];

        const totalSupply = await getTotalLpShares(pairAddresses[i], sorobanContext);

        const liquidityToken = {
          token: {
            address: pairAddresses[i],
            name: await getTokenName(pairAddresses[i], sorobanContext),
            symbol: await getTokenSymbol(pairAddresses[i], sorobanContext),
            decimals: await getTokenDecimals(pairAddresses[i], sorobanContext),
          },
          userBalance: await tokenBalance(
            pairAddresses[i],
            sorobanContext.address ?? '',
            sorobanContext,
          ),
          totalSupply,
        };

        const userShare0 = BigNumber(reserves.reserve0 as BigNumber)
          .multipliedBy(BigNumber(liquidityToken.userBalance))
          .dividedBy(BigNumber(totalSupply))
          .decimalPlaces(0);

        const userShare1 = BigNumber(reserves.reserve1 as BigNumber)
          .multipliedBy(BigNumber(liquidityToken.userBalance))
          .dividedBy(BigNumber(totalSupply))
          .decimalPlaces(0);

        const tokenAmounts = [
          {
            currency: reserves.token0 === tokenA?.address ? tokenA : tokenB,
            balance: reserves.token0 === tokenA?.address ? userShare0 : userShare1,
          },
          {
            currency: reserves.token1 === tokenA?.address ? tokenA : tokenB,
            balance: reserves.token1 === tokenA?.address ? userShare0 : userShare1,
          },
        ];

        return {
          liquidityToken,
          tokenAmounts,
        };
      }),
    );
  } catch (error) {
    //
    return undefined;
  }
};

export const getPairInfo = async (
  tokenA: TokenType | undefined,
  tokenB: TokenType | undefined,
  sorobanContext: SorobanContextType,
) => {
  const inputs: [[TokenType | undefined, TokenType | undefined]] = [[tokenA, tokenB]];
  const toReturn = await getPairsInfo(inputs, sorobanContext);
  return toReturn ? toReturn[0] : undefined;
};
