import { SwapComponent } from 'components/Swap/SwapComponent';
import { useRouter } from 'next/router';
import SEO from 'components/SEO';

export default function SwapPage() {
  const router = useRouter();

  const { tokens } = router.query;

  const [tokenA, tokenB] = (tokens ?? []) as string[];

  return (
    <>
      <SEO title="Swap - Soroswap" description="Soroswap Swap" />
      <SwapComponent paramTokenA={tokenA} paramTokenB={tokenB} />
    </>
  );
}
