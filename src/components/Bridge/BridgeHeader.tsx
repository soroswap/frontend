// import { Trans } from '@lingui/macro' //This is for localization and translation on all languages
import { useBalance, useInkathon } from '@scio-labs/use-inkathon';
import { shortenAddress } from 'helpers/address';
import { styled, useTheme } from 'soroswap-ui';
import { Button, Grid, Typography, useMediaQuery, Tooltip } from 'soroswap-ui';
import { HeaderChip } from 'components/Layout/ProfileSection';
import { RowBetween, RowFixed } from '../Row';
import { SubHeader } from '../Text';
import { useSorobanReact } from 'stellar-react';
import { ArrowDropDownSharp } from '@mui/icons-material';
import useGetNativeTokenBalance from 'hooks/useGetNativeTokenBalance';
import BigNumber from 'bignumber.js';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import useNotification from 'hooks/useNotification';
import { SnackbarIconType } from 'contexts';
const StyledBridgeHeader = styled(RowBetween)(({ theme }) => ({
  marginBottom: 10,
  color: theme.palette.secondary.main,
}));

const HeaderButtonContainer = styled(RowFixed)`
  padding: 12px 12px;
  gap: 16px;
`;

interface Chains {
  name: string;
  address: string;
  balance: string;
}

const HeaderChainData = (props: any) => {
  const chains: Chains[] = props.chains;
  const { notify } = useNotification();

  const Wrapper = styled(Grid)`
    background: ${({ theme }) => theme.palette.background.default};
    border-radius: 16px;
    padding: 12px 16px;
    overflow: hidden;
  `;

  return (
    <Wrapper container>
      <Grid container xs={12}>
        <Grid item xs={4}>
          <Typography color={'#fdfdfe'} variant={'body2'}>
            Chain name
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography color={'#fdfdfe'} textAlign={'center'} variant={'body2'}>
            Address
          </Typography>
        </Grid>
        <Grid item xs={4}>
          <Typography color={'#fdfdfe'} textAlign={'end'} variant={'body2'}>
            Balance
          </Typography>
        </Grid>
      </Grid>
      {chains.map((chain: Chains, index: number) => (
        <>
          <Grid item xs={4}>
            <Typography variant={'caption'}>{chain.name}</Typography>
          </Grid>
          <Grid item xs={4} textAlign={'center'}>
            <CopyToClipboard
              text={chain.address}
              onCopy={() =>
                notify?.({
                  message: `${chain.name} address copied to clipboard!`,
                  title: 'Copied',
                  type: SnackbarIconType.MINT,
                })
              }
            >
              <Tooltip title={chain.address} followCursor arrow>
                <Button size="small" variant="text">
                  {shortenAddress(chain.address)}
                </Button>
              </Tooltip>
            </CopyToClipboard>
          </Grid>
          <Grid item xs={4} textAlign={'end'}>
            <Typography variant={'caption'}>{chain.balance}</Typography>
          </Grid>
        </>
      ))}
    </Wrapper>
  );
};

export default function BridgeHeader() {
  const { isConnected, activeAccount, error, activeChain, isConnecting, disconnect } =
    useInkathon();
  const { address } = useSorobanReact();
  const { data } = useGetNativeTokenBalance();

  const formattedNativeBalance = () => {
    const rawAmount = data?.data;
    const parsedAmount = new BigNumber(rawAmount!).dividedBy(10 ** 7).toFixed(7);
    return `${parsedAmount} XLM`;
  };

  const { balanceFormatted } = useBalance(activeAccount?.address, true);
  const theme = useTheme();
  const fiatOnRampButtonEnabled = true;
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const chainsInfo = [
    {
      name: activeChain?.name,
      address: activeAccount?.address,
      balance: balanceFormatted,
    },
    {
      name: 'Stellar',
      address: address,
      balance: formattedNativeBalance(),
    },
  ];

  return (
    <StyledBridgeHeader>
      <Grid container rowSpacing={2}>
        <Grid item xs={12}>
          <HeaderButtonContainer>
            <SubHeader fontSize={isMobile ? 14 : undefined}>Bridge</SubHeader>
          </HeaderButtonContainer>
        </Grid>
        {activeAccount && activeChain && address && (
          <>
            <HeaderChainData chains={[...chainsInfo]} />
          </>
        )}
      </Grid>
    </StyledBridgeHeader>
  );
}
