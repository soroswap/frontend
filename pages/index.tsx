import { useSorobanReact } from '@soroban-react/core';
import { SwapComponent } from 'components/Swap/SwapComponent';
import { xlmTokenList } from 'constants/xlmToken';
import { useEffect, useState } from 'react';
import { Field } from 'state/swap/actions';
import { SwapState } from 'state/swap/reducer';
import SEO from '../src/components/SEO';

export default function Home() {
  const { activeChain } = useSorobanReact();
  const [xlmToken, setXlmToken] = useState<string | null>(null);
  const [prefilledState, setPrefilledState] = useState<Partial<SwapState>>({
    [Field.INPUT]: { currencyId: null },
    [Field.OUTPUT]: { currencyId: null },
  });

  useEffect(() => {
    const newXlmToken =
      xlmTokenList.find((tList) => tList.network === activeChain?.id)?.tokens[0].contract ?? null;
    setXlmToken(newXlmToken);

    const newPrefilledState = {
      [Field.INPUT]: { currencyId: newXlmToken },
      [Field.OUTPUT]: { currencyId: null },
    };
    setPrefilledState(newPrefilledState);
  }, [activeChain, xlmToken]);

  return (
    <>
      <SEO title="Soroswap" description="Soroswap Index" data-testid="SEO" />
      {xlmToken && <SwapComponent prefilledState={prefilledState} />}
    </>
  );
}
