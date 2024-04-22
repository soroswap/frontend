export function isAddress(value: string): string | false {
  if (value.length === 56) {
    try {
      return value.match(/^[A-Z0-9]{56}$/) ? value : false;
    } catch {
      return false;
    }
  } else if (value.length == 48) {
    try {
      return value.match(/^[A-Za-z0-9]{48}$/) ? value : false;
    } catch {
      return false;
    }
  } else {
    return false;
  }
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  const parsed = isAddress(address);
  if (!parsed) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }
  switch (parsed.length) {
    case 48:
      return `${parsed.substring(0, chars)}...${parsed.substring(48 - chars)}`;
    case 56:
      return `${parsed.substring(0, chars)}...${parsed.substring(56 - chars)}`;
  }
  return '';
  
}

export function isValidSymbol(code: string): boolean {
  return /^[A-Za-z0-9]{2,}$/.test(code);
}

export function isClassicStellarAssetFormat(value: string): boolean {
  if (!value) return false;
  const parts = value.split(':');
  if (parts.length !== 2) {
    return false;
  }

  const [assetCode, issuer] = parts;
  const toReturn = isValidSymbol(assetCode) && isAddress(issuer) !== false
  return toReturn;
}

//Receives the name of the token must be SYMBOL:ISSUER
export function getClassicStellarAsset(value: string) {
  if (!value) return false;
  const parts = value.split(':');
  if (parts.length !== 2) {
    return false;
  }

  const [assetCode, issuer] = parts;

  if (!isAddress(issuer)) return false;

  return {
    assetCode,
    issuer,
    asset: `${assetCode}:${issuer}`,
  };
}
