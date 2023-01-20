#!/bin/bash


set -e

TOKEN_ADMIN="GDT2NORMZF6S2T4PT4OBJJ43OPD3GPRNTJG3WVVFB356TUHWZQMU6C3U"
TOKEN_ADMIN_IDENTIFIER="AAAABAAAAAEAAAAAAAAAAgAAAAUAAAAHQWNjb3VudAAAAAAEAAAAAQAAAAgAAAAA56a6LMl9LU+PnxwUp5tzx7M+LZpNu1alDvvp0PbMGU8="


 LIQUIDITY_POOL_ID=$(cat .soroban/liquidity_pool)
 TOKEN_ID_1=$(cat .soroban/token_id_1)
 TOKEN_ID_2=$(cat .soroban/token_id_2)

echo STEP 4: Initialize the liquidity_pool contract with TOKEN IDs
soroban invoke \
  --id "$LIQUIDITY_POOL_ID" \
  --fn initialize \
   --arg "$TOKEN_ID_1" \
   --arg "$TOKEN_ID_2"
#   --wasm contracts/target/wasm32-unknown-unknown/release/soroban_liquidity_pool_contract.wasm

 echo "Done"


