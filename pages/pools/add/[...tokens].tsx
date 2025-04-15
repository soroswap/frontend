import { useSorobanReact, WalletNetwork } from 'stellar-react';
import AddLiquidityComponent from 'components/Liquidity/Add/AddLiquidityComponent';
import SEO from 'components/SEO';
import { xlmTokenList } from 'constants/xlmToken';
import { useRouter } from 'next/router';
import { passphraseToBackendNetworkName } from 'services/pairs';

export default function AddLiquidityPage() {
  const { activeNetwork } = useSorobanReact();
  const activeChain = passphraseToBackendNetworkName[activeNetwork ?? WalletNetwork.TESTNET].toLowerCase();
  const xlmToken = xlmTokenList.find((set) => set.network === activeChain)?.assets

  const router = useRouter();

  const { tokens } = router.query;

  let [tokenA, tokenB] = (tokens ?? ['null', 'null']) as string[];


  if (tokenA === 'XLM') {
    tokenA = xlmToken ? xlmToken[0].contract : tokenA
  }

  if (tokenB === 'XLM') {
    tokenB = xlmToken ? xlmToken[0].contract : tokenB
  }

  return (
    <>
      <SEO title="Add - Soroswap" description="Soroswap Add" />
      <AddLiquidityComponent currencyIdA={tokenA} currencyIdB={tokenB} />
    </>
  );
}
