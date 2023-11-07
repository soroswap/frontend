import { Clipboard } from 'react-feather';
import { LabelSmall } from 'components/Text';
import { SnackbarIconType } from 'contexts';
import CopyToClipboard from 'react-copy-to-clipboard';
import Row from 'components/Row';
import useNotification from 'hooks/useNotification';

const CopyTxHash = ({ txHash }: { txHash: string }) => {
  const { notify } = useNotification();
  return (
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
  );
};

export default CopyTxHash;
