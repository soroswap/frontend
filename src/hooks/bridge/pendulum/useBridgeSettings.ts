 import _ from 'lodash';
 import { useContext, useEffect, useMemo, useState } from 'react'
 import { AppContext, SnackbarIconType } from 'contexts';
 //import { StateUpdater } from 'preact/hooks';
 import { Asset } from 'stellar-sdk';
 import { useBridgeState } from 'BridgeStateProvider/index';
 import { convertCurrencyToStellarAsset, shouldFilterOut } from 'helpers/bridge/pendulum/spacewalk';
 import { stringifyStellarAsset } from 'helpers/bridge/pendulum/stellar';
 import { BridgeContext } from '../../pages/bridge';
 import { ExtendedRegistryVault, useVaultRegistryPallet } from './useVaultRegistryPallet';
 import { sendNotification } from 'functions/sendNotification';
/* 
 export interface BridgeSettings {
   selectedVault?: ExtendedRegistryVault;
   manualVaultSelection: boolean;
   vaults?: ExtendedRegistryVault[];
   vaultsForCurrency?: ExtendedRegistryVault[];
   wrappedAssets?: Asset[];
   selectedAsset?: Asset;
   setSelectedAsset: StateUpdater<Asset | undefined>;
   setSelectedVault: StateUpdater<ExtendedRegistryVault | undefined>;
   setManualVaultSelection: StateUpdater<boolean>;
 } */
 //function useBridgeSettings(): BridgeSettings {
function useBridgeSettings() {
  const { SnackbarContext } = useContext(AppContext);
  const [vaults, setExtendedVaults] = useState<ExtendedRegistryVault[]>();
  const [manualVaultSelection, setManualVaultSelection] = useState(false);
  const { getVaults, getVaultsWithIssuableTokens, getVaultsWithRedeemableTokens } = useVaultRegistryPallet();
  const [selectedVault, setSelectedVault] = useState<ExtendedRegistryVault>();
  const { selectedAsset, setSelectedAsset } = (useContext(BridgeContext) || {}) as any;
  const { tenantName } = useBridgeState();
  useEffect(() => {
    const combinedVaults: ExtendedRegistryVault[] = [];
    Promise.all([getVaultsWithIssuableTokens(), getVaultsWithRedeemableTokens()])
      .then((data) => {
        getVaults().forEach((vaultFromRegistry: any) => {
          console.log(data[0])
          console.log(data[1])
          const vaultWithIssuable = data[0]?.find(([id, _]) => id.eq(vaultFromRegistry.id));
          const vaultWithRedeemable = data[1]?.find(([id, _]) => id.eq(vaultFromRegistry.id));
          const extended: ExtendedRegistryVault = vaultFromRegistry;
          extended.issuableTokens = vaultWithIssuable ? vaultWithIssuable[1] : undefined;
          extended.redeemableTokens = vaultWithRedeemable ? vaultWithRedeemable[1] : undefined;
          combinedVaults.push(extended);
        });
        setExtendedVaults(combinedVaults);
      })
      .catch((err) => {
        sendNotification(
        `${err}, Can't connect wallet`,
        'Error',
        SnackbarIconType.ERROR,
        SnackbarContext,
      );
      });
  }, [getVaults, setExtendedVaults, getVaultsWithIssuableTokens, getVaultsWithRedeemableTokens]);
  const wrappedAssets = useMemo(() => {
    if (!vaults) return;
    const assets = vaults
      .map((vault) => {
        const currency = vault.id.currencies.wrapped;
        return convertCurrencyToStellarAsset(currency);
      })
      .filter((asset): asset is Asset => {
        return asset != null && !shouldFilterOut(tenantName, asset);
      });
    // Deduplicate assets
    return _.uniqBy(assets, (asset: Asset) => stringifyStellarAsset(asset));
  }, [vaults]);
  const vaultsForCurrency = useMemo(() => {
    if (!vaults) return;
    return vaults.filter((vault) => {
      if (!selectedAsset) {
        return false;
      }
      const vaultCurrencyAsAsset = convertCurrencyToStellarAsset(vault.id.currencies.wrapped);
      return vaultCurrencyAsAsset && vaultCurrencyAsAsset.equals(selectedAsset);
    });
  }, [selectedAsset, vaults]);
  useEffect(() => {
    if (vaultsForCurrency && wrappedAssets) {
      if (!manualVaultSelection) {
        // TODO build a better algorithm for automatically selecting a vault
        if (vaultsForCurrency.length > 0) {
          setSelectedVault(vaultsForCurrency[0]);
        }
        if (!selectedAsset && wrappedAssets.length > 0) {
          setSelectedAsset(wrappedAssets[0]);
        }
      } else {
        // If the user manually selected a vault, but it's not available anymore, we reset the selection
        if (selectedVault && !vaultsForCurrency.includes(selectedVault) && vaultsForCurrency.length > 0) {
          setSelectedVault(vaultsForCurrency[0]);
        }
      }
    }
  }, [manualVaultSelection, selectedAsset, selectedVault, setSelectedAsset, vaultsForCurrency, wrappedAssets]);
  return {
    selectedVault,
    manualVaultSelection,
    vaults,
    vaultsForCurrency,
    wrappedAssets,
    selectedAsset,
    setSelectedAsset,
    setSelectedVault,
    setManualVaultSelection,
  };
}
export default useBridgeSettings;