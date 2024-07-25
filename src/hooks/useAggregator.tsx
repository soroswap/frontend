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
      setAddress('CA4VZX7N577XGPSKDG4RT24CZ6XGR37TM2652SO2AASERVUWP72N4UGZ');
      setIsAggregatorEnabled(false && shouldUseAggregator);
    } else if (activeChain?.id == 'testnet') {
      setAddress('CA4VZX7N577XGPSKDG4RT24CZ6XGR37TM2652SO2AASERVUWP72N4UGZ');
      setIsAggregatorEnabled(true && shouldUseAggregator);
    } else {
      setAddress('CA4VZX7N577XGPSKDG4RT24CZ6XGR37TM2652SO2AASERVUWP72N4UGZ');
      setIsAggregatorEnabled(false && shouldUseAggregator);
    }
  }, [activeChain?.id, sorobanContext]);

  return { address, isEnabled };
};
