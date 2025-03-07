import { SorobanContextType } from 'soroban-react-stellar-wallets-kit';
import BigNumber from 'bignumber.js';
import { TokenType } from 'interfaces';
import { isClassicStellarAssetFormat } from './address';
import { getTokenName } from './soroban';
import { AccountResponse } from '@stellar/stellar-sdk/lib/horizon';

const getBalanceInAccount = (tokenName: string, account: AccountResponse) => {
  const balance = account.balances.find((bal: any) => {
    if(bal.asset_code === tokenName) {
      return bal;
    }
  });
  if(balance) {
    return balance.balance;
  }
  return undefined;
}

export const requiresTrustline = async (
  sorobanContext: SorobanContextType,
  asset?: TokenType,
  amount?: string,
): Promise<boolean> => {
  if (!sorobanContext.address || !asset) return false
  const {serverHorizon} = sorobanContext
  const account = await serverHorizon?.loadAccount(sorobanContext.address)
  const tokenName = await getTokenName(asset.contract, sorobanContext);
  if (!account) return true;

  if(!tokenName && (asset.code && asset.issuer)) {
    const balance = getBalanceInAccount(asset.code, account);
    if(balance === undefined) {
      return true;
    };
    if(balance) {
      return false
    }
  }

  // Return false immediately if it's not a classic Stellar asset
  if (!isClassicStellarAssetFormat(tokenName as string)) {
    return false;
  }

  const assetOnAccount = account?.balances.find((bal) =>
    'asset_code' in bal && 'asset_issuer' in bal &&
    bal.asset_code === asset.code && bal.asset_issuer === asset.issuer
  )

  if (assetOnAccount) {
    if ('limit' in assetOnAccount && amount) {
      const decimals = asset.decimals ?? 7;
      const formattedAmount = new BigNumber(amount).shiftedBy(-decimals);
      const limit = new BigNumber(assetOnAccount.limit);
      
      if (formattedAmount.isGreaterThan(limit)) {
        return true;
      }
    }
    return false;
  }

  return true
};
