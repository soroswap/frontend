import { AutoColumn } from "components/Column";
import SEO from "../../src/components/SEO";
import { styled, useMediaQuery, useTheme } from "@mui/material";
import { Dots } from "components/Pool/styleds";
import { BodySmall, SubHeader } from "components/Text";
import { AutoRow } from "components/Row";
import { ButtonPrimary } from "components/Buttons/Button";
import { useSorobanReact } from "@soroban-react/core";
import SettingsTab from "components/Settings";
import { useRouter } from "next/router";
import { LogoContainer } from "components/Swap/PendingModalContent/Logos";
import CurrencyLogo from "components/Logo/CurrencyLogo";
import { TokenType } from "interfaces";

const PageWrapper = styled(AutoColumn)`
  position: relative;
  background: ${({ theme }) => `linear-gradient(${theme.palette.customBackground.bg2}, ${theme.palette.customBackground.bg2}) padding-box,
              linear-gradient(150deg, rgba(136,102,221,1) 0%, rgba(${theme.palette.mode == 'dark' ? "33,29,50,1" : "255,255,255,1"}) 35%, rgba(${theme.palette.mode == 'dark' ? "33,29,50,1" : "255,255,255,1"}) 65%, rgba(136,102,221,1) 100%) border-box`};
  border: 1px solid transparent;
  border-radius: 16px;
  padding: 32px;
  transition: transform 250ms ease;
  max-width: 875px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`

const LPTokensContainer = styled('div')`
  width: calc(100% + 64px);
  background-color: ${({ theme }) => theme.palette.customBackground.surface};
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 32px;
  gap: 24px;
`

const LPPercentage = styled('div')`
  border: 1px solid #8866DD;
  border-radius: 16px;
  color: #8866DD;
  font-size: 14px;
  padding: 4px 8px;
`

const LPCard = styled('div')`
  background-color: ${({theme}) => theme.palette.customBackground.bg1};
  border-radius: 16px;
  width: 100%;
  min-height: 86px;
  padding: 16px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`

const StatusWrapper = styled('div')`
  background-color: ${({ theme }) => theme.palette.customBackground.accentAction};
  font-size: 20px;
  font-weight: 600;
  padding: 16px;
  color: ${({ theme }) => theme.palette.custom.accentTextLightPrimary};
  width: 100%;
  max-width: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
`

export default function LiquidityPage() {
  const sorobanContext = useSorobanReact()
  const { address } = sorobanContext
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  const v2IsLoading = false
  const noLiquidity = false
  const isCreate = false

  const lpTokens: any | undefined = [
    {

      token_0: {
        address: "",
        symbol: "STELLR",
        name: "STELLAR",
        decimals: 7,
      },
      token_1: {
        address: "",
        symbol: "COSMLAUGH",
        name: "COSMOLAUGH",
        decimals: 7,
      },
      lpPercentage: 0.02,
      status: "Active"
    },
    {
      token_0: {
        address: "",
        symbol: "AAAA",
        name: "AAAA",
        decimals: 7,
      },
      token_1: {
        address: "",
        symbol: "BBBB",
        name: "BBBB",
        decimals: 7,
      },
      lpPercentage: 0.50,
      status: "Active"
    }
  ]
  

  return (
    <>
      <SEO title="Liquidity - Soroswap" description="Soroswap Liquidity Pool" />
      <PageWrapper>
        <div style={{width: "100%"}}>
          <AutoRow style={{justifyContent: "space-between"}}>
            <SubHeader>
              Your liquidity
            </SubHeader>
            <SettingsTab autoSlippage={0.5} />
          </AutoRow>
          <div>
            <BodySmall>List of your liquidity positions</BodySmall>
          </div>
        </div>
        {!address ? (
          <LPTokensContainer>
            <BodySmall color={theme.palette.custom.accentTextLightSecondary} textAlign="center">
              <>Connect to a wallet to view your liquidity.</>
            </BodySmall>
          </LPTokensContainer>
        ) : v2IsLoading ? (
          <LPTokensContainer>
            <BodySmall color={theme.palette.custom.accentTextLightSecondary} textAlign="center">
              <Dots>
                <>Loading</>
              </Dots>
            </BodySmall>
          </LPTokensContainer>
        ) : lpTokens ? (
          <LPTokensContainer>
          {lpTokens.map((obj: any, index: number) => (
            <LPCard key={index}>
              <AutoRow gap={'4px'}>
                <CurrencyLogo currency={obj.token_0} size={isMobile ? "16px" : "24px"} />
                <CurrencyLogo currency={obj.token_1} size={isMobile ? "16px" : "24px"} />
                <SubHeader>{obj.token_0.symbol} - {obj.token_1.symbol}</SubHeader>
                <LPPercentage>{obj.lpPercentage}%</LPPercentage>
              </AutoRow>
              <StatusWrapper>
                {obj.status}
              </StatusWrapper>
            </LPCard>
          ))} 
          </LPTokensContainer>
        ) : (
          <LPTokensContainer>
            <BodySmall color={theme.palette.custom.accentTextLightSecondary} textAlign="center">
              <>No liquidity found.</>
            </BodySmall>
          </LPTokensContainer>
        )}
        <ButtonPrimary onClick={() => router.push('/liquidity/add')}>
          + Add Liquidity
        </ButtonPrimary>
      </PageWrapper>
    </>
  );
}
