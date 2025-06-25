// import { Asset } from '@stellar/stellar-sdk';
// import CurrencyLogo from 'components/Logo/CurrencyLogo';
// import { useGetBridgeAssetInfo } from 'hooks/bridge/pendulum/useGetBridgeAssetInfo';
// import { Box, Typography } from 'soroswap-ui';
// import { BridgeChains } from './BridgeComponent';

// export const BridgeAssetItem = ({
//   asset,
//   chain,
//   ...rest
// }: {
//   asset: Asset | undefined;
//   chain: BridgeChains | null;
//   [key: string]: any;
// }) => {
//   const { code, token } = useGetBridgeAssetInfo({ asset, chain });

//   return (
//     <Box display="flex" gap={1} {...rest}>
//       <CurrencyLogo currency={token} size="24px" />
//       <Typography variant="body1">{code}</Typography>
//     </Box>
//   );
// };

// export default BridgeAssetItem;
