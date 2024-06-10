import { WalletButton } from 'components/Buttons/WalletButton'
import StyledWrapper from 'components/Layout/StyledWrapper'
import React, { useEffect, useState } from 'react'
import SwapHeader from 'components/Swap/SwapHeader'
import { useSorobanReact } from '@soroban-react/core'
import { SwapSection } from 'components/Swap/SwapComponent'
import { InputPanel, Container, Aligner, StyledTokenName, StyledDropDown } from 'components/CurrencyInputPanel/SwapCurrencyInputPanel'
import { StyledSelect } from 'components/Layout/StyledSelect'
import { RowFixed } from 'components/Row'
import { ButtonPrimary } from 'components/Buttons/Button'
import { BodyPrimary } from 'components/Text'
import { getCurrencies } from 'functions/buy/SEP-1'
import { getChallengeTransaction, submitChallengeTransaction } from 'functions/buy/sep10Auth/stellarAuth'
import { initInteractiveDepositFlow } from 'functions/buy/sep24Deposit/InteractiveDeposit'
import { setTrustline } from '@soroban-react/contracts'

interface anchor {
  name: string
  home_domain: string
}

interface token {
  name: string
  issuer: string
}

const anchors: anchor[] = [
  {
    name: 'Stellar TestAnchor 1',
    home_domain: 'https://testanchor.stellar.org'
  },
  {
    name: 'MoneyGram',
    home_domain: 'https://testanchor.stellar.org'
  },
  {
    name: 'MyKobo',
    home_domain: 'https://testanchor.stellar.org'
  },
]

function BuyComponent() {
  const sorobanContext = useSorobanReact()
  const {address, serverHorizon, activeChain} = sorobanContext
  const [selectedAnchor, setSelectedAnchor] = useState<anchor | undefined>(undefined)
  const [selectedToken, setSelectedToken] = useState<token | undefined>(undefined)
  const [needTrustline, setNeedTrustline] = useState<boolean>(true)

  const checkTrustline = async () => {
    if(address){
      const account = await serverHorizon?.loadAccount(address)
      const balances = account?.balances
      const hasTrustline = balances?.find((bal) =>
        'asset_code' in bal && 'asset_issuer' in bal &&
        bal.asset_code === selectedToken?.name && bal.asset_issuer === selectedToken?.issuer
      )
      setNeedTrustline(!hasTrustline)
    }
    
  };

  const buy = async () => {
    await checkTrustline()
    if(needTrustline){
      try {
        setTrustline(
          {
            tokenSymbol: selectedToken?.name!,
            tokenAdmin: selectedToken?.issuer!,
            sorobanContext
          }
        )
          
      } catch (error) {
        console.error(error)
      }
    }
    try {
      InitDeposit(selectedAnchor?.home_domain!)
    } catch (error) {
      console.error(error)
    }
  }


  const sign = async (txn: any) => {
    const signedTransaction = await sorobanContext?.activeConnector?.signTransaction(txn, {
      networkPassphrase: activeChain?.networkPassphrase,
      network: activeChain?.id,
      accountToSign: address
    })
    return signedTransaction;
  }

  const InitDeposit = async (homeDomain: string) => {
    console.log(homeDomain)
    const { transaction } = await getChallengeTransaction({
      publicKey: address! && address,
      homeDomain: homeDomain
    })
    const signedTransaction = await sign(transaction)
    const submittedTransaction = await submitChallengeTransaction({
      transactionXDR: signedTransaction,
      homeDomain: homeDomain
    })
    const { url } = await initInteractiveDepositFlow({
      authToken: submittedTransaction,
      homeDomain: homeDomain,
      urlFields: {
        asset_code: selectedToken?.name,
        asset_issuer: selectedToken?.issuer
      }
    })

    const interactiveUrl = `${url}&callback=postMessage`
    let popup = window.open(interactiveUrl, 'interactiveDeposit', 'width=450,height=750')

    if (!popup) {
      alert(
        "Popups are blocked. You’ll need to enable popups for this demo to work",
      );
      console.error(
        "Popups are blocked. You’ll need to enable popups for this demo to work",
      )
    }

    popup?.focus()

    window.addEventListener('message', (event) => {
      if (event.origin === homeDomain) {
        console.log(event.data)
        const transaction = event.data.transaction
        if (transaction.status == 'complete')
          popup?.close()
      }
    })
  }

  useEffect(() => {
    checkTrustline()
  }, [selectedToken, address, activeChain])

  const fetchCurrencies = async () => {
    console.log('fetching currencies')
    const currencies = await getCurrencies(selectedAnchor?.home_domain!)
    setSelectedToken({name: currencies[0].code, issuer: currencies[0].issuer})
  }

  return (
    <>
      <StyledWrapper>
        <SwapHeader showConfig={false}/>
        <SwapSection>
          <InputPanel>
            <Container hideInput={false}>
              <div>Deposit to:</div>
              <Aligner>
                <RowFixed>
                  <StyledSelect visible={true} selected={!!selectedAnchor} onClick={()=>setSelectedAnchor(anchors[0])}>
                    <StyledTokenName
                      data-testid="Swap__Panel__Selector"
                      sx={{paddingLeft:'16px'}}
                    >
                      {selectedAnchor ? selectedAnchor.name : 'Select Anchor'}
                    </StyledTokenName>
                  {<StyledDropDown selected={!!selectedAnchor} />}
                  </StyledSelect>
                </RowFixed>
              </Aligner>
            </Container>
          </InputPanel>
        </SwapSection>
        <SwapSection>
        <InputPanel>
            <Container hideInput={false}>
              <div>Recieve:</div>
              <Aligner>
                <RowFixed>
                  <StyledSelect visible={true} selected={!!selectedToken} onClick={()=>fetchCurrencies()}>
                    <StyledTokenName
                      data-testid="Swap__Panel__Selector"
                      sx={
                        {
                          paddingLeft:'16px',
                        }
                      }
                    >
                      {selectedToken ? selectedToken.name : 'Select token'}
                    </StyledTokenName>
                  {<StyledDropDown selected={!!selectedToken} />}
                  </StyledSelect>
                </RowFixed>
              </Aligner>
            </Container>
          </InputPanel>
        </SwapSection>
        {address ? 
        (<ButtonPrimary onClick={buy}>
          <BodyPrimary>
            <span> Buy {selectedToken ? selectedToken.name : ''} </span>
          </BodyPrimary>
        </ButtonPrimary>):
        (<WalletButton/>)
        }
      </StyledWrapper>
    </>
  )
}

export { BuyComponent }