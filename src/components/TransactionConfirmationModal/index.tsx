// import { t, Trans } from '@lingui/macro'
// import { ChainId, Currency } from '@uniswap/sdk-core'
// import { useWeb3React } from '@web3-react/core'
// import Badge from 'components/Badge'
// import { getChainInfo } from 'constants/chainInfo'
// import { SupportedL2ChainId } from 'constants/chains'
// import useCurrencyLogoURIs from 'lib/hooks/useCurrencyLogoURIs'
// import { ReactNode, useCallback, useState } from 'react'
// import { AlertCircle, ArrowUpCircle, CheckCircle } from 'react-feather'
// import { useIsTransactionConfirmed, useTransaction } from 'state/transactions/hooks'
// import styled, { useTheme } from 'styled-components/macro'
// import { isL2ChainId } from 'utils/chains'
// import { ExplorerDataType, getExplorerLink } from 'utils/getExplorerLink'

import { styled, useTheme } from "@mui/material"
import Badge from "components/Badge"
import { CloseButton } from "components/Buttons/CloseButton"
import { AutoColumn, ColumnCenter } from "components/Column"
import Row, { RowBetween, RowFixed } from "components/Row"
import { SubHeader, SubHeaderLarge, SubHeaderSmall } from "components/Text"
import { TokenType } from "interfaces"
import { ReactNode } from "react"

// import Circle from '../../assets/images/blue-loader.svg'
// import { ExternalLink, ThemedText } from '../../theme'
// import { CloseIcon, CustomLightSpinner } from '../../theme'
// import { TransactionSummary } from '../AccountDetails/TransactionSummary'
// import { ButtonLight, ButtonPrimary } from '../Button'
// import { AutoColumn, ColumnCenter } from '../Column'
// import Modal from '../Modal'
// import Row, { RowBetween, RowFixed } from '../Row'
// import AnimatedConfirmation from './AnimatedConfirmation'

const Wrapper = styled('div')`
  overflow: hidden;
  border-radius: 20px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 420px;  
  background-color: ${({ theme }) => theme.palette.customBackground.surface};
  border-radius: 20px;
  outline: 1px solid ${({ theme }) => theme.palette.customBackground.outline};
  padding: 16px;
`
// const ContentWrapper = styled(Column)<{ modalHeight?: number }>`
//   overflow: hidden;
//   border-radius: 20px;
//   position: absolute;
//   top: 50%;
//   left: 50%;
//   transform: translate(-50%, -50%);
//   width: 420px;
//   height: ${({ modalHeight }) => modalHeight+'vh' ?? '90px'};
//   min-height: 90px;
//   background-color: ${({ theme }) => theme.palette.customBackground.surface};
//   border: 1px solid #98A1C03d;
// `

const BottomSection = styled(AutoColumn)`
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
`

const ConfirmedIcon = styled(ColumnCenter)<{ inline?: boolean }>`
  padding: ${({ inline }) => (inline ? '20px 0' : '32px 0;')};
`

const StyledLogo = styled('img')`
  height: 16px;
  width: 16px;
  margin-left: 6px;
`

const ConfirmationModalContentWrapper = styled(AutoColumn)`
  padding-bottom: 12px;
`

function ConfirmationPendingContent({
  onDismiss,
  pendingText,
  inline,
}: {
  onDismiss: () => void
  pendingText: ReactNode
  inline?: boolean // not in modal
}) {
  return (
    <Wrapper>
      <AutoColumn gap="md">
        {!inline && (
          <RowBetween>
            <div />
            <CloseButton onClick={onDismiss} />
          </RowBetween>
        )}
        <ConfirmedIcon inline={inline}>
          {/* <CustomLightSpinner src={Circle} alt="loader" size={inline ? '40px' : '90px'} /> */}
        </ConfirmedIcon>
        <AutoColumn gap="md" justify="center">
          <SubHeaderLarge color="textPrimary" textAlign="center">
            Waiting for confirmation
          </SubHeaderLarge>
          <SubHeader color="textPrimary" textAlign="center">
            {pendingText}
          </SubHeader>
          <SubHeaderSmall color="textSecondary" textAlign="center" marginBottom="12px">
            Confirm this transaction in your wallet
          </SubHeaderSmall>
        </AutoColumn>
      </AutoColumn>
    </Wrapper>
  )
}
// function TransactionSubmittedContent({
//   onDismiss,
//   chainId,
//   hash,
//   currencyToAdd,
//   inline,
// }: {
//   onDismiss: () => void
//   hash?: string
//   chainId: number
//   currencyToAdd?: TokenType
//   inline?: boolean // not in modal
// }) {
//   const theme = useTheme()

