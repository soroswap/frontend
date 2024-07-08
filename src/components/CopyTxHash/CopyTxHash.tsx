import { Box } from 'soroswap-ui';
import { Clipboard } from 'react-feather';
import { LabelSmall } from 'components/Text';
import { SnackbarIconType } from 'contexts';
import { testnet, mainnet } from '@soroban-react/chains';
import { useEffect, useState } from 'react';
import { useSorobanReact } from '@soroban-react/core';
import { WalletChain } from '@soroban-react/types';
import CopyToClipboard from 'react-copy-to-clipboard';
import Row from 'components/Row';
import useNotification from 'hooks/useNotification';

const getExplorerUrl = ({ chain, txHash }: { chain: WalletChain; txHash: string }) => {
  if (chain.name === testnet.name) {
    return `https://testnet.stellarchain.io/transactions/${txHash}`;
  }

  if (chain.name === mainnet.name) {
    return `https://stellarchain.io/transactions/${txHash}`;
  }
};

const CopyTxHash = ({ txHash }: { txHash: string }) => {
  const { notify } = useNotification();

  const sorobanContext = useSorobanReact();

  const [explorerLink, setExplorerLink] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!sorobanContext) return;

    const activeChain = sorobanContext.activeChain;

    if (!activeChain) return;

    if (activeChain.name === testnet.name || activeChain.name === mainnet.name) {
      setExplorerLink(getExplorerUrl({ chain: activeChain, txHash }));
    }
  }, [sorobanContext, txHash]);

  const handleClickViewOnExplorer = () => {
    if (!explorerLink) return;

    window.open(explorerLink, '_blank');
  };
  return (
    <Box display="flex" alignItems="center" flexDirection="column">
      <CopyToClipboard
        text={txHash}
        onCopy={() =>
          notify?.({
            message: 'Transaction hash copied to clipboard',
            title: 'Copied',
            type: SnackbarIconType.SWAP,
          })
        }
      >
        <Row alignItems="center" gap="6px" style={{ cursor: 'pointer' }}>
          <LabelSmall>Copy transaction hash</LabelSmall>
          <Clipboard color="white" size="16px" />
        </Row>
      </CopyToClipboard>
      {explorerLink && (
        <LabelSmall style={{ cursor: 'pointer' }} onClick={handleClickViewOnExplorer}>
          View on explorer
        </LabelSmall>
      )}
    </Box>
  );
};

export default CopyTxHash;
