import { Box } from 'soroswap-ui';
import { Clipboard } from 'react-feather';
import { LabelSmall } from 'components/Text';
import { SnackbarIconType } from 'contexts';
import { WalletNetwork } from 'stellar-react';
import { useEffect, useState } from 'react';
import { useSorobanReact } from 'stellar-react';
import CopyToClipboard from 'react-copy-to-clipboard';
import Row from 'components/Row';
import useNotification from 'hooks/useNotification';

enum ExplorerType {
  STELLAR_EXPERT = 'STELLAR_EXPERT',
  STELLAR_CHAIN = 'STELLAR_CHAIN',
}

interface ExplorerLinks {
  stellarExpert: string;
  stellarChain: string;
}

const CopyTxHash = ({ txHash }: { txHash: string }) => {
  const { notify } = useNotification();

  const sorobanContext = useSorobanReact();
  const { activeNetwork } = sorobanContext;

  const [explorersLinks, setExplorersLinks] = useState<ExplorerLinks | undefined>(undefined);

  useEffect(() => {
    if (!sorobanContext || !activeNetwork) return;

    if (activeNetwork === WalletNetwork.TESTNET) {
      setExplorersLinks({
        stellarExpert: `https://stellar.expert/explorer/testnet/tx/${txHash}`,
        stellarChain: `https://testnet.stellarchain.io/transactions/${txHash}`,
      });
    }

    if (activeNetwork === WalletNetwork.PUBLIC) {
      setExplorersLinks({
        stellarExpert: `https://stellar.expert/explorer/public/tx/${txHash}`,
        stellarChain: `https://stellarchain.io/transactions/${txHash}`,
      });
    }
  }, [sorobanContext, txHash]);

  return (
    <Box display="flex" alignItems="center" flexDirection="column" sx={{ mt: 1 }}>
      {(explorersLinks?.stellarChain && explorersLinks.stellarExpert) && (
        <>
          <LabelSmall style={{ cursor: 'pointer' }}>
            <a href={explorersLinks?.stellarExpert}
              target='_blank'>
              View on Stellar.Expert
            </a>
          </LabelSmall>
          <LabelSmall style={{ cursor: 'pointer' }}>
            <a href={explorersLinks?.stellarChain}
              target='_blank'>
              View on StellarChain.io
            </a>
          </LabelSmall>
        </>
      )}
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
    </Box>
  );
};

export default CopyTxHash;