//   const { connector } = useWeb3React()

//   const token = currencyToAdd?.wrapped
//   const logoURL = useCurrencyLogoURIs(token)[0]

//   const [success, setSuccess] = useState<boolean | undefined>()

//   const addToken = useCallback(() => {
//     if (!token?.symbol || !connector.watchAsset) return
//     connector
//       .watchAsset({
//         address: token.address,
//         symbol: token.symbol,
//         decimals: token.decimals,
//         image: logoURL,
//       })
//       .then(() => setSuccess(true))
//       .catch(() => setSuccess(false))
//   }, [connector, logoURL, token])

//   const explorerText = chainId === ChainId.MAINNET ? t`View on  Etherscan` : t`View on Block Explorer`

//   return (
//     <Wrapper>
//       <AutoColumn>
//         {!inline && (
//           <RowBetween>
//             <div />
//             <CloseIcon onClick={onDismiss} />
//           </RowBetween>
//         )}
//         <ConfirmedIcon inline={inline}>
//           <ArrowUpCircle strokeWidth={1} size={inline ? '40px' : '75px'} color={theme.accentActive} />
//         </ConfirmedIcon>
//         <ConfirmationModalContentWrapper gap="md" justify="center">
//           <ThemedText.MediumHeader textAlign="center">
//             <Trans>Transaction submitted</Trans>
//           </ThemedText.MediumHeader>
//           {currencyToAdd && connector.watchAsset && (
//             <ButtonLight mt="12px" padding="6px 12px" width="fit-content" onClick={addToken}>
//               {!success ? (
//                 <RowFixed>
//                   <Trans>Add {currencyToAdd.symbol}</Trans>
//                 </RowFixed>
//               ) : (
//                 <RowFixed>
//                   <Trans>Added {currencyToAdd.symbol} </Trans>
//                   <CheckCircle size="16px" stroke={theme.accentSuccess} style={{ marginLeft: '6px' }} />
//                 </RowFixed>
//               )}
//             </ButtonLight>
//           )}
//           <ButtonPrimary onClick={onDismiss} style={{ margin: '20px 0 0 0' }} data-testid="dismiss-tx-confirmation">
//             <ThemedText.HeadlineSmall color={theme.accentTextLightPrimary}>
//               {inline ? <Trans>Return</Trans> : <Trans>Close</Trans>}
//             </ThemedText.HeadlineSmall>
//           </ButtonPrimary>
//           {chainId && hash && (
//             <ExternalLink href={getExplorerLink(chainId, hash, ExplorerDataType.TRANSACTION)}>
//               <ThemedText.Link color={theme.accentAction}>{explorerText}</ThemedText.Link>
//             </ExternalLink>
//           )}
//         </ConfirmationModalContentWrapper>
//       </AutoColumn>
//     </Wrapper>
//   )
// }

export function ConfirmationModalContent({
  title,
  bottomContent,
  onDismiss,
  topContent,
  headerContent,
}: {
  title: ReactNode
  onDismiss: () => void
  topContent: () => ReactNode
  bottomContent?: () => ReactNode
  headerContent?: () => ReactNode
}) {
  return (
    <Wrapper>
      <AutoColumn gap="8px">
        <Row>
          {headerContent?.()}
          <Row justify="center" marginLeft="24px">
            <SubHeader>{title}</SubHeader>
          </Row>
          <CloseButton onClick={onDismiss} data-testid="confirmation-close-icon" />
        </Row>
        {topContent()}
      </AutoColumn>
      {bottomContent && <BottomSection gap="12px">{bottomContent()}</BottomSection>}
    </Wrapper>
  )
}

// function L2Content({
//   onDismiss,
//   chainId,
//   hash,
//   pendingText,
//   inline,
// }: {
//   onDismiss: () => void
//   hash?: string
//   chainId: any
//   currencyToAdd?: TokenType
//   pendingText: ReactNode
//   inline?: boolean // not in modal
// }) {
//   const theme = useTheme()

//   const transaction = ""//useTransaction(hash)
//   const confirmed = ""//useIsTransactionConfirmed(hash)
//   const transactionSuccess = false//transaction?.receipt?.status === 1

//   // convert unix time difference to seconds
//   const secondsToConfirm = 20
//     // transaction?.confirmedTime
//     // ? (transaction.confirmedTime - transaction.addedTime) / 1000
//     // : undefined

