import { useSorobanReact, WalletNetwork } from 'stellar-react';
import SEO from 'components/SEO';
import { SwapComponent } from 'components/Swap/SwapComponent';
import { xlmTokenList } from 'constants/xlmToken';
import { useEffect, useState } from 'react';
import { Field } from 'state/swap/actions';
import { SwapState } from 'state/swap/reducer';
import { passphraseToBackendNetworkName } from 'services/pairs';

export default function SwapPage() {
  const { activeNetwork } = useSorobanReact();
  const activeChain = passphraseToBackendNetworkName[activeNetwork ?? WalletNetwork.TESTNET].toLowerCase();
  const [xlmToken, setXlmToken] = useState<string | null>(null);
  const [prefilledState, setPrefilledState] = useState<Partial<SwapState>>({
    [Field.INPUT]: { currencyId: null },
    [Field.OUTPUT]: { currencyId: null },
  });

  useEffect(() => {
    const newXlmToken =
      xlmTokenList.find((tList) => tList.network === activeChain)?.assets[0].contract ?? null;
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
