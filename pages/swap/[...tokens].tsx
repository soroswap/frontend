import SEO from 'components/SEO';
import { SwapComponent } from 'components/Swap/SwapComponent';
import { useRouter } from 'next/router';
import { Field } from 'state/swap/actions';

export default function SwapPage() {
  const router = useRouter();

  const { tokens } = router.query;

  const [paramTokenA, paramTokenB] = (tokens ?? [null, null]) as string[];

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
