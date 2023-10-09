// import { Trans } from '@lingui/macro' //This is for localization and translation on all languages
import { styled, useTheme } from '@mui/material/styles';
import Link from "next/link";
import { ArrowLeft } from 'react-feather';
import { RowBetween, RowFixed } from '../Row';
import SettingsTab from '../Settings/index';
import { SubHeader } from '../Text';

const StyledSwapHeader = styled(RowBetween)(({ theme }) => ({
  marginBottom: 10,
  color: theme.palette.secondary.main,
}));

const StyledHistoryLink = styled(Link) <{ flex?: string }>`
  flex: ${({ flex }) => flex ?? 'none'};
`

const StyledArrowLeft = styled(ArrowLeft)`
  color: ${({ theme }) => theme.palette.primary.main};
`

export default function LiquidityHeader({
  adding,
  creating,
}: {
  adding?: boolean
  creating?: boolean
}) {
  const theme = useTheme()

  return (
    <StyledSwapHeader>
      <StyledHistoryLink
        href={"/liquidity"}
        // onClick={() => {
        //   if (adding) {
        //     // not 100% sure both of these are needed
        //     dispatch(resetMintState())
        //     dispatch(resetMintV3State())
        //   }
        // }}
      >
        <StyledArrowLeft stroke={theme.palette.secondary.main} />
      </StyledHistoryLink>
      <SubHeader
        fontWeight={500}
        fontSize={20}
      >
        {creating ? (
          <>Create a pair</>
        ) : adding ? (
          <>Add Liquidity</>
        ) : (
          <>Remove Liquidity</>
        )}
      </SubHeader>
      <RowFixed style={{ padding: "6px 12px" }}>
        <SettingsTab autoSlippage={0.5} />
      </RowFixed>
    </StyledSwapHeader>
  )
}
