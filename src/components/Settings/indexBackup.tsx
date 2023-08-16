import { AutoColumn } from 'components/Column'
import { useRef } from 'react'
import { InterfaceTrade } from 'state/routing/types'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import { styled } from '@mui/material/styles';

// import MaxSlippageSettings from './MaxSlippageSettings'
// import MenuButton from './MenuButton'

const Menu = styled("div")`
  position: relative;
`
export const Divider = styled("div")(({ theme }) => ({
  width: "100%",
  height: "1px",
  borderWidth: 0,
  margin: 0,
  backgroundColor: theme.palette.secondary.main,
}))

// export const Divider = styled("div")`
//   width: 100%;
//   height: 1px;
//   border-width: 0;
//   margin: 0;
//   background-color: ${({ theme }) => theme.customBackground};
// `



// const MenuFlyout = styled(AutoColumn)`
//   min-width: 20.125rem;
//   background-color: ${({ theme }) => theme.customBackground};
//   border: 1px solid ${({ theme }) => theme.customBackground};
//   box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
//     0px 24px 32px rgba(0, 0, 0, 0.01);
//   border-radius: 12px;
//   position: absolute;
//   top: 100%;
//   margin-top: 10px;
//   right: 0;
//   z-index: 100;
//   color: ${({ theme }) => theme.textPrimary};
//   ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToMedium`
//     min-width: 18.125rem;
//   `};
//   user-select: none;
//   padding: 16px;
// `

const ExpandColumn = styled(AutoColumn)`
  gap: 16px;
  padding-top: 16px;
`

export default function SettingsTab({
  autoSlippage,
  chainId,
  trade,
}: {
  autoSlippage: number
  chainId?: number
  trade?: InterfaceTrade
}) {

  const node = useRef<HTMLDivElement | null>(null)


  return (
    <Menu ref={node}>
      {/* <MenuButton disabled={true} isActive={true} onClick={() => { }} /> */}
      <TuneRoundedIcon />
      {(
        // <MenuFlyout>
        <ExpandColumn>
          <Divider />
          {/* <MaxSlippageSettings autoSlippage={autoSlippage} /> */}
        </ExpandColumn>
        // </MenuFlyout>
      )}
    </Menu>
  )
}
