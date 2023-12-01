import SEO from 'components/SEO';
import { SwapComponent } from 'components/Swap/SwapComponent';
import { useTokens } from 'hooks';
import { useEffect, useState } from 'react';
import { Field } from 'state/swap/actions';

export default function SwapPage() {
  const { tokens } = useTokens();
  const [xlmAddress, setXlmToken] = useState<string | null>(null)

  useEffect(() => {
    const xlm = tokens.find((token) => token.symbol === 'XLM')
    setXlmToken(xlm?.address ?? null)
  }, [tokens])

  const prefilledState = {
    [Field.INPUT]: { currencyId: "CCJQN2YS425VTF55YRSL4GMDI4J2X6IOSWQ4SFRN3OJH4V7DFP6XLXUP"},
    [Field.OUTPUT]: { currencyId: null },
  };

  return (
    <>
      <SEO title="Swap - Soroswap" description="Soroswap Swap" />
      <SwapComponent prefilledState={prefilledState}/>
    </>
  );
}
