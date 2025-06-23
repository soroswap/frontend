export function isAddress(value: string): string | false {
  if (value?.length === 56) {
    try {
      return value?.match(/^[A-Z0-9]{56}$/) ? value : false;
    } catch {
      return false;
    }
  } else {
    return false;
  }
}

export function isPolkadotAdress(value: string): string | false {
  if (value?.length === 48) {
    try {
      return value?.match(/^[A-Za-z0-9]{48}$/) ? value : false;
    } catch {
      return false;
    }
  } else {
    return false;
  }
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  let parsed = isAddress(address);
  if (!parsed) {
    const isPolkadot = isPolkadotAdress(address);
    if (!isPolkadot) {
      throw Error(`Invalid 'address' parameter '${address}'.`);
    } else {
      parsed = isPolkadot;
      return `${parsed.substring(0, chars)}...${parsed.substring(48 - chars)}`;
    }
  }
  return `${parsed.substring(0, chars)}...${parsed.substring(56 - chars)}`;  
}

export function isValidSymbol(code: string): boolean {
  return /^[A-Za-z0-9]{2,}$/.test(code);
}

export function isClassicStellarAssetFormat(value: string): boolean {
  if (!value) return false;
  // Support both : and - separators
  const parts = value.split(/[:-]/);
  if (parts.length !== 2) {
    return false;
  }

  const [assetCode, issuer] = parts;
  const toReturn = isValidSymbol(assetCode) && isAddress(issuer) !== false
  return toReturn;
}

//Receives the name of the token must be SYMBOL:ISSUER or SYMBOL-ISSUER
export function getClassicStellarAsset(value: string) {
  if (!value) return false;
  // Support both : and - separators
  const parts = value.split(/[:-]/);
  if (parts.length !== 2) {
    return false;
  }

  const [assetCode, issuer] = parts;

  if (!isAddress(issuer)) return false;

  return {
    assetCode,
    issuer,
    asset: `${assetCode}:${issuer}`, // Always normalize to : format internally
  };
}

// Add helper function to normalize format
export function normalizeAssetFormat(value: string): string {
  if (!value) return value;
  // Convert CODE-ISSUER to CODE:ISSUER
  return value.replace(/-([A-Z0-9]{56})/, ':$1');
}