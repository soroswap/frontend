import { Trans } from '@lingui/macro'
import { AlertTriangle, Slash } from 'react-feather'

import { MouseoverTooltip } from '../../components/Tooltip'
import { styled, useTheme } from '@mui/material'

const BadgeWrapper = styled('div')`
  font-size: 14px;
  display: flex;
  justify-content: flex-end;
`

const BadgeText = styled('div')`
  font-weight: 500;
  font-size: 12px;
  line-height: 14px;
  margin-right: 8px;
`

const ActiveDot = styled('span')`
  background-color: ${({ theme }) => theme.palette.customBackground.accentSuccess};
  border-radius: 50%;
  height: 8px;
  width: 8px;
`

const LabelText = styled('div')<{ color: string }>`
  align-items: center;
  color: ${({ color }) => color};
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
`

export default function RangeBadge({ removed, inRange }: { removed?: boolean; inRange?: boolean }) {
  const theme = useTheme()
  return (
    <BadgeWrapper>
      {removed ? (
        <MouseoverTooltip title={"Your position has 0 liquidity, and is not earning fees."}>
          <LabelText color={theme.palette.secondary.main}>
            <BadgeText>
              Closed
            </BadgeText>
            <Slash width={12} height={12} />
          </LabelText>
        </MouseoverTooltip>
      ) : inRange ? (
        <MouseoverTooltip
          title="The price of this pool is within your selected range. Your position is currently earning fees."
        >
          <LabelText color={theme.palette.customBackground.accentSuccess}>
            <BadgeText>
              In Range
            </BadgeText>
            <ActiveDot />
          </LabelText>
        </MouseoverTooltip>
      ) : (
        <MouseoverTooltip
          title="The price of this pool is outside of your selected range. Your position is not currently earning fees."
        >
          <LabelText color={theme.palette.customBackground.accentWarning}>
            <BadgeText>
              Out of range
            </BadgeText>
            <AlertTriangle width={12} height={12} />
          </LabelText>
        </MouseoverTooltip>
      )}
    </BadgeWrapper>
  )
}
