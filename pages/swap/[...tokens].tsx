import { useSorobanReact } from '@soroban-react/core';
import SEO from 'components/SEO';
import { SwapComponent } from 'components/Swap/SwapComponent';
import { xlmTokenList } from 'constants/xlmToken';
import { useRouter } from 'next/router';
import { Field } from 'state/swap/actions';

export default function SwapPage() {
  const { activeChain } = useSorobanReact();
  const xlmToken = xlmTokenList.find((set) => set.network === activeChain?.network)?.assets

  const router = useRouter();

  const { tokens } = router.query;

  let [paramTokenA, paramTokenB] = (tokens ?? [null, null]) as string[];

  if (paramTokenA === 'XLM') {
    paramTokenA = xlmToken ? xlmToken[0].contract : paramTokenA
  }

  if (paramTokenB === 'XLM') {
    paramTokenB = xlmToken ? xlmToken[0].contract : paramTokenB
  }

  const prefilledState = {
    [Field.INPUT]: { currencyId: paramTokenA },
    [Field.OUTPUT]: { currencyId: paramTokenB },
  };

  if (!tokens) {
    //TODO: Fix loading screen to be a loader (there should be one already in the components)
    return (
      <>
        <SEO title="Loading..." description="Soroswap Swap" />
        <div>Loading...</div>
      </>
    )
  }

  return (
    <>
      <SEO title="Swap - Soroswap" description="Soroswap Swap" />
      <SwapComponent prefilledState={prefilledState}/>
    </>
  );
}
