import { ApiPromise } from '@polkadot/api';
import type { Enum, Struct, u8 } from '@polkadot/types-codec';
import { U8aFixed } from '@polkadot/types-codec';
import { TenantName } from 'BridgeStateProvider/models';
import bs58 from 'bs58';
import { SpacewalkStellarAssetType } from 'hooks/bridge/pendulum/useSpacewalkVaults';
import { DateTime } from 'luxon';
import { Asset, Keypair } from 'stellar-sdk';
import { convertRawHexKeyToPublicKey } from './stellar';

interface SpacewalkPrimitivesCurrencyId extends Enum {
  readonly isNative: boolean;
  readonly isXcm: boolean;
  readonly asXcm: u8;
  readonly isStellar: boolean;
  readonly asStellar: SpacewalkPrimitivesAsset;
  readonly type: 'Native' | 'Xcm' | 'Stellar';
}
interface SpacewalkPrimitivesAsset extends Enum {
  readonly isStellarNative: boolean;
  readonly isAlphaNum4: boolean;
  readonly asAlphaNum4: {
      readonly code: U8aFixed;
      readonly issuer: U8aFixed;
  } & Struct;
  readonly isAlphaNum12: boolean;
  readonly asAlphaNum12: {
      readonly code: U8aFixed;
      readonly issuer: U8aFixed;
  } & Struct;
  readonly type: 'StellarNative' | 'AlphaNum4' | 'AlphaNum12';
}
export const SpacewalkConstants = {
  WrappedCurrencySuffix: '.s',
};

// Convert a hex string to an ASCII string
function hex_to_ascii(hexString: string, leading0x = true) {
  const hex = hexString.toString();
  let str = '';
  for (let n = leading0x ? 2 : 0; n < hex.length; n += 2) {
    str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
  }
  return str;
}

export function convertCurrencyToStellarAsset(currency: SpacewalkStellarAssetType | string): Asset | null {
  try {
    if (typeof currency == "string") {
      return Asset.native();
    } else if (currency.AlphaNum4) {
      const issuer = convertRawHexKeyToPublicKey(currency.AlphaNum4.issuer);
      return new Asset(currency.AlphaNum4.code, issuer.publicKey());
    } else if (currency.AlphaNum12) {
      const issuer = convertRawHexKeyToPublicKey(currency.AlphaNum12.issuer);
      return new Asset(currency.AlphaNum12.code, issuer.publicKey());
    } else {
      return null;
    }
  } catch (error) {
    return null
  }
}

export function addSuffix(s: string) {
  return s + SpacewalkConstants.WrappedCurrencySuffix;
}

// export function currencyToStellarAssetCode(currency: SpacewalkPrimitivesCurrencyId) {
//   return convertCurrencyToStellarAsset(currency)?.getCode() + SpacewalkConstants.WrappedCurrencySuffix;
// }

export function convertStellarAssetToCurrency(asset: Asset, api: ApiPromise): SpacewalkPrimitivesCurrencyId {
  if (asset.isNative()) {
    return api.createType('SpacewalkPrimitivesCurrencyId', 'StellarNative');
  } else {
    const pair = Keypair.fromPublicKey(asset.getIssuer());
    // We need the raw public key, not the base58 encoded version
    const issuerRawPublicKey = pair.rawPublicKey();
    const issuer = api.createType('Raw', issuerRawPublicKey, 32);

    if (asset.getCode().length <= 4) {
      const code = api.createType('Raw', asset.getCode(), 4);
      return api.createType('SpacewalkPrimitivesCurrencyId', {
        AlphaNum4: {
          code,
          issuer,
        },
      });
    } else {
      const code = api.createType('Raw', asset.getCode(), 12);
      return api.createType('SpacewalkPrimitivesCurrencyId', {
        AlphaNum12: {
          code,
          issuer,
        },
      });
    }
  }
}

const XCM_ASSETS: { [network: string]: { [xcmIndex: string]: string } } = {
  pendulum: {
    '0': 'DOT',
    '1': 'USDT',
  },
  amplitude: {
    '0': 'KSM',
    '1': 'USDT',
  },
};

