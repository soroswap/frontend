import { CircularProgress, Typography, styled } from '@mui/material';
import CardContent from '@mui/material/CardContent';
import { useMintTestToken } from 'hooks/useMintTestToken';
import { ButtonPrimary } from './Buttons/Button';
import { AutoColumn } from './Column';
import useGetMyBalances from 'hooks/useGetMyBalances';

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
  const { sorobanContext, tokens, tokenBalancesResponse, isLoading, isError } = useGetMyBalances();

  const isMintDisabled = Number(tokenBalancesResponse?.balances[0].balance) > 0;

  const mintTestTokens = useMintTestToken();

  const handleMint = () => {
    mintTestTokens();
  };

  return (
    <PageWrapper>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Balances
        </Typography>

        {sorobanContext.address && tokens.length > 0 ? (
          <>
            {isLoading && <CircularProgress />}
            {tokenBalancesResponse?.balances?.map((tokenBalance) => (
              <p key={tokenBalance.address}>
                {tokenBalance.symbol} : {tokenBalance.balance as string}
              </p>
            ))}
          </>
        ) : (
          <div>Connect your Wallet</div>
        )}

        <ButtonPrimary onClick={handleMint} disabled={isMintDisabled}>
          Mint test tokens
        </ButtonPrimary>
      </CardContent>
    </PageWrapper>
  );
}
