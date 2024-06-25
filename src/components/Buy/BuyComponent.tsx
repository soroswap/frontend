import React, { useEffect, useState } from 'react'
import { CircularProgress } from '@mui/material'
import { setTrustline } from '@soroban-react/contracts'
import { useSorobanReact } from '@soroban-react/core'
import BuyModal from './BuyModal'
import { WalletButton } from 'components/Buttons/WalletButton'
import { ButtonPrimary } from 'components/Buttons/Button'
import { InputPanel, Container, Aligner, StyledTokenName, StyledDropDown } from 'components/CurrencyInputPanel/SwapCurrencyInputPanel'
import StyledWrapper from 'components/Layout/StyledWrapper'
import { StyledSelect } from 'components/Layout/StyledSelect'
import { RowFixed } from 'components/Row'
import SwapHeader from 'components/Swap/SwapHeader'
import { SwapSection } from 'components/Swap/SwapComponent'
import { BodyPrimary } from 'components/Text'
import { getChallengeTransaction, submitChallengeTransaction } from 'functions/buy/sep10Auth/stellarAuth'
import { initInteractiveDepositFlow } from 'functions/buy/sep24Deposit/InteractiveDeposit'
import { getCurrencies } from 'functions/buy/SEP-1'


export interface anchor {
  name: string
  home_domain: string
  currency?: string
};

export interface currency {
  code: string;
  desc?: string;
  is_asset_anchored?: boolean;
  issuer: string;
  status?: string;
};

const anchors: anchor[] = [
  {
    name: 'Stellar TestAnchor 1',
    home_domain: 'testanchor.stellar.org',
    currency: 'SRT'
  },
  {
    name: 'MoneyGram',
    home_domain: 'stellar.moneygram.com',
    currency: 'USD'
  },
  {
    name: 'MyKobo',
    home_domain: 'mykobo.co',
    currency: 'EURC'
  },
];