// Convert a currency to a string
// The supplied network is used to choose the list of XCM assets per network.
export function currencyToString(currency: SpacewalkPrimitivesCurrencyId, tenant: TenantName = TenantName.Pendulum) {
  try {
    if (currency.isStellar) {
      const stellarAsset = currency.asStellar;
      if (stellarAsset.isStellarNative) {
        return 'XLM';
      } else if (stellarAsset.isAlphaNum4) {
        try {
          const code = tryConvertCodeToAscii(stellarAsset.asAlphaNum4.code);
          const issuer = convertRawHexKeyToPublicKey(stellarAsset.asAlphaNum4.issuer.toHex());
          return `${code}:${issuer.publicKey()}`;
        } catch {
          return 'Unknown';
        }
      } else if (stellarAsset.isAlphaNum12) {
        try {
          const code = tryConvertCodeToAscii(stellarAsset.asAlphaNum12.code);
          const issuer = convertRawHexKeyToPublicKey(stellarAsset.asAlphaNum12.issuer.toHex());
          return `${code}:${issuer.publicKey()}`;
        } catch {
          return 'Unknown';
        }
      } else {
        return 'Unknown';
      }
    } else if (currency.isXcm) {
      const network = tenant === TenantName.Pendulum ? 'pendulum' : 'amplitude';
      const assetsForNetwork = XCM_ASSETS[network];

      const xcmIndex = currency.asXcm.toString();
      if (xcmIndex in assetsForNetwork) {
        return assetsForNetwork[xcmIndex];
      } else {
        return `XCM:${xcmIndex}`;
      }
    } else {
      return 'Unknown';
    }
  } catch (e) {
    console.error('Error converting currency to stellar asset', e);
    return null;
  }
}

export function tryConvertCodeToAscii(code: U8aFixed) {
  const ascii = hex_to_ascii(code.toHex());
  console.log('🚀 « ascii:', ascii);
  if (ascii !== ascii.trim()) {
    throw Error('Asset code contains invalid space characters');
  }
  return ascii.replace('\0', '');
}

// Calculate the remaining duration for a request
// Params:
//   currentActiveBlock: The block number of the current active block
//   activeBlockOpenTime: The block number of the active block when the request was opened
//   period: The period of the request
//   blockTimeSec: The average block time in seconds
// Returns:
//   The estimated end time of the request
export function calculateDeadline(
  currentActiveBlock: number,
  activeBlockOpenTime: number,
  period: number,
  blockTimeSec = 12,
) {
  const deadlineBlock = activeBlockOpenTime + period;
  const blocksRemaining = deadlineBlock - currentActiveBlock;
  const remainingDurationSecs = blocksRemaining * blockTimeSec;

  const now = DateTime.now();
  const end = now.plus({ seconds: remainingDurationSecs });
  return end;
}

export function estimateRequestCreationTime(
  currentActiveBlock: number,
  activeBlockOpenTime: number,
  blockTimeSec = 12,
) {
  const activeBlocksPassed = currentActiveBlock - activeBlockOpenTime;
  const secondsAgo = activeBlocksPassed * blockTimeSec;
  const now = DateTime.now();
  return now.minus({ seconds: secondsAgo });
}

export function assetDisplayName(asset?: Asset, assetPrefix?: string, assetSuffix?: string): string {
  return asset ? `${assetPrefix || ''}${asset.getCode()}${assetSuffix || ''}` : '';
}

interface FilteredAsset {
  [key: string]: Asset[];
}

const assetsToFilterByTenant: FilteredAsset = {
  [TenantName.Foucoco]: [new Asset('USDC', 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN')],
};

export function shouldFilterOut(tenantName: TenantName, asset: Asset) {
  return assetsToFilterByTenant[tenantName]?.find(({ code, issuer }) => {
    return asset.code === code && asset.issuer == issuer;
  });
}

// This function is used to derive a shorter identifier that can be used as a TEXT MEMO by a user when creating a Stellar transaction
// to fulfill an issue request. This is only used for _issue_ requests, not for redeem or replace requests.
export const deriveShortenedRequestId = (requestIdHex: string) => {
  // Remove the 0x prefix
  requestIdHex = requestIdHex.slice(2);
  // Convert the hex string to a buffer
  const requestId = Uint8Array.from(Buffer.from(requestIdHex, "hex"));

  // This derivation matches the one used in the Spacewalk pallets
  return bs58.encode(requestId).slice(0, 28);
}
