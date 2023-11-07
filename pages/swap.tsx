import SEO from 'components/SEO';
import { SwapComponent } from 'components/Swap/SwapComponent';
import { useTokens } from 'hooks';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function SwapPage() {
  const { tokens } = useTokens();
  const router = useRouter();

  useEffect(() => {
    if (!tokens) return;
    const xlm = tokens.find((token) => token.symbol === 'XLM');
    if (xlm) router.push(`/swap/${xlm.symbol}`);
  }, [tokens, router]);

  return (
    <>
      <SEO title="Swap - Soroswap" description="Soroswap Swap" />
      <SwapComponent />
    </>
  );
}
