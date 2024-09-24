import { SorobanContextType, useSorobanReact } from '@soroban-react/core';
import { useEffect, useState } from 'react';
import axios from 'axios';

const shouldUseAggregator = process.env.NEXT_PUBLIC_AGGREGATOR_ENABLED === 'true';

export const useAggregator = () => {
  const sorobanContext: SorobanContextType = useSorobanReact();

  const { activeChain } = sorobanContext;

  const [address, setAddress] = useState<string>();
  const [isEnabled, setIsAggregatorEnabled] = useState<boolean>(false);


  useEffect(() => {
    const setAggregatorData = async () => {
      if (!sorobanContext) return;
      const { data } = await axios.get(
        `https://raw.githubusercontent.com/soroswap/aggregator/refs/heads/main/public/${activeChain?.id}.contracts.json`
      ).catch((error) => {
        console.error('Error fetching aggregator data', error);
        console.warn('No address found Aggregator is disabled');
        setIsAggregatorEnabled(false);
        return { data: { ids: { aggregator: '' } } };
      });
      const aggregatorAddress = data.ids.aggregator;
      setAddress(aggregatorAddress);
      setIsAggregatorEnabled(shouldUseAggregator && !!aggregatorAddress);
    };
    setAggregatorData();
  }, [activeChain?.id, sorobanContext]);

  return { address, isEnabled };
};
