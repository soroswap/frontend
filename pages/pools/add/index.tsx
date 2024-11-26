import AddLiquidityComponent from 'components/Pools/Add/AddLiquidityComponent';
import SEO from 'components/SEO';
import { useApiTokens } from 'hooks/tokens/useApiTokens';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function AddLiquidityPage() {
  const { tokens } = useApiTokens();
  const router = useRouter();

  useEffect(() => {
    if (!tokens) return;

    const xlm = tokens.find((token) => token.code === 'XLM');
    if (xlm) router.push(`/pools/add/${xlm.contract}`);
  }, [tokens, router]);

  return (
    <>
      <SEO title="Add - Soroswap" description="Soroswap Add" />
      <AddLiquidityComponent />
    </>
  );
}
