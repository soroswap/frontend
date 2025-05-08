import { Address, nativeToScVal, xdr } from '@stellar/stellar-sdk';

export interface DexDistribution {
  protocol_id: string;
  path: string[];
  parts: number;
  is_exact_in: boolean;
  poolHashes: string[] | undefined;
}

// #[contracttype]
// #[derive(Clone, Debug, Eq, PartialEq)]
// pub struct DexDistribution {
//     pub protocol_id: String,
//     pub path: Vec<Address>,
//     pub parts: u32,
//     pub bytes: Option<Vec<BytesN<32>>>

// }

/**
 * Converts an optional array of Base64-encoded strings to ScVal: Option<Vec<BytesN<32>>>
 *
 * @param poolHashes Optional array of Base64-encoded strings representing 32-byte hashes
 * @returns ScVal representing Option<Vec<BytesN<32>>>
 * @throws Error if any Base64 string is invalid or does not decode to 32 bytes
 */
export function poolHashesToScVal(poolHashes?: string[]): xdr.ScVal {
  // Handle undefined or empty array: return Option::None
  if (!poolHashes || poolHashes.length === 0) {
    console.log("🚀 ~ poolHashesToScVal ~ poolHashes:", poolHashes)
    return  nativeToScVal(null);
    
  }

  // Convert each Base64 string to ScVal (BytesN<32>)
  const scVec: xdr.ScVal[] = poolHashes.map((base64Str) => {
    // Basic validation for non-empty string
    if (!base64Str || typeof base64Str !== 'string') {
      throw new Error(`Invalid Base64 string: ${base64Str}`);
    }

    try {
      // Decode Base64 string to Buffer
      const buf = Buffer.from(base64Str, 'base64');

      // Validate buffer length (must be 32 bytes for BytesN<32>)
      if (buf.length !== 32) {
        throw new Error(
          `Expected 32 bytes, got ${buf.length} bytes for Base64 string: ${base64Str}`
        );
      }

      // Create ScVal for BytesN<32>
      return xdr.ScVal.scvBytes(buf);
    } catch (e) {
      throw new Error(`Invalid Base64 string: ${base64Str}`);
    }
  });

  // Wrap the vector in an Option::Some
  return xdr.ScVal.scvVec(scVec);
}

export const dexDistributionParser = (dexDistributionRaw: DexDistribution[]): xdr.ScVal => {
  console.log("🚀 ~ dexDistributionRaw:", dexDistributionRaw)
  const dexDistributionScVal = dexDistributionRaw.map((distribution) => {
    return xdr.ScVal.scvMap([
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol('bytes'),
        val: poolHashesToScVal(distribution.poolHashes),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol('parts'),
        val: nativeToScVal(distribution.parts, { type: 'u32' }),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol('path'),
        val: nativeToScVal(distribution.path.map((pathAddress) => new Address(pathAddress))),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol('protocol_id'),
        val: xdr.ScVal.scvString(distribution.protocol_id),
      }),
    ]);
  });
  console.log("🚀 ~ dexDistributionScVal ~ dexDistributionScVal:", dexDistributionScVal)

  return xdr.ScVal.scvVec(dexDistributionScVal);
};

export const hasDistribution = (trade: any): trade is { distribution: DexDistribution[] } =>
  trade && 'distribution' in trade;
