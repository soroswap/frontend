import { SorobanContextType, useSorobanReact } from '@soroban-react/core';
import { useEffect, useState } from 'react';

const shouldUseAggregator = process.env.NEXT_PUBLIC_AGGREGATOR_ENABLED === 'true';

export const useAggregator = () => {
  const sorobanContext: SorobanContextType = useSorobanReact();

  const { activeChain } = sorobanContext;

  const [address, setAddress] = useState<string>();
  const [isEnabled, setIsAggregatorEnabled] = useState<boolean>(false);

  useEffect(() => {
    if (!sorobanContext) return;

    if (activeChain?.id == 'mainnet') {
      //TODO: Add mainnet aggregator address
      setAddress('CD4NUEFTQU53SM7LPAQX5RHJOWOLOHRBM4HCNGA7UBQJ6MPIJNVGYEVL');
      setIsAggregatorEnabled(false && shouldUseAggregator);
    } else if (activeChain?.id == 'testnet') {
      setAddress('CD4NUEFTQU53SM7LPAQX5RHJOWOLOHRBM4HCNGA7UBQJ6MPIJNVGYEVL');
      setIsAggregatorEnabled(true && shouldUseAggregator);
    } else {
      setAddress('CD4NUEFTQU53SM7LPAQX5RHJOWOLOHRBM4HCNGA7UBQJ6MPIJNVGYEVL');
      setIsAggregatorEnabled(false && shouldUseAggregator);
    }
  }, [activeChain?.id, sorobanContext]);

  return { address, isEnabled };
};
