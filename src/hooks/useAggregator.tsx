import { SorobanContextType, useSorobanReact } from '@soroban-react/core';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const aggregatorMainnet = process.env.NEXT_PUBLIC_AGGREGATOR_ENABLED_MAINNET === 'true';
const aggregatorTestnet = process.env.NEXT_PUBLIC_AGGREGATOR_ENABLED_TESTNET === 'true';

export const useAggregator = () => {
  const sorobanContext: SorobanContextType = useSorobanReact();

  const { activeChain } = sorobanContext;

  const [address, setAddress] = useState<string>();

  const shouldUseAggregator = useMemo(() => {
    if (activeChain?.id === 'mainnet') {
      return !!aggregatorMainnet
    } else if (activeChain?.id === 'testnet') {
      return !!aggregatorTestnet
    }
  }, [activeChain?.id])

  const isEnabled = useMemo(async () => {
    if (!sorobanContext) return;
    const { data } = await axios.get(
      `https://raw.githubusercontent.com/soroswap/aggregator/refs/heads/main/public/${activeChain?.id}.contracts.json`
    ).catch((error) => {
      console.error('Error fetching aggregator data', error);
      console.warn('No address found Aggregator is disabled');
      return { data: { ids: { aggregator: '' } } };
    });
    const aggregatorAddress = data.ids.aggregator;
    setAddress(aggregatorAddress);
    const isEnabled = !!shouldUseAggregator && !!aggregatorAddress;
    return isEnabled;
  }, [activeChain?.id, shouldUseAggregator])

  return { address, isEnabled };
};