//   const info = {
//     logoUrl: "",
//     label: ""
//   }//getChainInfo(chainId)

//   return (
//     <Wrapper>
//       <AutoColumn>
//         {!inline && (
//           <RowBetween mb="16px">
//             <Badge>
//               <RowFixed>
//                 <StyledLogo src={info.logoUrl} style={{ margin: '0 8px 0 0' }} />
//                 {info.label}
//               </RowFixed>
//             </Badge>
//             <CloseButton onClick={onDismiss} />
//           </RowBetween>
//         )}
//         <ConfirmedIcon inline={inline}>
//           {confirmed ? (
//             transactionSuccess ? (
//               // <CheckCircle strokeWidth={1} size={inline ? '40px' : '90px'} color={theme.accentSuccess} />
//               <AnimatedConfirmation />
//             ) : (
//               <AlertCircle strokeWidth={1} size={inline ? '40px' : '90px'} color={theme.accentFailure} />
//             )
//           ) : (
//             <CustomLightSpinner src={Circle} alt="loader" size={inline ? '40px' : '90px'} />
//           )}
//         </ConfirmedIcon>
//         <AutoColumn gap="md" justify="center">
//           <ThemedText.SubHeaderLarge textAlign="center">
//             {!hash ? (
//               <Trans>Confirm transaction in wallet</Trans>
//             ) : !confirmed ? (
//               <Trans>Transaction Submitted</Trans>
//             ) : transactionSuccess ? (
//               <Trans>Success</Trans>
//             ) : (
//               <Trans>Error</Trans>
//             )}
//           </ThemedText.SubHeaderLarge>
//           <ThemedText.BodySecondary textAlign="center">
//             {transaction ? <TransactionSummary info={transaction.info} /> : pendingText}
//           </ThemedText.BodySecondary>
//           {chainId && hash ? (
//             <ExternalLink href={getExplorerLink(chainId, hash, ExplorerDataType.TRANSACTION)}>
//               <ThemedText.SubHeaderSmall color={theme.accentAction}>
//                 <Trans>View on Explorer</Trans>
//               </ThemedText.SubHeaderSmall>
//             </ExternalLink>
//           ) : (
//             <div style={{ height: '17px' }} />
//           )}
//           <ThemedText.SubHeaderSmall color={theme.textTertiary} marginTop="20px">
//             {!secondsToConfirm ? (
//               <div style={{ height: '24px' }} />
//             ) : (
//               <div>
//                 <Trans>Transaction completed in </Trans>
//                 <span style={{ fontWeight: 500, marginLeft: '4px', color: theme.textPrimary }}>
//                   {secondsToConfirm} seconds 🎉
//                 </span>
//               </div>
//             )}
//           </ThemedText.SubHeaderSmall>
//           <ButtonPrimary onClick={onDismiss} style={{ margin: '4px 0 0 0' }}>
//             <ThemedText.SubHeaderLarge>
//               {inline ? <Trans>Return</Trans> : <Trans>Close</Trans>}
//             </ThemedText.SubHeaderLarge>
//           </ButtonPrimary>
//         </AutoColumn>
//       </AutoColumn>
//     </Wrapper>
//   )
// }

// interface ConfirmationModalProps {
//   isOpen: boolean
//   onDismiss: () => void
//   hash?: string
//   reviewContent: () => ReactNode
//   attemptingTxn: boolean
//   pendingText: ReactNode
//   currencyToAdd?: Currency
// }

// export default function TransactionConfirmationModal({
//   isOpen,
//   onDismiss,
//   attemptingTxn,
//   hash,
//   pendingText,
//   reviewContent,
//   currencyToAdd,
// }: ConfirmationModalProps) {
//   const { chainId } = useWeb3React()

//   if (!chainId) return null

//   // confirmation screen
//   return (
//     <Modal isOpen={isOpen} $scrollOverlay={true} onDismiss={onDismiss} maxHeight={90}>
//       {isL2ChainId(chainId) && (hash || attemptingTxn) ? (
//         <L2Content chainId={chainId} hash={hash} onDismiss={onDismiss} pendingText={pendingText} />
//       ) : attemptingTxn ? (
//         <ConfirmationPendingContent onDismiss={onDismiss} pendingText={pendingText} />
//       ) : hash ? (
//         <TransactionSubmittedContent
//           chainId={chainId}
//           hash={hash}
//           onDismiss={onDismiss}
//           currencyToAdd={currencyToAdd}
//         />
//       ) : (
//         reviewContent()
//       )}
//     </Modal>
//   )
// }
