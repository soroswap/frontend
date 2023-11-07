import SEO from 'components/SEO';
import { SwapComponent } from 'components/Swap/SwapComponent';
import { Field } from 'state/swap/actions';

export default function SwapPage({ className }: { className?: string }) {
  // const { chainId: connectedChainId } = useWeb3React()
  // const loadedUrlParams = useDefaultsFromURLSearch()

  // const location = useLocation()

  //TODO: Use pathname to get prefilled tokens
  // {
  //   [Field.INPUT]: { currencyId: loadedUrlParams?.[Field.INPUT]?.currencyId },
  //   [Field.OUTPUT]: { currencyId: loadedUrlParams?.[Field.OUTPUT]?.currencyId },
  // }

  const prefilledState = {
    [Field.INPUT]: { currencyId: 'CC5HHVS5EGDBF7XR5PKJSPXFGR6KZ7NU3GV4LHC62MII4FM3CXOOQOUV' }, //TODO: This is the hardcoded default token, should we get it from the api? maybe show the native token address from stellar (XLM)
    [Field.OUTPUT]: { currencyId: null },
  };

  return (
    <>
      <SEO title="Swap - Soroswap" description="Soroswap Swap" />
      <SwapComponent prefilledState={prefilledState} />
    </>
  );
}
