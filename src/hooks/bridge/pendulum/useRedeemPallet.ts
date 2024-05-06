import { H256 } from '@polkadot/types/interfaces';
import { useInkathon } from '@scio-labs/use-inkathon';
import { convertPublicKeyToRaw } from 'helpers/bridge/pendulum/stellar';
import { useMemo } from 'react';

export interface RichRedeemRequest {
  id: H256;
  request: any;
}

export function useRedeemPallet() {
  const { api } = useInkathon();

  const memo = useMemo(() => {
    return {
        async getRedeemRequests() {
        const entries = await api?.query.redeem.redeemRequests.entries();
        if (!entries) {
          return [];
        }

        return entries.map(([key, value]) => {
          const request = value.toHuman()

          const redeemRequest: RichRedeemRequest = {
            id: key.args[0] as H256,
            request,
          };

          return redeemRequest;
        });
      },
      async getRedeemRequest(redeemId: H256) {
        const request = await api?.query.redeem.redeemRequests(redeemId);
        if (request && !request.isEmpty) {
          return {
            id: redeemId,
            request: request.toHuman(),
          };
        } else {
          return undefined;
        }
      },
      createRedeemRequestExtrinsic(amount: string, stellarAddress: string, vaultId: any) {
        if (!api) {
          return undefined;
        }
        if(amount.length >= 40) {
          console.error('Amount too long')
          return undefined;
        }
        const publicKeyRaw = convertPublicKeyToRaw(stellarAddress);
        try {
          return api.tx.redeem?.requestRedeem(amount, publicKeyRaw, vaultId);
        } catch(err) {
          console.log('Error:', err)
          return undefined;
        }
      },
    };
  }, [api]);

  return memo;
}
