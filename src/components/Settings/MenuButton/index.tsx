import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import Row from 'components/Row'
import { useUserSlippageTolerance } from 'state/user/hooks'
import { Typography, styled, useTheme } from "@mui/material"

const Icon = styled(TuneRoundedIcon)`
  height: 24px;
  width: 24px;
  margin: 8 px;
  > * {
    fill: ${({ theme }) => theme.palette.secondary.main};
  }
`

const Button = styled("button") <{ isActive: boolean }>`
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  cursor: pointer;
  outline: none;

  :not([disabled]):hover {
    opacity: 0.7;
  }

  ${({ isActive }) => isActive && `opacity: 0.7`}
`

const IconContainer = styled(Row)`
  padding: 6px 12px;
  border-radius: 16px;
`

const IconContainerWithSlippage = styled(IconContainer)`
  div {
    color: ${({ theme }) => (theme.palette.secondary.main)};
  }

  background-color: ${({ theme }) =>
    theme.palette.customBackground.surface};
`

const ButtonContent = () => {
  const [userSlippageTolerance] = useUserSlippageTolerance()

  if (userSlippageTolerance === 0.5) {
    return (
      <IconContainer>
        <Icon />
      </IconContainer>
    )
  }

  return (
    <IconContainerWithSlippage data-testid="settings-icon-with-slippage" gap="sm" >
      <Typography>{userSlippageTolerance}% slippage</Typography>

      <Icon />
    </IconContainerWithSlippage>
  )
}

export default function MenuButton({
  disabled,
  onClick,
  isActive,
}: {
  disabled: boolean
  onClick: () => void
  isActive: boolean
}) {
  return (
    <Button
      disabled={disabled}
      onClick={onClick}
      isActive={isActive}
      id="open-settings-dialog-button"
      data-testid="open-settings-dialog-button"
    >
      <ButtonContent />
    </Button>
  )
}
