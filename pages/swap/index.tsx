import { useSorobanReact } from '@soroban-react/core';
import SEO from 'components/SEO';
import { SwapComponent } from 'components/Swap/SwapComponent';
import { xlmTokenList } from 'constants/xlmToken';
import { Field } from 'state/swap/actions';

export default function SwapPage() {
  const { activeChain } = useSorobanReact()

  const xlmToken = xlmTokenList.find((tList) => tList.network == (activeChain?.id))?.tokens[0].address

  const prefilledState = {
    [Field.INPUT]: { currencyId: xlmToken},
    [Field.OUTPUT]: { currencyId: null },
  };

  return (
    <>
      <SEO title="Swap - Soroswap" description="Soroswap Swap" />
      <SwapComponent prefilledState={prefilledState}/>
    </>
  );
}
