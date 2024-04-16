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
import { xlmVaultId } from "helpers/bridge/configs";
import { convertRawHexKeyToPublicKey } from "helpers/bridge/pendulum/stellar";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Asset } from "stellar-sdk";
import { ExtendedSpacewalkVault, VaultId, useSpacewalkVaults } from "./useSpacewalkVaults";


export interface SpacewalkBridge {
  selectedVault?: VaultId;
  // manualVaultSelection: boolean;
  vaults?: ExtendedSpacewalkVault[];
  // vaultsForCurrency?: ExtendedRegistryVault[];
  // wrappedAssets?: Asset[];
  // selectedAsset?: Asset;
  // setSelectedAsset: Dispatch<SetStateAction<Asset | undefined>>;
  setSelectedVault: Dispatch<SetStateAction<VaultId | undefined>>;
  // setManualVaultSelection: Dispatch<SetStateAction<boolean>>;
}

function useSpacewalkBridge(): SpacewalkBridge {
  const { serverHorizon } = useSorobanReact()
  const [vaults, setExtendedVaults] = useState<ExtendedSpacewalkVault[]>([]);
  // const [manualVaultSelection, setManualVaultSelection] = useState(false);
  const { getVaults, getVaultStellarPublicKey } = useSpacewalkVaults();
  const [selectedVault, setSelectedVault] = useState<VaultId | undefined>(xlmVaultId);
  // const { selectedAsset, setSelectedAsset } = (useContext(BridgeContext) || {}) as any;

  useEffect(() => {
    const combinedVaults: ExtendedSpacewalkVault[] = [];
    Promise.all(getVaults())
      .then((data) => {
        data.forEach(async (vault) => {
          const extended: ExtendedSpacewalkVault = vault
          
          // Getting max redeemable amounts from stellar to pendulum //
          const stellarAccount = await getVaultStellarPublicKey(vault.id.accountId);
          if (stellarAccount) {
            const accountLoaded = await serverHorizon?.loadAccount(stellarAccount.publicKey());
            let vaultAssetBalance;

            if (typeof vault.id.currencies.wrapped.Stellar === 'string') {
              // Case when Stellar is native asset
              vaultAssetBalance = accountLoaded?.balances.find((bal) =>
                bal.asset_type === 'native'
              )?.balance;
              const vaultAsset = Asset.native()
              extended.asset = vaultAsset
            } else if (vault.id.currencies.wrapped.Stellar?.AlphaNum4) {
              // Case when Stellar is an object with AlphaNum4 details
              let { code } = vault.id.currencies.wrapped.Stellar.AlphaNum4;
              switch (code) {
                case "0x42524c00":
                  code = "BRL"
                  break;
              
                case "0x545a5300":
                  code = "TZS"
                  break;
              }
              vaultAssetBalance = accountLoaded?.balances.find((bal) => {
                return 'asset_code' in bal && bal.asset_code === code
              }
              )?.balance;
              const vaultAsset = new Asset(code, convertRawHexKeyToPublicKey(vault.id.currencies.wrapped.Stellar.AlphaNum4.issuer).publicKey())
              extended.asset = vaultAsset
            }
            
            extended.redeemableTokens = vaultAssetBalance
          }
          // End of getting redeemable amount //
          //TODO: Should get issuable amount by getting the balance on the pendulum side?
          combinedVaults.push(extended) 
        })
        setExtendedVaults(combinedVaults);
      })
      .catch(() => {
        console.log("BRIDGE CONNECTION ERROR")
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
    selectedVault,
    // manualVaultSelection,
    vaults,
    // vaultsForCurrency,
    // wrappedAssets,
    setSelectedVault,
  };
}

export default useSpacewalkBridge;