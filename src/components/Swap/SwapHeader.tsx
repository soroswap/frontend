// import { Trans } from '@lingui/macro' //This is for localization and translation on all languages
import { styled } from '@mui/material/styles';
import { RowBetween, RowFixed } from '../Row'
import { SubHeader } from '../Text';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';

const StyledSwapHeader = styled(RowBetween)(({ theme }) => ({
  marginBottom: 10,
  color: theme.palette.secondary.main,
}));

const HeaderButtonContainer = styled(RowFixed)`
  padding: 0 12px;
  gap: 16px;
`

export default function SwapHeader({
  autoSlippage,
  chainId,
  trade,
}: {
  autoSlippage?: number
  chainId?: number
  trade?: boolean
}) {
  const fiatOnRampButtonEnabled = true

  return (
    <StyledSwapHeader>
      <HeaderButtonContainer>
        <SubHeader>
          Swap
          {/* <Trans>Swap</Trans> */}
        </SubHeader>
        {fiatOnRampButtonEnabled && <SubHeader color={"#7780A0"}>
          Buy
        </SubHeader>}
      </HeaderButtonContainer>
      <RowFixed style={{padding: "6px 12px"}}>
        <TuneRoundedIcon/>
      </RowFixed>
    </StyledSwapHeader>
  )
}
