import AddLiquidityComponent from 'components/Liquidity/Add/AddLiquidityComponent';
import SEO from 'components/SEO';
import { useRouter } from 'next/router';

export default function AddLiquidityPage() {
  const router = useRouter();

  const { tokens } = router.query;

  const [tokenA, tokenB] = (tokens ?? ['null', 'null']) as string[];

  return (
    <>
      <SEO title="Add - Soroswap" description="Soroswap Add" />
      <AddLiquidityComponent currencyIdA={tokenA} currencyIdB={tokenB} />
    </>
  );
}
