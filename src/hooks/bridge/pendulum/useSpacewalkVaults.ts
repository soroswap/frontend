
import { AccountId32 } from '@polkadot/types/interfaces';
import { useInkathon } from '@scio-labs/use-inkathon';
import { convertRawHexKeyToPublicKey } from 'helpers/bridge/pendulum/stellar';
import { useEffect, useMemo, useState } from 'react';
import { Asset } from 'stellar-sdk';

interface StellarAssetType {
  AlphaNum4: {
    code: string,
    issuer: string
  }
}

export interface VaultId {
  accountId: AccountId32,
  currencies: {
    collateral: {
      XCM: string
    },
    wrapped: {
      Stellar: StellarAssetType | string
    }
  }
}

interface VaultStatus {
  Active: boolean;
}

export interface SpacewalkVault {
  id: VaultId;
  status: VaultStatus;
  bannedUntil: string;
  secureCollateralThreshold: string,
  toBeIssuedTokens: string,
  issuedTokens: string,
  toBeRedeemedTokens: string,
  toBeReplacedTokens: string,
  replaceCollateral: string,
  activeReplaceCollateral: string,
  liquidatedCollateral: string
}

export interface ExtendedSpacewalkVault extends SpacewalkVault {
  asset?: Asset;
  issuableTokens?: string;
  redeemableTokens?: string;
}

export function useSpacewalkVaults() {
  const { api } = useInkathon();

  const [vaults, setVaults] = useState<SpacewalkVault[]>([]);

  useEffect(() => {
    if (!api) {
      return;
    }
    
    // Check that the pallet is available
    if (!api.query.vaultRegistry || !api.tx.vaultRegistry) {
      return;
    }

    let unsubscribe: () => void;

    api.query.vaultRegistry.vaults.entries().then((entries) => {

      const typedEntries: SpacewalkVault[] = entries.map(([, value]): SpacewalkVault => {
        const humanReadableValue = value.toHuman();
        
        //this is a workaround for the type 
        return humanReadableValue as unknown as SpacewalkVault;
      });

      setVaults(typedEntries);
    });

    return () => unsubscribe && unsubscribe();
  }, [api]);

  const memo = useMemo(() => {
    return {
      getVaults() {
        return vaults;
      },
      async getVaultStellarPublicKey(accountId: AccountId32) {
        if (!api) {
          return undefined;
        }
        const publicKeyBinary = await api.query.vaultRegistry?.vaultStellarPublicKey(accountId);

        if (!publicKeyBinary) {
          return undefined;
        } else {
          return convertRawHexKeyToPublicKey(publicKeyBinary.toHex());
        }
      },
    };
  }, [api, vaults]);

  return memo;
}