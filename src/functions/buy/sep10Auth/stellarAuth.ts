import { Operation, WebAuth, xdr } from "@stellar/stellar-sdk";
import { getStellarToml, getAuthUrl } from "../SEP-1";

//TODO: Add memo to operation
export async function getChallengeTransaction({ 
  publicKey, 
  homeDomain,
}:{ 
  publicKey: string, 
  homeDomain: string,
}): Promise<{
  transaction:any, 
  network_passphrase:string
}>{
  let { WEB_AUTH_ENDPOINT, TRANSFER_SERVER, SIGNING_KEY } = await getStellarToml(homeDomain)

  // In order for the SEP-10 flow to work, we must have at least a server
  // signing key, and a web auth endpoint (which can be the transfer server as
  // a fallback)
  if (!(WEB_AUTH_ENDPOINT || TRANSFER_SERVER) || !SIGNING_KEY) {
      console.error(500, {
          message: 'could not get challenge transaction (server missing toml entry or entries)',
      })
  }

  // Request a challenge transaction for the users's account
  let res = await fetch(
      `${WEB_AUTH_ENDPOINT || TRANSFER_SERVER}?${new URLSearchParams({
          // Possible parameters are `account`, `memo`, `home_domain`, and
          // `client_domain`. For our purposes, we only supply `account`.
          account: publicKey,
      })}`
  ).catch((e)=>{
    console.log(e)
  })
  console.log(res)
  let json = await res?.json()
  // Validate the challenge transaction meets all the requirements for SEP-10
  validateChallengeTransaction({
      transactionXDR: json.transaction,
      serverSigningKey: SIGNING_KEY,
      network: json.network_passphrase,
      clientPublicKey: publicKey,
      homeDomain: homeDomain,
  })
  return json
}

//TODO: Fix Err400 { message: '{"name":"InvalidChallengeError"}' 
// decode transaction & validate the values
function validateChallengeTransaction({
  transactionXDR,
  serverSigningKey,
  network,
  clientPublicKey,
  homeDomain,
  clientDomain,
}: {
  transactionXDR: any,
  serverSigningKey: string,
  network: string,
  clientPublicKey: any,
  homeDomain: string,
  clientDomain?: string,
}) {
  if (!clientDomain) {
      clientDomain = homeDomain
  }

  try {
      // Use the `readChallengeTx` function from Stellar SDK to read and
      // verify most of the challenge transaction information
      let results = WebAuth.readChallengeTx(
          transactionXDR,
          serverSigningKey,
          network,
          homeDomain,
          clientDomain
      )
      
      // Also make sure the transaction was created for the correct user
      if (results.clientAccountID === clientPublicKey) {
          return
      } else {
          console.error(400, { message: 'clientAccountID does not match challenge transaction' })
      }
  } catch (err) {
      console.error(400, { message: JSON.stringify(err) })
  }
}

//TODO: Implement token validations https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0010.md#token
export async function submitChallengeTransaction({ 
  transactionXDR,
  homeDomain
}: { 
  transactionXDR: string | undefined, 
  homeDomain: string
}) {
  if (!transactionXDR || transactionXDR === undefined){
    console.error('invalid transaction xdr')
  }
  let webAuthEndpoint = await getAuthUrl(homeDomain)
  if (!webAuthEndpoint)
      console.error(500, { message: 'could not authenticate with server (missing toml entry)' })
  let res = await fetch(webAuthEndpoint, {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaction: transactionXDR }),
  })
  let json = await res.json()

  if (!res.ok) {
      console.error(400, { message: json.error })
  }
  return json.token
}