import { Swap } from '../src/components/Swap';
import SEO from '../src/components/SEO';

export default function SwapPage() {

  return (
    <>
      <SEO title='Swap - Soroswap' description='Soroswap Swap' />
      <Swap balancesBigNumber={undefined} />
    </>
  )
}
