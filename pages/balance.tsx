import { Balances } from '../src/components/Balances';
import SEO from '../src/components/SEO';

export default function BalancesPage() {
  return (
    <>
      <SEO title="Balances - Soroswap" description="Soroswap Balances" />

      <Balances />
    </>
  );
}
