export function isAddress(value: any): string | false {
  try {
    let result;

    if (value.match(/^[A-Z0-9]{56}$/)) {
      result = value;
    } else {
      result = false;
    }

    return result;
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
