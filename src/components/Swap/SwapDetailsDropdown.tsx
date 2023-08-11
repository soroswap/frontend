import { Percent } from '@uniswap/sdk-core'
import AnimatedDropdown from 'components/AnimatedDropdown'
import Column from 'components/Column'
import { LoadingOpacityContainer } from 'components/Loader/styled'
import { RowBetween, RowFixed } from 'components/Row'
import { BodySmall } from 'components/Text'
import { useState } from 'react'
import { ChevronDown } from 'react-feather'
import { InterfaceTrade } from 'state/routing/types'
import { styled, useTheme, keyframes } from "@mui/material";
import { AdvancedSwapDetails } from './AdvancedSwapDetails'
import TradePrice from './TradePrice'


//import GasEstimateTooltip from './GasEstimateTooltip'

const StyledHeaderRow = styled(RowBetween)<{ disabled: boolean; open: boolean }>`
  padding: 0;
  align-items: center;
  cursor: ${({ disabled }) => (disabled ? 'initial' : 'pointer')};
`

const RotatingArrow = styled(ChevronDown)<{ open?: boolean }>`
  transform: ${({ open }) => (open ? 'rotate(180deg)' : 'none')};
  transition: transform 0.1s linear;
`

const StyledPolling = styled('div')`
  display: flex;
  height: 16px;
  width: 16px;
  margin-right: 2px;
  margin-left: 10px;
  align-items: center;
  color: ${({ theme }) => theme.palette.text.primary};
  transition: 250ms ease color;
`

const StyledPollingDot = styled('div')`
  width: 8px;
  height: 8px;
  min-height: 8px;
  min-width: 8px;
  border-radius: 50%;
  position: relative;
  background-color: ${({ theme }) => theme.palette.customBackground.module};
  transition: 250ms ease background-color;
`

const rotate360 = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const Spinner = styled('div')`
  animation: ${rotate360} 1s cubic-bezier(0.83, 0, 0.17, 1) infinite;
  transform: translateZ(0);
  border-top: 1px solid transparent;
  border-right: 1px solid transparent;
  border-bottom: 1px solid transparent;
  border-left: 2px solid ${({ theme }) => theme.palette.text.primary};
  background: transparent;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  position: relative;
  transition: 250ms ease border-color;
  left: -3px;
  top: -3px;
`

const SwapDetailsWrapper = styled('div')`
  padding-top: ${({ theme }) => theme.palette.customBackground.module};
`

const Wrapper = styled(Column)`
  border: 1px solid ${({ theme }) => theme.palette.secondary.main};
  border-radius: 16px;
  padding: 12px 16px;
`

interface SwapDetailsInlineProps {
  trade?: any
  syncing: boolean
  loading: boolean
  allowedSlippage: Percent
}

export default function SwapDetailsDropdown({ trade, syncing, loading, allowedSlippage }: SwapDetailsInlineProps) {
  const theme = useTheme()
  const [showDetails, setShowDetails] = useState(false)

  return (
    <Wrapper>
        <StyledHeaderRow
          data-testid="swap-details-header-row"
          onClick={() => setShowDetails(!showDetails)}
          disabled={!trade}
          open={showDetails}
        >
          <RowFixed>
            {Boolean(loading || syncing) && (
              <StyledPolling>
                <StyledPollingDot>
                  <Spinner />
                </StyledPollingDot>
              </StyledPolling>
            )}
            {trade ? (
              <LoadingOpacityContainer $loading={syncing} data-testid="trade-price-container">
                {<TradePrice price={trade.executionPrice} />
                }   
              </LoadingOpacityContainer>
            ) : loading || syncing ? (
              <BodySmall>
                Fetching best price...
              </BodySmall>
            ) : null}
          </RowFixed>
          <RowFixed>
            {!showDetails //&& <GasEstimateTooltip trade={trade} loading={syncing || loading} />
            }
            <RotatingArrow
              stroke={trade ? theme.palette.text.secondary : theme.palette.text.primary}
              open={Boolean(trade && showDetails)}
            />
          </RowFixed>
        </StyledHeaderRow>
      {trade && (
        <AnimatedDropdown open={showDetails}>
          <SwapDetailsWrapper data-testid="advanced-swap-details">
            {//<AdvancedSwapDetails trade={trade} allowedSlippage={allowedSlippage} syncing={syncing} />
            }
          </SwapDetailsWrapper>
        </AnimatedDropdown>
      )}
    </Wrapper>
  )
}
