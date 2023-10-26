import { Typography, styled } from "@mui/material";
import CardContent from "@mui/material/CardContent";
import { useSorobanReact } from "@soroban-react/core";
import { tokenBalances, tokenBalancesType } from "hooks";
import { useMintTestToken } from "hooks/useMintTestToken";
import { useEffect, useState } from "react";
import { useTokens } from "../hooks/useTokens";
import { ButtonPrimary } from "./Buttons/Button";
import { AutoColumn } from "./Column";

const PageWrapper = styled(AutoColumn)`
  position: relative;
  background: ${({ theme }) => `linear-gradient(${theme.palette.customBackground.bg2}, ${theme.palette.customBackground.bg2}) padding-box,
              linear-gradient(150deg, rgba(136,102,221,1) 0%, rgba(${theme.palette.mode == 'dark' ? "33,29,50,1" : "255,255,255,1"}) 35%, rgba(${theme.palette.mode == 'dark' ? "33,29,50,1" : "255,255,255,1"}) 65%, rgba(136,102,221,1) 100%) border-box`};
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
`

export function Balances() {
  const sorobanContext = useSorobanReact();
  const tokens = useTokens(sorobanContext);

  // State to hold token balances
  const [tokenBalancesResponse, setTokenBalancesResponse] = useState<tokenBalancesType | undefined>();

  //Disable Mint Test Tokens if already minted
  const [mintDisabled, setMintDisabled] = useState(true)

  // Effect to fetch token balances
  useEffect(() => {
    if (sorobanContext.activeChain && sorobanContext.address && tokens.length > 0) {
      tokenBalances(sorobanContext.address, tokens, sorobanContext, true).then((resp) => {
        setTokenBalancesResponse(resp);
        if (Number(resp?.balances[0].balance) > 0) {
          setMintDisabled(true)
        } else {
          setMintDisabled(false)
        }
      });
    }
  }, [sorobanContext, tokens]);
  
  
  const mintTestTokens = useMintTestToken()
  const handleMint = () => {
    setMintDisabled(true)
    mintTestTokens()
  }


  return (
    <PageWrapper>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          Balances
        </Typography>
        {sorobanContext.address && tokens.length > 0 ? (
          <>
            {tokenBalancesResponse?.balances?.map((tokenBalance) => (
              <p key={tokenBalance.address}>
                {tokenBalance.symbol} : {tokenBalance.balance as string}
              </p>
            ))}
          </>
        ) : (
          <div>Connect your Wallet</div>
        )}

        <ButtonPrimary onClick={handleMint} disabled={mintDisabled}>
          Mint test tokens
        </ButtonPrimary>
      </CardContent>
    </PageWrapper>
  );
}
