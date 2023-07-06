import { Balances } from "../src/components/Balances";
import SEO from "../src/components/SEO";

export default function Home() {
  return (
    <>
      <SEO title="Soroswap" description="Soroswap Index" />
      <Balances />
    </>
  );
}
