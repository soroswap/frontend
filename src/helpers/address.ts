export function isAddress(value: string): string | false {
  try {
    return value.match(/^[A-Z0-9]{56}$/) ? value : false;
  } catch {
    return false;
  }
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  const parsed = isAddress(address);
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }
  return `${parsed.substring(0, chars)}...${parsed.substring(56 - chars)}`;
}

export function isValidSymbol(code: string): boolean {
  return /^[A-Za-z0-9]{2,}$/.test(code);
}

export function isClassicStellarAsset(value: string): boolean {
  if (!value) return false;
  const parts = value.split(':');
  if (parts.length !== 2) {
    return false;
  }

  const [assetCode, issuer] = parts;
  return isValidSymbol(assetCode) && isAddress(issuer) !== false;
}
