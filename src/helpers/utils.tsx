import BigNumber from 'bignumber.js';
import * as StellarSdk from 'stellar-sdk';
import { I128 } from './xdr';

let xdr = StellarSdk.xdr;

export function scvalToBigNumber(scval: StellarSdk.xdr.ScVal | undefined): BigNumber {
  switch (scval?.switch()) {
    case undefined: {
      return BigNumber(0);
    }
    case xdr.ScValType.scvU32(): {
      return BigNumber(scval.u32());
    }
    case xdr.ScValType.scvI32(): {
      return BigNumber(scval.i32());
    }
    case xdr.ScValType.scvU64(): {
      const { high, low } = scval.u64();
      return bigNumberFromBytes(false, high, low);
    }
    case xdr.ScValType.scvI64(): {
      const { high, low } = scval.i64();
      return bigNumberFromBytes(true, high, low);
    }
    case xdr.ScValType.scvU128(): {
      const parts = scval.u128();
      const hi = parts.hi();
      const lo = parts.lo();
      return bigNumberFromBytes(false, lo.low, lo.high, hi.low, hi.high);
    }
    case xdr.ScValType.scvI128(): {
      return BigNumber(decodei128ScVal(scval));
    }
    case xdr.ScValType.scvU256(): {
      const parts = scval.u256();
      const a = parts.hiHi();
      const b = parts.hiLo();
      const c = parts.loHi();
      const d = parts.loLo();
      return bigNumberFromBytes(false, a.high, a.low, b.high, b.low, c.high, c.low, d.high, d.low);
    }
    case xdr.ScValType.scvI256(): {
      const parts = scval.i256();
      const a = parts.hiHi();
      const b = parts.hiLo();
      const c = parts.loHi();
      const d = parts.loLo();
      return bigNumberFromBytes(true, a.high, a.low, b.high, b.low, c.high, c.low, d.high, d.low);
    }
    default: {
      throw new Error(`Invalid type for scvalToBigNumber: ${scval?.switch().name}`);
    }
  }
}

function bigNumberFromBytes(signed: boolean, ...bytes: (string | number | bigint)[]): BigNumber {
  let sign = 1;
  if (signed && bytes[0] === 0x80) {
    // top bit is set, negative number.
    sign = -1;
    bytes[0] &= 0x7f;
  }
  let b = BigInt(0);
  for (let byte of bytes) {
    b <<= BigInt(8);
    b |= BigInt(byte);
  }
  return BigNumber(b.toString()).multipliedBy(sign);
}

export function bigNumberToI128(value: BigNumber): StellarSdk.xdr.ScVal {
  const b: bigint = BigInt(value.toFixed(0));
  const buf = bigintToBuf(b);
  if (buf.length > 16) {
    throw new Error('BigNumber overflows i128');
  }

  if (value.isNegative()) {
    // Clear the top bit
    buf[0] &= 0x7f;
  }

  // left-pad with zeros up to 16 bytes
  let padded = Buffer.alloc(16);
  buf.copy(padded, padded.length - buf.length);

  if (value.isNegative()) {
    // Set the top bit
    padded[0] |= 0x80;
  }

  const hi = new xdr.Int64([
    bigNumberFromBytes(false, ...padded.slice(4, 8)).toNumber(),
    bigNumberFromBytes(false, ...padded.slice(0, 4)).toNumber(),
  ]);
  const lo = new xdr.Uint64([
    bigNumberFromBytes(false, ...padded.slice(12, 16)).toNumber(),
    bigNumberFromBytes(false, ...padded.slice(8, 12)).toNumber(),
  ]);

  return xdr.ScVal.scvI128(new xdr.Int128Parts({ lo, hi }));
}

function bigintToBuf(bn: bigint): Buffer {
  var hex = BigInt(bn).toString(16).replace(/^-/, '');
  if (hex.length % 2) {
    hex = '0' + hex;
  }

  var len = hex.length / 2;
  var u8 = new Uint8Array(len);

  var i = 0;
  var j = 0;
  while (i < len) {
    u8[i] = parseInt(hex.slice(j, j + 2), 16);
    i += 1;
    j += 2;
  }

  if (bn < BigInt(0)) {
    // Set the top bit
    u8[0] |= 0x80;
  }

  return Buffer.from(u8);
}

export function xdrUint64ToNumber(value: StellarSdk.xdr.Uint64): number {
  let b = 0;
  b |= value.high;
  b <<= 8;
  b |= value.low;
  return b;
}

export function scvalToString(value: StellarSdk.xdr.ScVal): string | undefined {
  return value.bytes().toString();
}

// XDR -> String
export const decodei128ScVal = (value: StellarSdk.xdr.ScVal) => {
  try {
    return new I128([
      BigInt(value.i128().lo().low),
      BigInt(value.i128().lo().high),
      BigInt(value.i128().hi().low),
      BigInt(value.i128().hi().high),
    ]).toString();
  } catch (error) {
    return 0;
  }
};

export function accountToScVal(account: string): StellarSdk.xdr.ScVal {
  return new StellarSdk.Address(account).toScVal();
}

export function contractAddressToScVal(contractAddress: string): any {
  return StellarSdk.Address.contract(Buffer.from(contractAddress, 'hex')).toScVal();
}

export function bigNumberToU64(value: BigNumber): StellarSdk.xdr.ScVal {
  if (value.isNegative() || value.isGreaterThan(new BigNumber(2).pow(64).minus(1))) {
    throw new Error('BigNumber is out of u64 range');
  }

  const b: bigint = BigInt(value.toFixed(0));
  const buf = bigintToBuf(b);

  if (buf.length > 8) {
    throw new Error('BigNumber overflows u64');
  }

  // left-pad with zeros up to 8 bytes
  let padded = Buffer.alloc(8);
  buf.copy(padded, padded.length - buf.length);

  // Split padded into two parts for Uint64
  const hi = bigNumberFromBytes(false, ...padded.slice(0, 4)).toNumber();
  const lo = bigNumberFromBytes(false, ...padded.slice(4, 8)).toNumber();

  return xdr.ScVal.scvU64(new xdr.Uint64([hi, lo]));
}

export function bigNumberToU32(value: BigNumber): StellarSdk.xdr.ScVal {
  if (value.isNegative() || value.isGreaterThan(new BigNumber(2).pow(32).minus(1))) {
    throw new Error('BigNumber is out of u32 range');
  }

  const b: bigint = BigInt(value.toFixed(0));
  const buf = bigintToBuf(b);

  if (buf.length > 4) {
    throw new Error('BigNumber overflows u32');
  }

  let padded = Buffer.alloc(4);
  buf.copy(padded, padded.length - buf.length);

  const num = bigNumberFromBytes(false, ...padded).toNumber();

  return xdr.ScVal.scvU32(num);
}
