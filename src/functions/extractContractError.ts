export function extractContractError(errorMessage: unknown): Error {
  const regex = /Error\(Contract, #(\d+)\)/;
  const match = (errorMessage as string).match(regex);

  if (match && match[1]) {
    if (match[1] === '1') {
      return new Error(`Spread exceeds limit on Phoenix protocol`);
    }
    return new Error(`Contract Error #${match[1]}`);
  }

  return new Error('Unknown contract error');
}
