import { Asset } from 'stellar-sdk';
import { Box, Typography } from '@mui/material';
import { BridgeChains } from './BridgeComponentNew';
import { useGetBridgeAssetInfo } from 'hooks/bridge/pendulum/useGetBridgeAssetInfo';
import CurrencyLogo from 'components/Logo/CurrencyLogo';

export const BridgeAssetItem = ({
  asset,
  chain,
  ...rest
}: {
  asset: Asset | undefined;
  chain: BridgeChains | null;
  [key: string]: any;
}) => {
  const { code, token } = useGetBridgeAssetInfo({ asset, chain });

  return (
    <Box display="flex" gap={1} {...rest}>
      <CurrencyLogo currency={token} size="24px" />
      <Typography variant="body1">{code}</Typography>
    </Box>
  );
};

export default BridgeAssetItem;
