import { Address, nativeToScVal, xdr } from "@stellar/stellar-sdk";

export interface DexDistribution {
  protocol_id: string;
  path: string[],
  parts: number,
  is_exact_in: boolean,
}

export const dexDistributionParser = (dexDistributionRaw: DexDistribution[]) : xdr.ScVal => {

  const dexDistributionScVal = dexDistributionRaw.map((distribution) => {
    return xdr.ScVal.scvMap([
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol('is_exact_in'),
        val: xdr.ScVal.scvBool(distribution.is_exact_in),
      }),
      new xdr.ScMapEntry({
        key: xdr.ScVal.scvSymbol('parts'),
        val: nativeToScVal(distribution.parts, {type: "i128"}),
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

 return xdr.ScVal.scvVec(dexDistributionScVal)
}

export const hasDistribution = (trade: any): trade is { distribution: DexDistribution[] } => trade && 'distribution' in trade;
