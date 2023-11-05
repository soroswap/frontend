import { CircularProgress, Typography, styled } from '@mui/material';
import CardContent from '@mui/material/CardContent';
import { useMintTestToken } from 'hooks/useMintTestToken';
import { ButtonPrimary } from './Buttons/Button';
import { AutoColumn } from './Column';
import useGetMyBalances from 'hooks/useGetMyBalances';
import { useContext, useState } from 'react';
import { TokenType } from 'interfaces';
import CurrencyLogo from './Logo/CurrencyLogo';
import { AppContext } from 'contexts';

const PageWrapper = styled(AutoColumn)`
  position: relative;
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
  padding: 32px;
  transition: transform 250ms ease;
  max-width: 400px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`;

export function Balances() {
  const { sorobanContext, tokens, tokenBalancesResponse, isLoading, isError, refetch } =
    useGetMyBalances();

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

  return (
    <PageWrapper>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Your Balances:
        </Typography>

        {sorobanContext.address && tokens.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {isLoading && <CircularProgress size="24px" />}
            {tokenBalancesResponse?.balances?.map((tokenBalance) => (
              <div key={tokenBalance.address} style={{ display: 'flex', alignItems: 'center' }}>
                <CurrencyLogo
                  currency={tokens.find((token) => token.address === tokenBalance.address)}
                  size={'16px'}
                  style={{ marginRight: '8px' }}
                />
                {currentMintingToken?.address === tokenBalance.address ? (
                  <CircularProgress size="12px" />
                ) : (
                  <p>
                    {tokenBalance.symbol} : {tokenBalance.balance as string}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {!sorobanContext.address ? (
          <>
            <Typography gutterBottom>
              Connect your wallet to see your test tokens balances
            </Typography>
            <ButtonPrimary
              onClick={() => setConnectWalletModalOpen(true)}
              style={{ marginTop: '24px' }}
            >
              Connect Wallet
            </ButtonPrimary>
          </>
        ) : (
          <ButtonPrimary onClick={handleMint} disabled={isMinting} style={{ marginTop: '24px' }}>
            {isMinting ? `Minting ${currentMintingToken?.symbol}` : `Mint test tokens`}
          </ButtonPrimary>
        )}
      </CardContent>
    </PageWrapper>
  );
}
