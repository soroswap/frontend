import { useSorobanReact } from 'stellar-react';
import { SwapComponent } from 'components/Swap/SwapComponent';
import { xlmTokenList } from 'constants/xlmToken';
import { useEffect, useState } from 'react';
import ReactGA from 'react-ga';
import { Field } from 'state/swap/actions';
import { SwapState } from 'state/swap/reducer';
import SEO from '../src/components/SEO';
import { passphraseToBackendNetworkName } from 'services/pairs';

const TAG_ID = process.env.NEXT_PUBLIC_TAG_ID;
if (TAG_ID && TAG_ID != '') {
  ReactGA.initialize(TAG_ID);
}

export default function Home() {
  const { activeNetwork } = useSorobanReact();
  const [xlmToken, setXlmToken] = useState<string | null>(null);
  const [prefilledState, setPrefilledState] = useState<Partial<SwapState>>({
    [Field.INPUT]: { currencyId: null },
    [Field.OUTPUT]: { currencyId: null },
  });
  const activeChain = passphraseToBackendNetworkName[activeNetwork!].toLowerCase();
  
  useEffect(() => {
    if (!activeChain || !xlmTokenList) return undefined
    
    if (prefilledState.INPUT?.currencyId == null) {
      const newXlmToken =
        xlmTokenList.find((tList) => tList.network === activeChain)?.assets[0].contract ?? null;
      setXlmToken(newXlmToken);

      const newPrefilledState = {
        [Field.INPUT]: { currencyId: newXlmToken },
        [Field.OUTPUT]: { currencyId: null },
      };
      setPrefilledState(newPrefilledState);
    }
  }, [activeChain, xlmToken]);

  return (
    <>
      <SEO title="Soroswap" data-testid="SEO" />
      {xlmToken && (
        <SwapComponent prefilledState={prefilledState} setPrefilledState={setPrefilledState} />
      )}
    </>
  );
}
