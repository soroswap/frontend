import { Mercury } from 'mercury-sdk';
import { NextApiRequest, NextApiResponse } from 'next';
import * as StellarSdk from '@stellar/stellar-sdk';

const testnetPairsTable = 'allZephyrAc4C7D40C78D2B474009391E80Aedb99S';
const mainnetPairsTable = 'allZephyr923625Cad8F2Bf73069B63583354Ba4As';

const parseScvalValue = (value: any) => {
  const scval = StellarSdk.xdr.ScVal.fromXDR(value, 'base64');
  return StellarSdk.scValToNative(scval);
};

const parseMercuryScvalResponse = (data: any) => {
  return data.map((d: any) => {
    let n: any = {};

    for (let key in d) {
      const value = parseScvalValue(d[key]);

      if (typeof value === 'bigint' || typeof value === 'number') {
        n[key] = value.toString();
      } else {
        n[key] = value;
      }
    }

    return n;
  });
};

const GET_ALL_PAIRS = (tableName: string) => `query Query {
    events: ${tableName}	 {
      data: nodes {
        tokenA
        tokenB
        address
        reserveA
        reserveB
      }
    }
  }`;

const getMercuryInstance = (network: QueryNetwork) => {
  let backendEndpoint = null;
  let graphqlEndpoint = null;
  let email = null;
  let password = null;

  if (network === 'mainnet') {
    email = process.env.MERCURY_EMAIL_MAINNET!;
    password = process.env.MERCURY_PASSWORD_MAINNET!;
    backendEndpoint = process.env.MERCURY_BACKEND_ENDPOINT_MAINNET!;
    graphqlEndpoint = process.env.MERCURY_GRAPHQL_ENDPOINT_MAINNET!;
  } else {
    email = process.env.MERCURY_EMAIL_TESTNET!;
    password = process.env.MERCURY_PASSWORD_TESTNET!;
    backendEndpoint = process.env.MERCURY_BACKEND_ENDPOINT_TESTNET!;
    graphqlEndpoint = process.env.MERCURY_GRAPHQL_ENDPOINT_TESTNET!;
  }

  return new Mercury({
    backendEndpoint,
    graphqlEndpoint,
    email,
    password,
  });
};

interface MercuryPair {
  tokenA: string;
  tokenB: string;
  address: string;
  reserveA: string;
  reserveB: string;
}

type QueryNetwork = 'mainnet' | 'testnet';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const queryParams = req.query;

  const network = queryParams?.network as QueryNetwork;

  if (!network || (network !== 'mainnet' && network !== 'testnet')) {
    return res.status(400).json({ error: 'Invalid network' });
  }

  const mercuryInstance = getMercuryInstance(network);

  const response = await mercuryInstance.getCustomQuery({
    request: GET_ALL_PAIRS(network === 'mainnet' ? mainnetPairsTable : testnetPairsTable),
  });

  if (response.ok) {
    const parsedData: MercuryPair[] = parseMercuryScvalResponse(response.data.events.data);

    if (parsedData.length === 0) {
      return res.status(500).json({ error: 'No pairs found' });
    }

    return res.json(parsedData);
  }

  return res.status(500).json({ error: 'Failed to fetch pairs from Mercury' });
}

export default handler;
