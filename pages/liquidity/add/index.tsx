import AddLiquidityComponent from 'components/Liquidity/Add/AddLiquidityComponent';
import SEO from 'components/SEO';
import { useTokens } from 'hooks';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function AddLiquidityPage() {
  const { tokens } = useTokens();
  const router = useRouter();

  useEffect(() => {
    if (!tokens) return;

    const xlm = tokens.find((token) => token.symbol === 'XLM');
    if (xlm) router.push(`/liquidity/add/${xlm.address}`);
  }, [tokens, router]);

  return (
    <>
      <SEO title="Add - Soroswap" description="Soroswap Add" />
      <AddLiquidityComponent />
    </>
  );
}
