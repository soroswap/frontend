import AddLiquidityComponent from "components/Liquidity/Add/AddLiquidityComponent";
import SEO from "components/SEO";

export default function MintPage() {
  return (
    <>
      <SEO title="Add - Soroswap" description="Soroswap Add" />
      <AddLiquidityComponent />
    </>
  );
}
