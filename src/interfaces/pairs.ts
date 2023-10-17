import BigNumber from 'bignumber.js';
import { TokenType } from './tokens';

interface TokenAmount {
  currency: TokenType | undefined;
  balance: BigNumber;
}

interface LiquidityToken {
  token: TokenType | undefined;
  userBalance: number | BigNumber;
  totalSupply: any;
}

export interface PairInfo {
  liquidityToken: LiquidityToken;
  tokenAmounts: TokenAmount[];
}
