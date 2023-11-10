import { Box } from '@mui/material';
import { Clipboard } from 'react-feather';
import { LabelSmall } from 'components/Text';
import { SnackbarIconType } from 'contexts';
import { testnet, public_chain } from '@soroban-react/chains';
import { useEffect, useState } from 'react';
import { useSorobanReact } from '@soroban-react/core';
import CopyToClipboard from 'react-copy-to-clipboard';
import Row from 'components/Row';
import useNotification from 'hooks/useNotification';

const getExplorerUrl = ({ chain, txHash }: { chain: string; txHash: string }) => {
  return `https://stellar.expert/explorer/${chain}/tx/${txHash}`;
};

const CopyTxHash = ({ txHash }: { txHash: string }) => {
  const { notify } = useNotification();

  const sorobanContext = useSorobanReact();

  const [explorerLink, setExplorerLink] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!sorobanContext) return;

    const activeChain = sorobanContext.activeChain;

    if (!activeChain) return;

    if (activeChain.name === testnet.name || activeChain.name === public_chain.name) {
      setExplorerLink(getExplorerUrl({ chain: activeChain.name?.toLowerCase() as string, txHash }));
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
