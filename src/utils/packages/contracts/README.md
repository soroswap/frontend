# @soroban-react/contracts

See the official gitbook: https://soroban-react.gitbook.io/index/ .

---

```javascript
import { useContractValue } from '@soroban-react/contracts';
import { useSorobanReact } from 'utils/packages/core/src';

const balance = useContractValue({
  contractId: Constants.TokenId,
  method: 'balance',
  params: [contractIdentifier(Buffer.from(Constants.CrowdfundId, 'hex'))],
  sorobanContext: sorobanContext,
});
```
