import { ProvideLiquidity } from "../src/components/ProvideLiquidity";
import SEO from "../src/components/SEO";

export default function LiquidityPage() {
  return (
    <>
      <SEO title="Liquidity - Soroswap" description="Soroswap Liquidity Pool" />
      <ProvideLiquidity />
    </>
  );
}
