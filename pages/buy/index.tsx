import { useSorobanReact } from '@soroban-react/core';
import { BuyComponent } from 'components/Buy/BuyComponent';
import SEO from 'components/SEO';
import { xlmTokenList } from 'constants/xlmToken';
import { useEffect, useState } from 'react';

export default function BuyPage() {
  const { activeChain } = useSorobanReact();
  const [xlmToken, setXlmToken] = useState<string | null>(null);

  useEffect(() => {
    const newXlmToken =
      xlmTokenList.find((tList) => tList.network === activeChain?.id)?.assets[0].contract ?? null;
    setXlmToken(newXlmToken);
  }, [activeChain, xlmToken]);

  return (
    <>
      <SEO title="Buy - Soroswap" description="Soroswap Buy" />
      {xlmToken && <BuyComponent />}

    </>
  );
}
