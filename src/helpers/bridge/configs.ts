import { AccountId32 } from "@polkadot/types/interfaces";
import { VaultId } from "hooks/bridge/pendulum/useSpacewalkVaults";

// In the future we should add here BSC, ETH, SOL for allbridge
export const availableNetworks = ["pendulum"]

const XLM_VAULT_ACCOUNT_ID =
"6cKoXRGxqpXQZavYAXPuXYFKNAev8QuHJ2zhh9rnWc3XMmTr";

export const xlmVaultId: VaultId = {
  accountId: XLM_VAULT_ACCOUNT_ID as unknown as AccountId32,
  currencies: {
    collateral: { XCM: "0" },
    wrapped: { Stellar: "StellarNative" },
  },
}
