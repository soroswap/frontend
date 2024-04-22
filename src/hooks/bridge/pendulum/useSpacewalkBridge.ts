import { useSorobanReact } from '@soroban-react/core';
import { TenantName } from 'BridgeStateProvider/models';
import { convertCurrencyToStellarAsset, shouldFilterOut } from 'helpers/bridge/pendulum/spacewalk';
import { stringifyStellarAsset } from 'helpers/bridge/pendulum/stellar';
import _ from 'lodash-es';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { Asset } from 'stellar-sdk';
import { ExtendedSpacewalkVault, VaultId, useSpacewalkVaults } from './useSpacewalkVaults';

export interface SpacewalkBridge {
  selectedVault?: VaultId;
  vaults?: ExtendedSpacewalkVault[];
  wrappedAssets?: Asset[];
  selectedAsset?: Asset;
  setSelectedAsset: Dispatch<SetStateAction<Asset | undefined>>;
  setSelectedVault: Dispatch<SetStateAction<VaultId | undefined>>;
}

function useSpacewalkBridge(): SpacewalkBridge {
  const { serverHorizon } = useSorobanReact();
  const [vaults, setExtendedVaults] = useState<ExtendedSpacewalkVault[]>([]);
  const { getVaults, getVaultStellarPublicKey } = useSpacewalkVaults();
  const [selectedVault, setSelectedVault] = useState<VaultId | undefined>(undefined);
  const [selectedAsset, setSelectedAsset] = useState<Asset | undefined>(undefined);

  useEffect(() => {
    async function fetchAndProcessVaults() {
      try {
        const vaultData = await getVaults();
        const combinedVaults = await Promise.all(
          vaultData.map(async (vault) => {
            const extended: ExtendedSpacewalkVault = { ...vault };

            // Start of Stellar balance retrieval
            const stellarAccount = await getVaultStellarPublicKey(vault.id.accountId);
            if (stellarAccount) {
              const accountLoaded = await serverHorizon?.loadAccount(stellarAccount.publicKey());
              let vaultAssetBalance;

              if (typeof vault.id.currencies.wrapped.Stellar === 'string') {
                vaultAssetBalance = accountLoaded?.balances.find(
                  (bal) => bal.asset_type === 'native',
                )?.balance;
              } else if (vault.id.currencies.wrapped.Stellar?.AlphaNum4) {
                let { code } = vault.id.currencies.wrapped.Stellar.AlphaNum4;
                vaultAssetBalance = accountLoaded?.balances.find(
                  (bal) => 'asset_code' in bal && bal.asset_code === code,
                )?.balance;
              }
              extended.redeemableTokens = vaultAssetBalance;
            }
            // End of Stellar balance retrieval

            // TODO: Pendulum balance retrieval goes here

            return extended;
          }),
        );

        setExtendedVaults(combinedVaults);
      } catch (error) {
        console.error('BRIDGE CONNECTION ERROR', error);
      }
    }

    fetchAndProcessVaults();
  }, [getVaults, getVaultStellarPublicKey, serverHorizon]);

  const wrappedAssets = useMemo(() => {
    if (!vaults) return;
    const assets = vaults
      .map((vault) => convertCurrencyToStellarAsset(vault.id.currencies.wrapped.Stellar))
      .filter(
        (asset): asset is Asset => asset != null && !shouldFilterOut(TenantName.Pendulum, asset),
      );
    return _.uniqBy(assets, (asset) => stringifyStellarAsset(asset));
  }, [vaults]);

  useEffect(() => {
    if (selectedAsset?.code === 'XLM') {
      const xlmVault = vaults.find(
        (vault) => vault.id.currencies.wrapped.Stellar === 'StellarNative',
      );
      if (xlmVault) {
        setSelectedVault(xlmVault.id);
      }
    } else {
      const vault = vaults.find((vault) => {
        if (typeof vault.id.currencies.wrapped.Stellar === 'string') return null;
        if (vault.id.currencies.wrapped.Stellar.AlphaNum4) {
          return vault.id.currencies.wrapped.Stellar.AlphaNum4.code === selectedAsset?.code;
        } else if (vault.id.currencies.wrapped.Stellar.AlphaNum12) {
          return vault.id.currencies.wrapped.Stellar.AlphaNum12.code === selectedAsset?.code;
        }
      });
      setSelectedVault(vault?.id);
    }
  }, [selectedAsset, vaults]);

  return {
    selectedVault,
    vaults,
    wrappedAssets,
    selectedAsset,
    setSelectedAsset,
    setSelectedVault,
  };
}

export default useSpacewalkBridge;
