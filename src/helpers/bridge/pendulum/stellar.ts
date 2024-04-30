import BigNumber from 'bignumber.js';
import { Buffer } from 'buffer';
import { Asset, Keypair, StrKey } from 'stellar-sdk';

// Applying this assignment to the global object here - because Buffer is used only in this file. If Buffer is to be used in several places - it should be added to the global object in the entry file of the application.
// Ref: https://github.com/pendulum-chain/portal/issues/344
if (typeof window !== 'undefined') {
  window.Buffer = Buffer;
}

export const StellarPublicKeyPattern = /^G[A-Z0-9]{55}$/;

export const isPublicKey = (str: string) => Boolean(str.match(StellarPublicKeyPattern));
export const isMuxedAddress = (str: string) => Boolean(str.match(/^M[A-Z0-9]{68}$/));
export const isStellarAddress = (str: string) =>
  // eslint-disable-next-line no-useless-escape
  Boolean(str.match(/^[^\*> \t\n\r]+\*[^\*\.> \t\n\r]+\.[^\*> \t\n\r]+$/));

// A Stellar amount should not have more than 7 decimal places
export function isCompatibleStellarAmount(amount: string): boolean {
  return !(
    (amount.split('.')[1] && amount.split('.')[1].length > 7) ||
    (amount.split(',')[1] && amount.split(',')[1].length > 7)
  );
}

export function convertRawHexKeyToPublicKey(rawPublicKeyHex: string): Keypair {
  const ed25519PublicKey = StrKey.encodeEd25519PublicKey(
    Buffer.from(rawPublicKeyHex.slice(2), 'hex'),
  );
  return Keypair.fromPublicKey(ed25519PublicKey);
}

export function convertPublicKeyToRaw(pubKey: string): string {
  const raw = StrKey.decodeEd25519PublicKey(pubKey);
  return `0x${raw.toString('hex')}`;
}

export function stringifyStellarAsset(asset: Asset): string {
  return asset.isNative() ? 'XLM' : `${asset.getCode()}:${asset.getIssuer()}`;
}

export const decimalToStellarNative = (value: string): string => {
  let bigIntValue;
  try {
    bigIntValue = new BigNumber(value);
  } catch (error) {
    bigIntValue = new BigNumber(0);
  }
  const multiplier = new BigNumber(10).pow(12);
  const result = bigIntValue.times(multiplier);
  console.log(result.toFixed())
  return result.toFixed();
};
