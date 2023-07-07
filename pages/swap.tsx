import SEO from "../src/components/SEO";
import { ChooseTokens } from "../src/components/ChooseTokens";

export default function SwapPage() {
  return (
    <>
      <SEO title="Swap - Soroswap" description="Soroswap Swap" />
      <ChooseTokens isLiquidity={false} />
    </>
  );
}
