import { useSorobanReact } from '@soroban-react/core';
import SEO from 'components/SEO';
import { SwapComponent } from 'components/Swap/SwapComponent';
import { xlmTokenList } from 'constants/xlmToken';
import { useEffect, useState } from 'react';
import { Field } from 'state/swap/actions';
import { SwapState } from 'state/swap/reducer';

export default function SwapPage() {
  const { activeChain } = useSorobanReact();
  const [xlmToken, setXlmToken] = useState<string | null>(null);
  const [prefilledState, setPrefilledState] = useState<Partial<SwapState>>({
    [Field.INPUT]: { currencyId: null },
    [Field.OUTPUT]: { currencyId: null },
  });

  useEffect(() => {
    const newXlmToken = xlmTokenList.find((tList) => tList.network === (activeChain?.id))?.tokens[0].address ?? null;
    setXlmToken(newXlmToken);

    const newPrefilledState = {
      [Field.INPUT]: { currencyId: newXlmToken },
      [Field.OUTPUT]: { currencyId: null },
    };

    setPrefilledState(newPrefilledState);
  }, [activeChain, xlmToken]);

  return (
    <>
      <SEO title="Swap - Soroswap" description="Soroswap Swap" />
      {xlmToken && <SwapComponent prefilledState={prefilledState} />}
    </>
  );
}
