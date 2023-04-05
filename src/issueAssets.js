import StellarSdk from "stellar-sdk";

import { sendPaymentFromIssuer } from "./sendPaymentFromIssuer.js"
import { trustAsset } from "./trustAsset.js";
import settings from "../settings.json"  assert { type: "json" };

const assets =[settings.assetCode1, settings.assetCode2]
console.log(assets)
let asset_code
for (let i = 0; i<2; i++) {
//assets.forEach(async(asset_code)=>{
  asset_code = assets[i]


  console.log("Using asset_code: ", asset_code)

  var server = new StellarSdk.Server(settings.horizonUrl, {allowHttp: true});
  // console.log("server: ", server)
  var networkPassphrase = settings.networkPassphrase

  // Keys for accounts to issue and receive the new asset

  var issuingKeys = StellarSdk.Keypair.fromSecret(settings.issuerSecret);
  var receivingKeys = StellarSdk.Keypair.fromSecret(settings.receiverSecret);
  console.log("receivingKeys: ", receivingKeys)

  console.log("a")
  // Create an object to represent the new asset
  var asset = new StellarSdk.Asset(asset_code, issuingKeys.publicKey());

  try {
    // First, the receiving account must trust the asset
    console.log("1. First, the receiving account must trust the asset")
    const receiver = await server.loadAccount(receivingKeys.publicKey())
    console.log("Receiver ok")
    const trustAssetResult = await trustAsset(server, 
                                              settings.networkPassphrase,
                                              receiver,
                                              receivingKeys, 
                                              asset,
                                              settings.limit)
    console.log("Trust tx result: ", trustAssetResult)
  }
  catch(error){
    console.error("Error! while trusting the asset: ", error)
  } 

  try{
    console.log("2. Second, the issuing account actually sends a payment using the asset")
    const issuer = await server.loadAccount(issuingKeys.publicKey());
    const sendPaymentResult = await sendPaymentFromIssuer(server,
                                                            settings.networkPassphrase,
                                                            issuer,
                                                            issuingKeys,
                                                            asset,
                                                            receivingKeys.publicKey(),
                                                            settings.amount)
    console.log("Payment tx result: ", sendPaymentResult)
  }
  catch(error){  
    console.error("Error! while sending payment from issuer: ", error)
  }


}
//})
