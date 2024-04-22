// import { SpacewalkPrimitivesCurrencyId } from '@polkadot/types/lookup';
// import _ from 'lodash';
// import { useEffect, useMemo, useState } from 'preact/compat';
// import { useGlobalState } from '../GlobalStateProvider';
// import { useNodeInfoState } from '../NodeInfoProvider';
// import { getAddressForFormat } from '../helpers/addressFormatter';
// import { addSuffix, currencyToString } from '../helpers/spacewalk';
// import { PortfolioAsset } from '../pages/dashboard/PortfolioColumns';
// import { nativePendulumToDecimal } from '../shared/parseNumbers/metric';
// import { useVaultRegistryPallet } from './spacewalk/useVaultRegistryPallet';
// import { usePriceFetcher } from './usePriceFetcher';

import { useInkathon } from "@scio-labs/use-inkathon";
import { convertCurrencyToStellarAsset, nativePendulumToDecimal } from "helpers/bridge/pendulum/spacewalk";
import { useEffect, useState } from "react";
import { SpacewalkPrimitivesCurrencyId, useSpacewalkVaults } from "./useSpacewalkVaults";

interface SpacewalkBalanceType {
  free: string,
  reserved: string,
  frozen: string
}

interface SpacewalkBalances {
  asset: string | undefined,
  balance: number,
}

function useSpacewalkBalances() {
  const { api, activeAccount } = useInkathon();

  const { getVaults } = useSpacewalkVaults();

  const [balances, setBalances] = useState<SpacewalkBalances[] | undefined>();

  useEffect(() => {
    if (!api || !activeAccount) return;

    async function fetchSpacewalkCurrencies() {
      try {
        const vaultData = await getVaults();
        const currencies = vaultData.map(vault => vault.id.currencies.wrapped);
        return currencies;
      } catch (error) {
        console.error('BRIDGE CONNECTION ERROR', error);
        return [];
      }
    }

    async function getPortfolioAssetsFromSpacewalk(spacewalkCurrencies: SpacewalkPrimitivesCurrencyId[]) {
      if (!spacewalkCurrencies || spacewalkCurrencies.length === 0 || !activeAccount) return [];
  
      const assets = await Promise.all(spacewalkCurrencies.map(async (currency: SpacewalkPrimitivesCurrencyId) => {
        const asset = convertCurrencyToStellarAsset(currency.Stellar)
        const balance = await fetchBridgedTokensBalance(activeAccount.address, currency);

        const decimals = 12;
        const amount = nativePendulumToDecimal(balance?.free || '0', decimals).toNumber();
        // const price: number = (await pricesCache)[token];
        // const usdValue = price * amount;

        return {
          asset: asset?.code,
          // price,
          balance: amount,
          // usdValue,
        };
      }));
  
      return assets.filter(asset => asset != null);
    }

    async function fetchBridgedTokensBalance(address: string, currency: SpacewalkPrimitivesCurrencyId): Promise<SpacewalkBalanceType | null> {
      if (!api) return null;
      const accountData = await api.query.tokens.accounts(address, currency);
      const result = accountData.toHuman();
    
      // Validate the result structure
      const isValidSpacewalkBalance = (data: any): data is SpacewalkBalanceType => {
        return typeof data === 'object' &&
               data !== null &&
               typeof data.free === 'string' &&
               typeof data.reserved === 'string' &&
               typeof data.frozen === 'string';
      };
    
      if (isValidSpacewalkBalance(result)) {
        return result;
      } else {
        console.error('Data fetched does not match SpacewalkBalanceType:', result);
        return null;
      }
    }

    async function fetchSpacewalkBalances() {
      try {
        const spacewalkCurrencies = await fetchSpacewalkCurrencies();
        const portfolioAssets = await getPortfolioAssetsFromSpacewalk(spacewalkCurrencies);
        setBalances(portfolioAssets)
      } catch (error) {
        console.error('Error in fetching data:', error);
      }
    }

    fetchSpacewalkBalances();

  }, [activeAccount, api, getVaults]);


  return {
    balances
  }
}

export default useSpacewalkBalances;