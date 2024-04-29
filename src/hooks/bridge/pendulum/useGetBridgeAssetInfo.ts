import { Asset } from 'stellar-sdk';
import { BridgeChains } from 'components/Bridge/BridgeComponent';
import { useSorobanReact } from '@soroban-react/core';
import { SpacewalkCodeToSymbol } from './useSpacewalkVaults';
import { useAllTokens } from 'hooks/tokens/useAllTokens';

interface UseGetAssetInfoProps {
  asset: Asset | undefined;
  chain: BridgeChains | null;
}

export const useGetBridgeAssetInfo = ({ asset, chain }: UseGetAssetInfoProps) => {
  const { tokensAsMap } = useAllTokens();
  const sorobanContext = useSorobanReact();

  const passphrase = sorobanContext.activeChain?.networkPassphrase;

  const getAssetCode = () => {
    if (!asset) return undefined;

    const code = SpacewalkCodeToSymbol?.[asset?.code] || asset?.code;

    if (chain === BridgeChains.PENDULUM) {
      return `${code}.s`;
    }

    return code;
  };

  const getTokenFromAsset = () => {
    if (!asset || !passphrase) return null;

    const assetContract = asset.contractId(passphrase);

    const token = tokensAsMap[assetContract];

    return token ?? { code: getAssetCode(), contract: assetContract };
  };

  return {
    code: getAssetCode(),
    token: getTokenFromAsset(),
  };
};
