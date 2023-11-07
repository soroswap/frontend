import { SorobanContextType } from '@soroban-react/core';
import BigNumber from 'bignumber.js';
import { getTokenDecimals, getTokenName, getTokenSymbol } from 'helpers/soroban';
import { tokenBalance } from 'hooks';
import { reservesBNWithTokens } from 'hooks/useReserves';
import { TokenType } from 'interfaces';
import { FactoryResponseType } from 'interfaces/factory';
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
