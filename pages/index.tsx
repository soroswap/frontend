import { SwapComponent } from 'components/Swap/SwapComponent';
import SEO from '../src/components/SEO';

export default function Home() {
  return (
    <>
      <SEO title="Soroswap" description="Soroswap Index" data-testid="SEO" />
      <SwapComponent />
    </>
  );
}
