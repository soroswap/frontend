import { Box, CircularProgress, Paper, Typography, styled } from '@mui/material';
import { AppContext } from 'contexts';
import useGetMyBalances from 'hooks/useGetMyBalances';
import { useMintTestToken } from 'hooks/useMintTestToken';
import { TokenType } from 'interfaces';
import { useContext, useState } from 'react';
import { Networks } from 'stellar-sdk';
import BalancesTable from './BalancesTable/BalancesTable';
import { ButtonPrimary } from './Buttons/Button';
import { WalletButton } from './Buttons/WalletButton';
import { MintCustomToken } from './MintCustomToken';

const PageWrapper = styled(Paper)`
  background: ${({ theme }) => `linear-gradient(${theme.palette.customBackground.bg2}, ${
    theme.palette.customBackground.bg2
  }) padding-box,
              linear-gradient(150deg, rgba(136,102,221,1) 0%, rgba(${
                theme.palette.mode == 'dark' ? '33,29,50,1' : '255,255,255,1'
              }) 35%, rgba(${
                theme.palette.mode == 'dark' ? '33,29,50,1' : '255,255,255,1'
              }) 65%, rgba(136,102,221,1) 100%) border-box`};
  border: 1px solid transparent;
  border-radius: 16px;
  padding: 32px 48px;
  width: 100%;
  max-width: 860px;
`;

export function Balances() {
  const { sorobanContext, refetch } = useGetMyBalances();

  const isMainnet = sorobanContext.activeChain?.networkPassphrase === Networks.PUBLIC;

  const mintTestTokens = useMintTestToken();
  const { ConnectWalletModal } = useContext(AppContext);
  const { isConnectWalletModalOpen, setConnectWalletModalOpen } = ConnectWalletModal;

  const [currentMintingToken, setCurrentMintingToken] = useState<TokenType | null>(null);
  const [isMinting, setIsMinting] = useState(false);

  const handleMint = () => {
    setIsMinting(true);
    mintTestTokens({
      onTokenMintedStart(token) {
        setCurrentMintingToken(token);
      },
      onTokenMintedSuccess(token) {
        setCurrentMintingToken(null);
        refetch();
      },
      onTokenMintedError(token) {
        setCurrentMintingToken(null);
      },
    }).finally(() => {
      setIsMinting(false);
    });
  };

  const getButtonTxt = () => {
    if (isMinting)
      return (
        <Box display="flex" alignItems="center" gap="6px">
          Minting {currentMintingToken?.code} <CircularProgress size="18px" />
        </Box>
      );
    return `Mint test tokens`;
  };

  const isButtonDisabled = () => {
    if (isMinting) return true;
    return false;
  };

  return (
    <PageWrapper>
      {!sorobanContext.address ? (
        <>
          <Typography gutterBottom variant="h5">
            {"Your token's balance:"}
          </Typography>
          <Typography gutterBottom>Connect your wallet to see your tokens balances</Typography>
          <WalletButton />
        </>
      ) : (
        <>
          <Box
            display="flex"
            flexWrap="wrap"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography gutterBottom variant="h5">
              {"Your token's balance:"}
            </Typography>
            {!isMainnet && (
              <ButtonPrimary
                onClick={handleMint}
                disabled={isButtonDisabled()}
                style={{ maxWidth: 250 }}
              >
                {getButtonTxt()}
              </ButtonPrimary>
            )}
          </Box>
          <Box>
            <BalancesTable />
          </Box>
        </>
      )}

      {sorobanContext.address && !isMainnet && <MintCustomToken />}
    </PageWrapper>
  );
}
