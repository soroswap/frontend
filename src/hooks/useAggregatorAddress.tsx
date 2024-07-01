import { SorobanContextType, useSorobanReact } from '@soroban-react/core';
import { useEffect, useState } from 'react';

export const useAggregatorAddress = () => {
  const sorobanContext: SorobanContextType = useSorobanReact();

  const { activeChain } = sorobanContext;

  const [aggregator, setAggregator] = useState<string>();

  useEffect(() => {
    if (!sorobanContext) return;

    if (activeChain?.id == "mainnet") {
      //TODO: Add mainnet aggregator address
      setAggregator("CD4NUEFTQU53SM7LPAQX5RHJOWOLOHRBM4HCNGA7UBQJ6MPIJNVGYEVL")
    } else { 
      setAggregator("CD4NUEFTQU53SM7LPAQX5RHJOWOLOHRBM4HCNGA7UBQJ6MPIJNVGYEVL")
    }
  }, [activeChain?.id, sorobanContext]);

  return { aggregator };
};