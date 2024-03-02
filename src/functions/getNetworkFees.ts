import * as StellarSdk from 'stellar-sdk';
import axios from 'axios';

const getCurrentTimePlusOneHour = (): number => {
  // Get the current time in milliseconds
  const now = Date.now();

  // Add one hour (3600000 milliseconds)
  const oneHourLater = now + 36000000;

  const oneHourLaterSeconds = Math.floor(oneHourLater / 1000);
  return oneHourLaterSeconds;
};

export async function calculateSwapFees(
  pathAddresses: string[],
  amountIn: number,
  amountOutMin: number,
) {
  // Currently 'standalone' for testing purposes.
  // Change to Mainnet when in production.
  const passphrase = StellarSdk.Networks.TESTNET;
  let network = passphrase.split(' ')[0].toLowerCase();
  if (network == 'test') {
    network = 'testnet';
  }

  const keysApiResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/keys`);
  const keys = keysApiResponse.data.filter(
    (key: { network: string }) => key.network === network,
  )[0];

  const adminPublicKey = keys.admin_public;
  // console.log('adminPublicKey', adminPublicKey);
  const adminSecretKey = keys.admin_secret;
  // console.log('adminSecretKey', adminSecretKey);

  const routerApiResponse = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/router`);
  const routerId = routerApiResponse.data.filter(
    (key: { network: string }) => key.network === network,
  )[0].router_id;
  // console.log('routerId', routerId);

  const routerContract = new StellarSdk.Contract(routerId);

  const fee = StellarSdk.BASE_FEE;
  const path = pathAddresses.map((address) => new StellarSdk.Address(address));

  const scValParams = [
    StellarSdk.nativeToScVal(Number(amountIn), { type: 'i128' }),
    StellarSdk.nativeToScVal(Number(amountOutMin), { type: 'i128' }),
    StellarSdk.nativeToScVal(path, { type: 'Vec' }),
    new StellarSdk.Address(adminPublicKey).toScVal(),
    StellarSdk.nativeToScVal(getCurrentTimePlusOneHour(), { type: 'u64' }),
  ];

  const op = routerContract.call('swap_exact_tokens_for_tokens', ...scValParams);
  const server = new StellarSdk.SorobanRpc.Server('https://soroban-testnet.stellar.org/', {
    allowHttp: true,
  });
  const account = await server.getAccount(adminPublicKey);
  const transaction = new StellarSdk.TransactionBuilder(account, { fee })
    // Uncomment the following line to build transactions for the live network. Be
    // sure to also change the horizon hostname.
    //.setNetworkPassphrase(StellarSdk.Networks.PUBLIC)
    .setNetworkPassphrase(StellarSdk.Networks.STANDALONE)
    .setTimeout(30) // valid for the next 30s
    // Add an operation to call increment() on the contract
    .addOperation(op)
    .build();

  const preparedTransaction = await server.prepareTransaction(transaction);

  // Sign this transaction with the secret key
  // NOTE: signing is transaction is network specific. Test network transactions
  // won't work in the public network. To switch networks, use the Network object
  // as explained above (look for StellarSdk.Network).
  const sourceKeypair = StellarSdk.Keypair.fromSecret(adminSecretKey);
  const simulatedTransaction = await server.simulateTransaction(preparedTransaction);

  type simulatedTransactionKey = keyof typeof simulatedTransaction;
  const minResourceFeeVar = 'minResourceFee' as simulatedTransactionKey;
  const minResourceFee = simulatedTransaction[minResourceFeeVar];
  console.log('minResourceFee:', minResourceFee);
}
