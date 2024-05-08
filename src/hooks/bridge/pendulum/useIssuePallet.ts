import { H256 } from '@polkadot/types/interfaces';
import { useInkathon } from '@scio-labs/use-inkathon';
import { useMemo } from 'react';

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
        if(amount.length >= 40) {
          console.error('Amount too long')
          return undefined;
        }
        try{
          return api.tx.issue?.requestIssue(amount, vaultId);
        } catch(err) {
          console.log('Error:', err)
          return undefined;
        }
      },
    };
  }, [api]);

  return memo;
}
