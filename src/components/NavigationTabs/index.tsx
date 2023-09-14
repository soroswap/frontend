// import { Trans } from '@lingui/macro'
// import { Percent } from '@uniswap/sdk-core'
// import { useWeb3React } from '@web3-react/core'
// import { ReactNode } from 'react'
// import { ArrowLeft } from 'react-feather'
// import { Link as HistoryLink, useLocation } from 'react-router-dom'
// import { useAppDispatch } from 'state/hooks'
// import { resetMintState } from 'state/mint/actions'
// import { resetMintState as resetMintV3State } from 'state/mint/v3/actions'
// import { ThemedText } from 'theme'
// import { flexRowNoWrap } from 'theme/styles'

import { Box, styled, useTheme } from "@mui/material"
import Row, { RowBetween, RowFixed } from "components/Row"
import SettingsTab from "components/Settings"
import { SubHeader } from "components/Text"
// import { SubHeader } from "components/Text"
import Link from "next/link"
import { ReactNode } from "react"
import { ArrowLeft, Settings } from "react-feather"
import { flexRowNoWrap } from "themes/styles"

// import Row, { RowBetween } from '../Row'
// import SettingsTab from '../Settings'

const Tabs = styled('div')`
  ${flexRowNoWrap};
  align-items: center;
  border-radius: 3rem;
  justify-content: space-evenly;
`

const StyledHistoryLink = styled(Link) <{ flex?: string }>`
  flex: ${({ flex }) => flex ?? 'none'};
`

// const ActiveText = styled('div')`
//   font-weight: 500;
//   font-size: 20px;
// `

const StyledArrowLeft = styled(ArrowLeft)`
  color: ${({ theme }) => theme.palette.primary.main};
`

// export function FindPoolTabs({ origin }: { origin: string }) {
//   return (
//     <Tabs>
//       <RowBetween style={{ padding: '1rem 1rem 0 1rem', position: 'relative' }}>
//         <Link href={origin}>
//           <StyledArrowLeft />
//         </Link>
//         <ActiveText style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
//           Import V2 Pool
//         </ActiveText>
//       </RowBetween>
//     </Tabs>
//   )
// }

export function AddRemoveTabs({
  adding,
  creating,
  autoSlippage,
  positionID,
  children,
}: {
  adding: boolean
  creating: boolean
  autoSlippage: any//Percent
  positionID?: string
  showBackLink?: boolean
  children?: ReactNode
}) {
  const theme = useTheme()
  // reset states on back
  // const dispatch = useAppDispatch()
  // const location = useLocation()

  // detect if back should redirect to v3 or v2 pool page
  // const poolLink = location.pathname.includes('add/v2')
  //   ? '/pools/v2'
  //   : '/pools' + (positionID ? `/${positionID.toString()}` : '')

  return (
    <Tabs>
      <RowBetween style={{ padding: '1rem 1rem 0 1rem' }}>
        <StyledHistoryLink
          href={"/liquidity"}
          // onClick={() => {
          //   if (adding) {
          //     // not 100% sure both of these are needed
          //     dispatch(resetMintState())
          //     dispatch(resetMintV3State())
          //   }
          // }}
          flex={children ? '1' : undefined}
        >
          <StyledArrowLeft stroke={theme.palette.secondary.main} />
        </StyledHistoryLink>
        <SubHeader
          fontWeight={500}
          fontSize={20}
          style={{ flex: '1', margin: 'auto', textAlign: children ? 'start' : 'center' }}
        >
          {creating ? (
            <>Create a pair</>
          ) : adding ? (
            <>Add Liquidity</>
          ) : (
            <>Remove Liquidity</>
          )}
        </SubHeader>
        <Box style={{ marginRight: '.5rem' }}>{children}</Box>
        <RowFixed style={{ padding: "6px 12px" }}>
          <SettingsTab autoSlippage={0.5} />
        </RowFixed>
      </RowBetween>
    </Tabs>
  )
}

// export function CreateProposalTabs() {
//   return (
//     <Tabs>
//       <Row style={{ padding: '1rem 1rem 0 1rem' }}>
//         <Link href="/vote">
//           <StyledArrowLeft />
//         </Link>
//         <ActiveText style={{ marginLeft: 'auto', marginRight: 'auto' }}>Create Proposal</ActiveText>
//       </Row>
//     </Tabs>
//   )
// }
