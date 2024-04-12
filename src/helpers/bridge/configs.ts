// In the future we should add here BSC, ETH, SOL for allbridge
export const availableNetworks = ["pendulum"]

const XLM_VAULT_ACCOUNT_ID =
"6cKoXRGxqpXQZavYAXPuXYFKNAev8QuHJ2zhh9rnWc3XMmTr";

export const xlmVaultId = {
  accountId: XLM_VAULT_ACCOUNT_ID,
  currencies: {
    collateral: { XCM: 0 },
    wrapped: { Stellar: "StellarNative" },
  },
}