function BuyComponent() {
  const sorobanContext = useSorobanReact();
  const { address, serverHorizon, activeChain, activeConnector } = sorobanContext;
  const [selectedAnchor, setSelectedAnchor] = useState<anchor | undefined>(undefined);
  const [currencies, setCurrencies] = useState<currency[] | undefined>(undefined);
  const [selectedAsset, setSelectedAsset] = useState<currency | undefined>(undefined);
  const [needTrustline, setNeedTrustline] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [buttonText, setButtonText] = useState<string>('Select Anchor');
  const [modalState, setModalState] = useState<{
    anchorModal: {
      visible: boolean,
      selectedAnchor: anchor | undefined,
    },
    assetModal: {
      visible: boolean,
      selectedAsset: anchor | undefined,
    },
  }>({
    anchorModal: {
      visible: false,
      selectedAnchor: undefined,
    },
    assetModal: {
      visible: false,
      selectedAsset: undefined,
    }
  });

  const checkTrustline = async () => {
    if(address){
      setIsLoading(true);
      let account;
      try {
        account = await serverHorizon?.loadAccount(address);
      } catch (error) {
        console.error(error);
      }
      const balances = account?.balances
      const hasTrustline = balances?.find((bal: any) => bal.asset_code === selectedAsset?.code && bal.asset_issuer == selectedAsset?.issuer);
      setNeedTrustline(!!!hasTrustline);
      setIsLoading(false);
    }
    
  }
  const sign = async (txn: any) => {
    const signedTransaction = await sorobanContext?.activeConnector?.signTransaction(txn, {
      networkPassphrase: activeChain?.networkPassphrase,
      network: activeChain?.id,
      accountToSign: address
    });
    return signedTransaction;
  }

  const InitDeposit = async (homeDomain: string) => {
    const { transaction } = await getChallengeTransaction({
      publicKey: address! && address,
      homeDomain: homeDomain
    });
    const signedTransaction = await sign(transaction)
    const submittedTransaction = await submitChallengeTransaction({
      transactionXDR: signedTransaction,
      homeDomain: homeDomain
    });
    const { url } = await initInteractiveDepositFlow({
      authToken: submittedTransaction,
      homeDomain: homeDomain,
      urlFields: {
        asset_code: selectedAsset?.code,
        asset_issuer: selectedAsset?.issuer
      }
    });

    const interactiveUrl = `${url}&callback=postMessage`
    let popup = window.open(interactiveUrl, 'interactiveDeposit', 'width=450,height=750');

    if (!popup) {
      alert(
        "Popups are blocked. You’ll need to enable popups for this demo to work",
      );
      console.error(
        "Popups are blocked. You’ll need to enable popups for this demo to work",
      );
    }

    popup?.focus();


  }

  const buy = async () => {
    if (!selectedAsset || !selectedAnchor) {
      console.error('No asset or anchor selected');
      return;
    }
    await checkTrustline();
    if (needTrustline) {
      try {
        setIsLoading(true);
        const res = await setTrustline({
          tokenSymbol: selectedAsset?.code!,
          tokenAdmin: selectedAsset?.issuer!,
          sorobanContext
        });
        if (res === undefined) throw new Error('The response is undefined');
        await checkTrustline();
        console.log('trustline set');
      } catch (error) {
        console.log('error setting trustline');
        console.error(error);
        setNeedTrustline(true);
        setIsLoading(false);
      }
    } else {
      try {
        setIsLoading(true);
        InitDeposit(selectedAnchor?.home_domain!)
        setIsLoading(false);
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    checkTrustline();
  }, [selectedAsset, address, activeChain, selectedAnchor, activeConnector])

  useEffect(() => {
    if ((selectedAnchor != undefined) && (selectedAsset == undefined)) {
      setButtonText('Select Token');
    } else if (selectedAnchor && selectedAsset) {
      if (needTrustline) {
        setButtonText(`Set trustline to ${selectedAsset.code}`);
      } else if (!needTrustline) {
        setButtonText(`Buy ${selectedAsset.code}`);
      }
    } else {
      setButtonText('Select Anchor');
    }
  }, [needTrustline, address, selectedAsset, selectedAnchor]);

  const fetchCurrencies = async () => {
    setIsLoading(true);
    const currencies = await getCurrencies(selectedAnchor?.home_domain!);
    setCurrencies(currencies);
    setIsLoading(false);
    handleOpen('asset');
  }

  const handleOpen = (modal: string) => {
    if (modal == 'anchor') {
      setModalState({
        ...modalState,
        anchorModal: {
          visible: true,
          selectedAnchor: modalState.anchorModal.selectedAnchor
        }
      });
    } else if (modal == 'asset') {
      setModalState({
        ...modalState,
        assetModal: {
          visible: true,
          selectedAsset: modalState.assetModal.selectedAsset
        }
      });
    }
  }

  const handleClose = (modal: string) => {
    if (modal == 'anchor') {
      setModalState({
        ...modalState,
        anchorModal: {
          visible: false,
          selectedAnchor: modalState.anchorModal.selectedAnchor
        }
      });
    } else if (modal == 'asset') {
      setModalState({
        ...modalState,
        assetModal: {
          visible: false,
          selectedAsset: modalState.anchorModal.selectedAnchor
        }
      });
    }
  }


  const handleSelect = (modal: string, anchor?: anchor, asset?: currency) => {
    if (anchor) {
      setSelectedAnchor(anchor);
      setSelectedAsset(undefined);
    } else if (modal) {
      setSelectedAsset(asset);
    }
    handleClose(modal);
  }

  return (
    <>
      <BuyModal isOpen={modalState.anchorModal.visible} anchors={anchors} onClose={() => { handleClose('anchor') }} handleSelect={(e) => handleSelect('anchor', e)} />
      <BuyModal isOpen={modalState.assetModal.visible} assets={currencies} onClose={() => { handleClose('asset') }} handleSelect={(e) => handleSelect('asset', undefined, e)} />
      <StyledWrapper sx={{ pt: 3 }}>
        <SwapHeader showConfig={false}/>
        <SwapSection sx={{ my: 3 }}>
          <InputPanel>
            <Container hideInput={false} >
              <div>You pay with:</div>
              <Aligner>
                <RowFixed sx={{ my: 1 }}>
                  <StyledSelect visible="true" selected={!!selectedAnchor} onClick={() => handleOpen('anchor')}>
                    <StyledTokenName
                      data-testid="Swap__Panel__Selector"
                      sx={{ paddingLeft: '4px' }}
                    >
                      {selectedAnchor ? selectedAnchor.name : 'Select currency'}
                    </StyledTokenName>
                  {<StyledDropDown selected={!!selectedAnchor} />}
                  </StyledSelect>
                </RowFixed>
              </Aligner>
            </Container>
          </InputPanel>
        </SwapSection>
        <SwapSection sx={{ my: 3 }}>
        <InputPanel>
            <Container hideInput={false}>
              <div>Recieve:</div>
              <Aligner>
                <RowFixed sx={{ my: 1 }}>
                  <StyledSelect visible='true' selected={!!selectedAsset} onClick={() => fetchCurrencies()} disabled={!!!selectedAnchor}>
                    <StyledTokenName
                      data-testid="Swap__Panel__Selector"
                      sx={
                        {
                          paddingLeft: '4px',
                        }
                      }
                    >
                      {selectedAsset ? selectedAsset.code : 'Select asset'}
                    </StyledTokenName>
                    {<StyledDropDown selected={!!selectedAsset} />}
                  </StyledSelect>
                </RowFixed>
              </Aligner>
            </Container>
          </InputPanel>
        </SwapSection>
        {address ? 
          (<ButtonPrimary onClick={buy} disabled={isLoading}>
            {isLoading ?
              <CircularProgress /> :
              <BodyPrimary>
                {buttonText}
              </BodyPrimary>
            }
          </ButtonPrimary>) :
          (<WalletButton />)
        }
      </StyledWrapper>
    </>
  )
}

export { BuyComponent }