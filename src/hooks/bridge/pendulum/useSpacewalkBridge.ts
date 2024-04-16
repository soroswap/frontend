// import _ from 'lodash';
// import { useContext, useEffect, useMemo, useState } from 'preact/compat';
// import { StateUpdater } from 'preact/hooks';
// import { useGlobalState } from '../../GlobalStateProvider';
// import { convertCurrencyToStellarAsset, shouldFilterOut } from '../../helpers/spacewalk';
// import { stringifyStellarAsset } from '../../helpers/stellar';
// import { BridgeContext } from '../../pages/bridge';
// import { ExtendedRegistryVault, useVaultRegistryPallet } from './useVaultRegistryPallet';
// import { ToastMessage, showToast } from '../../shared/showToast';
// import { Balance } from '@polkadot/types/interfaces';

import { useSorobanReact } from "@soroban-react/core";
import { useEffect } from "react";
import { useSpacewalkVaults } from "./useSpacewalkVaults";


export interface SpacewalkBridge {
  // selectedVault?: ExtendedRegistryVault;
  // manualVaultSelection: boolean;
  // vaults?: ExtendedRegistryVault[];
  // vaultsForCurrency?: ExtendedRegistryVault[];
  // wrappedAssets?: Asset[];
  // selectedAsset?: Asset;
  // setSelectedAsset: Dispatch<SetStateAction<Asset | undefined>>;
  // setSelectedVault: Dispatch<SetStateAction<ExtendedRegistryVault | undefined>>;
  // setManualVaultSelection: Dispatch<SetStateAction<boolean>>;
}

function useSpacewalkBridge(): SpacewalkBridge {
  const { serverHorizon } = useSorobanReact()
  // const [vaults, setExtendedVaults] = useState<ExtendedRegistryVault[]>();
  // const [manualVaultSelection, setManualVaultSelection] = useState(false);
  const { getVaults, getVaultStellarPublicKey } = useSpacewalkVaults();
  // const [selectedVault, setSelectedVault] = useState<ExtendedRegistryVault>();
  // const { selectedAsset, setSelectedAsset } = (useContext(BridgeContext) || {}) as any;

  useEffect(() => {
    const combinedVaults: any[] = [];
    Promise.all(getVaults())
      .then((data) => {
        data.forEach(async (vault) => {
          console.log('🚀 « vault:', vault);
          const stellarAccount = await getVaultStellarPublicKey(vault.id.accountId);
          if (stellarAccount) {
            const accountloaded = await serverHorizon?.loadAccount(stellarAccount.publicKey())
            console.log('🚀 « account balances:', accountloaded?.balances);
          }
        })
        // getVaults().forEach((vaultFromRegistry: any) => {
        //   const vaultWithIssuable = data[0]?.find(([id, _]) => id.eq(vaultFromRegistry.id));
        //   const vaultWithRedeemable = data[1]?.find(([id, _]) => id.eq(vaultFromRegistry.id));
        //   const extended: ExtendedRegistryVault = vaultFromRegistry;
        //   extended.issuableTokens = vaultWithIssuable ? (vaultWithIssuable[1] as unknown as Balance) : undefined;
        //   extended.redeemableTokens = vaultWithRedeemable ? (vaultWithRedeemable[1] as unknown as Balance) : undefined;
        //   combinedVaults.push(extended);
        // });
        // setExtendedVaults(combinedVaults);
      })
      .catch(() => {
        console.log("BRIDGE CONNECTION ERROR")
        // showToast(ToastMessage.BRIDGE_CONNECTION_ERROR);
      });
  }, [getVaultStellarPublicKey, getVaults, serverHorizon]);

  // const wrappedAssets = useMemo(() => {
  //   if (!vaults) return;
  //   const assets = vaults
  //     .map((vault) => {
  //       const currency = vault.id.currencies.wrapped;
  //       return convertCurrencyToStellarAsset(currency);
  //     })
  //     .filter((asset): asset is Asset => {
  //       return asset != null && !shouldFilterOut(tenantName, asset);
  //     });
  //   // Deduplicate assets
  //   return _.uniqBy(assets, (asset: Asset) => stringifyStellarAsset(asset));
  // }, [tenantName, vaults]);

  // const vaultsForCurrency = useMemo(() => {
  //   if (!vaults) return;

  //   return vaults.filter((vault) => {
  //     if (!selectedAsset) {
  //       return false;
  //     }

  //     const vaultCurrencyAsAsset = convertCurrencyToStellarAsset(vault.id.currencies.wrapped);
  //     return vaultCurrencyAsAsset && vaultCurrencyAsAsset.equals(selectedAsset);
  //   });
  // }, [selectedAsset, vaults]);

  // useEffect(() => {
  //   if (vaultsForCurrency && wrappedAssets) {
  //     if (!manualVaultSelection) {
  //       // TODO build a better algorithm for automatically selecting a vault
  //       if (vaultsForCurrency.length > 0) {
  //         setSelectedVault(vaultsForCurrency[0]);
  //       }
  //       if (!selectedAsset && wrappedAssets.length > 0) {
  //         setSelectedAsset(wrappedAssets[0]);
  //       }
  //     } else {
  //       // If the user manually selected a vault, but it's not available anymore, we reset the selection
  //       if (selectedVault && !vaultsForCurrency.includes(selectedVault) && vaultsForCurrency.length > 0) {
  //         setSelectedVault(vaultsForCurrency[0]);
  //       }
  //     }
  //   }
  // }, [manualVaultSelection, selectedAsset, selectedVault, setSelectedAsset, vaultsForCurrency, wrappedAssets]);

  return {
    // selectedVault,
    // manualVaultSelection,
    // vaults,
    // vaultsForCurrency,
    // wrappedAssets,
    // selectedAsset,
    // setSelectedAsset,
    // setSelectedVault,
    // setManualVaultSelection,
  };
}

export default useSpacewalkBridge;