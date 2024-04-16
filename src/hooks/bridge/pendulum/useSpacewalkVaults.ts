import { AccountId32 } from '@polkadot/types/interfaces';
import { useInkathon } from '@scio-labs/use-inkathon';
import { convertRawHexKeyToPublicKey } from 'helpers/bridge/pendulum/stellar';
import { useCallback, useEffect, useState } from 'react';

interface AlphaNum4 {
  code: string;
  issuer: string;
}

interface AlphaNum12 {
  code: string;
  issuer: string;
}

export type SpacewalkStellarAssetType = {
  AlphaNum4: AlphaNum4;
  AlphaNum12?: never;
} | {
  AlphaNum4?: never;
  AlphaNum12: AlphaNum12;
};

export interface VaultId {
  accountId: AccountId32,
  currencies: {
    collateral: {
      XCM: string
    },
    wrapped: {
      Stellar: SpacewalkStellarAssetType | string
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
  issuableTokens?: string;
  redeemableTokens?: string;
}

export function useSpacewalkVaults() {
  const { api } = useInkathon();
  const [vaults, setVaults] = useState<SpacewalkVault[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!api) {
      setLoading(false);
      return;
    }
    
    // Check if the vaultRegistry API is available
    if (!api.query.vaultRegistry || !api.tx.vaultRegistry) {
      setLoading(false);
      return;
    }

    api.query.vaultRegistry.vaults.entries().then((entries) => {
      const typedEntries = entries.map(([, value]) => {
        const newValue = value.toHuman() as unknown as SpacewalkVault

        if (typeof newValue.id.currencies.wrapped.Stellar !== "string" && newValue.id.currencies.wrapped.Stellar.AlphaNum4?.code.includes("0x")) {
          switch (newValue.id.currencies.wrapped.Stellar.AlphaNum4.code) {
            case "0x42524c00": newValue.id.currencies.wrapped.Stellar.AlphaNum4.code = "BRL"; break;
            case "0x545a5300": newValue.id.currencies.wrapped.Stellar.AlphaNum4.code = "TZS"; break;
          }
        } else if (typeof newValue.id.currencies.wrapped.Stellar !== "string" && newValue.id.currencies.wrapped.Stellar.AlphaNum12?.code.includes("0x")) {
          switch (newValue.id.currencies.wrapped.Stellar.AlphaNum12.code) {
            case "0x42524c00": newValue.id.currencies.wrapped.Stellar.AlphaNum12.code = "BRL"; break;
            case "0x545a5300": newValue.id.currencies.wrapped.Stellar.AlphaNum12.code = "TZS"; break;
          }
        }
        return newValue
      });
      setVaults(typedEntries);
      setLoading(false);
    });

    return () => {};
  }, [api]);

  const getVaults = useCallback(() => {
    return new Promise<SpacewalkVault[]>((resolve) => {
      if (!loading) {
        resolve(vaults);
      } else {
        const checkData = setInterval(() => {
          if (!loading) {
            clearInterval(checkData);
            resolve(vaults);
          }
        }, 100);
      }
    });
  }, [vaults, loading]);

  const getVaultStellarPublicKey = useCallback(async (accountId: AccountId32) => {
    if (!api) {
      return undefined;
    }
    const publicKeyBinary = await api.query.vaultRegistry?.vaultStellarPublicKey(accountId);
    return publicKeyBinary ? convertRawHexKeyToPublicKey(publicKeyBinary.toHex()) : undefined;
  }, [api]);

  return {
    getVaults,
    getVaultStellarPublicKey
  };
}
