import { H256 } from '@polkadot/types/interfaces';
import { useInkathon } from '@scio-labs/use-inkathon';
import { useMemo } from 'react';
// import type { SpacewalkPrimitivesIssueIssueRequest, SpacewalkPrimitivesVaultId } from '@polkadot/types/lookup';
// import { useMemo } from 'preact/hooks';
// import { useNodeInfoState } from '../../NodeInfoProvider';

export interface RichIssueRequest {
  id: H256;
  request: any;
}

export function useIssuePallet() {
  const { api } = useInkathon();

  const memo = useMemo(() => {
    return {
      async getIssueRequests() {
        const entries = await api?.query.issue.issueRequests.entries();
        if (!entries) {
          return [];
        }

        return entries.map(([key, value]) => {
          const request = value.toHuman();

          const issueRequest: RichIssueRequest = {
            id: key.args[0] as H256,
            request,
          };

          return issueRequest;
        });
      },
      async getIssueRequest(issueId: H256) {
        const request = await api?.query.issue.issueRequests(issueId);
        if (request && !request.isEmpty) {
          return {
            id: issueId,
            request: request.toHuman(),
          };
        } else {
          return undefined;
        }
      },
      createIssueRequestExtrinsic(amount: string, vaultId: any) {
        if (!api) {
          return undefined;
        }

        return api.tx.issue?.requestIssue(amount, vaultId);
      },
    };
  }, [api]);

  return memo;
}