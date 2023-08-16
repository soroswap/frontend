import { AutoColumn, ColumnCenter } from "components/Column";
import SEO from "../src/components/SEO";
import CurrencyInputPanel from "components/CurrencyInputPanel";
import { ExternalLink, Plus } from "react-feather";
import { Typography, styled, useTheme } from "@mui/material";
import AppBody from "components/AppBody";
import { AddRemoveTabs } from "components/NavigationTabs";
import { Dots, Wrapper } from "components/Pool/styleds";
import Card, { BlueCard } from "components/Card";
import { BodySmall, HideSmall, SubHeader } from "components/Text";
import { CardBGImage, CardNoise, CardSection, DataCard } from "components/Earn/styled";
import { RowBetween, RowFixed } from "components/Row";
import { ButtonPrimary, ButtonSecondary } from "components/Buttons/Button";
import { useSorobanReact } from "@soroban-react/core";
import Link from "next/link";

const PageWrapper = styled(AutoColumn)`
  max-width: 640px;
  width: 100%;
`

const VoteCard = styled(DataCard)`
  background: radial-gradient(76.02% 75.41% at 1.84% 0%, #27ae60 0%, #000000 100%);
  overflow: hidden;
`

const TitleRow = styled(RowBetween)`
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
  flex-direction: column-reverse;
`

const ButtonRow = styled(RowFixed)`
  gap: 8px;
  width: 100%;
  flex-direction: row-reverse;
  justify-content: space-between;
`

const ResponsiveButtonPrimary = styled(ButtonPrimary)`
  height: 40px;
  width: fit-content;
  border-radius: 12px;
  width: 48%;
`

const ResponsiveButtonSecondary = styled(ButtonSecondary)`
  height: 40px;
  width: fit-content;
  width: 48%;
`

const EmptyProposals = styled('div')`
  border: 1px solid ${({ theme }) => theme.palette.custom.deprecated_primary4};
  padding: 16px 12px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`

const Layer2Prompt = styled(EmptyProposals)`
  margin-top: 16px;
`

export default function LiquidityPage() {
  const sorobanContext = useSorobanReact()
  const { address } = sorobanContext
  
  const v2IsLoading = false
  const noLiquidity = false
  const isCreate = false

  const theme = useTheme()
  return (
    <>
      <SEO title="Liquidity - Soroswap" description="Soroswap Liquidity Pool" />
      <PageWrapper>
        <VoteCard>
          <CardBGImage />
          <CardNoise />
          <CardSection>
            <AutoColumn gap="md">
              <RowBetween>
                <Typography fontWeight={600}>
                  <>Liquidity provider rewards</>
                </Typography>
              </RowBetween>
              <RowBetween>
                <Typography fontSize={14}>
                  <>
                    Liquidity providers earn a 0.3% fee on all trades proportional to their share of the pool. Fees
                    are added to the pool, accrue in real time and can be claimed by withdrawing your liquidity.
                  </>
                </Typography>
              </RowBetween>
              <ExternalLink
                style={{ color: '#FFFFFF', textDecoration: 'underline' }}
                target="_blank"
                href="https://docs.uniswap.org/protocol/V2/concepts/core-concepts/pools"
              >
                <Typography fontSize={14}>
                  <>Read more about providing liquidity</>
                </Typography>
              </ExternalLink>
            </AutoColumn>
          </CardSection>
          <CardBGImage />
          <CardNoise />
        </VoteCard>

        <AutoColumn gap="lg" justify="center">
          <AutoColumn gap="md" style={{ width: '100%' }}>
            <TitleRow style={{ marginTop: '1rem' }} padding="0">
              <HideSmall>
                <BodySmall style={{ marginTop: '0.5rem', justifySelf: 'flex-start' }}>
                  <>Your V2 liquidity</>
                </BodySmall>
              </HideSmall>
              <ButtonRow>
                <ResponsiveButtonPrimary padding="6px 8px">
                  <Link href="/add">
                    Create a pair
                  </Link>
                </ResponsiveButtonPrimary>
              </ButtonRow>
            </TitleRow>

            {!address ? (
              <Card padding="40px">
                <BodySmall color={theme.palette.custom.textTertiary} textAlign="center">
                  <>Connect to a wallet to view your liquidity.</>
                </BodySmall>
              </Card>
            ) : v2IsLoading ? (
              <EmptyProposals>
                <BodySmall color={theme.palette.custom.textTertiary} textAlign="center">
                  <Dots>
                    <>Loading</>
                  </Dots>
                </BodySmall>
              </EmptyProposals>
            ) : (
              <EmptyProposals>
                <BodySmall color={theme.palette.custom.textTertiary} textAlign="center">
                  <>No liquidity found.</>
                </BodySmall>
              </EmptyProposals>
            )}
          </AutoColumn>
        </AutoColumn>
      </PageWrapper>
      {/* <SwitchLocaleLink /> */}
    </>
  );
}
