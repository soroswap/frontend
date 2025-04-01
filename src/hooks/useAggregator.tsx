import { SorobanContextType, useSorobanReact } from 'stellar-react';
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { passphraseToBackendNetworkName } from 'services/pairs';

const aggregatorMainnet = process.env.NEXT_PUBLIC_AGGREGATOR_ENABLED_MAINNET === 'true';
const aggregatorTestnet = process.env.NEXT_PUBLIC_AGGREGATOR_ENABLED_TESTNET === 'true';

export const useAggregator = () => {
  const sorobanContext: SorobanContextType = useSorobanReact();

  const { activeNetwork } = sorobanContext;

  const [address, setAddress] = useState<string>();
  const [isEnabled, setIsAggregatorEnabled] = useState<boolean>(false);
  const activeChainId = passphraseToBackendNetworkName[activeNetwork!].toLowerCase();
  const shouldUseAggregator = useMemo(() => {
    if (activeChainId === 'mainnet') {
      return !!aggregatorMainnet
    } else if (activeChainId === 'testnet') {
      return !!aggregatorTestnet
    }
  }, [activeChainId])

  useEffect(() => {
    console.log('useAggregator', activeChainId, shouldUseAggregator);
    const setAggregatorData = async () => {
      if (!sorobanContext) return;
      const { data } = await axios.get(
        `https://raw.githubusercontent.com/soroswap/aggregator/refs/heads/main/public/${activeChainId}.contracts.json`
      ).catch((error) => {
        console.error('Error fetching aggregator data', error);
        console.warn('No address found Aggregator is disabled');
        setIsAggregatorEnabled(false);
        return { data: { ids: { aggregator: '' } } };
      });
      const aggregatorAddress = data.ids.aggregator;
      setAddress(aggregatorAddress);
      setIsAggregatorEnabled(!!shouldUseAggregator && !!aggregatorAddress);
    };
    setAggregatorData();
  }, [activeChainId, shouldUseAggregator]);

  return { address, isEnabled };
};
