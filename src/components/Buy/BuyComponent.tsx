import React, { useEffect, useState } from 'react'
import { CircularProgress, Skeleton } from '@mui/material'
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
import BuyStatusModal from './BuyStatusModal'

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
    currency: 'EUR'
  },
  {
    name: 'Anclap',
    home_domain: 'api-stage.anclap.ar',
    currency: 'ARS/PEN'
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
      isLoading: boolean
    },
    assetModal: {
      visible: boolean,
      selectedAsset: anchor | undefined,
      isLoading: boolean
    },
  }>({
    anchorModal: {
      visible: false,
      selectedAnchor: undefined,
      isLoading: false,
    },
    assetModal: {
      visible: false,
      selectedAsset: undefined,
      isLoading: false,
    }
  });

  const [statusModalState, setStatusModalState] = useState<{
    isOpen: boolean,
    status: {
      activeStep: number,
      trustline: boolean,
      trustlineError: string,
      settingTrustline: boolean,
      depositError: string,
    },
  }>({
    isOpen: false,
    status: {
      activeStep: 0,
      trustline: false,
      trustlineError: '',
      settingTrustline: false,
      depositError: '',
    },
  });

  const handleNextStep = () => {
    setStatusModalState({
      isOpen: true,
      status: {
        ...statusModalState.status,
        activeStep: ++statusModalState.status.activeStep,
      },
    });
  }

  const handlePrevStep = () => {
    if (statusModalState.status.activeStep == 0) return;
    setStatusModalState({
      isOpen: true,
      status: {
        ...statusModalState.status,
        activeStep: statusModalState.status.activeStep - 1,
        settingTrustline: false,
      },
    });
  }

  const handleCloseStatusModal = () => {
    setStatusModalState({
      isOpen: false,
      status: {
        activeStep: 0,
        trustline: false,
        trustlineError: '',
        settingTrustline: false,
        depositError: '',
      },
    });
  }

  const openModal = () => {
    setStatusModalState({
      isOpen: true,
      status: {
        ...statusModalState.status,
      },
    });
  }

  const setDepositError = (error: string) => {
    setStatusModalState({
      isOpen: true,
      status: {
        ...statusModalState.status,
        depositError: error,
      },
    });
  }

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
    try {
      openModal();
      const { transaction } = await getChallengeTransaction({
        publicKey: address! && address,
        homeDomain: homeDomain
      });
      const signedTransaction = await sign(transaction)
      const submittedTransaction = await submitChallengeTransaction({
        transactionXDR: signedTransaction,
        homeDomain: homeDomain
      });

      handleNextStep();

      const { url } = await initInteractiveDepositFlow({
        authToken: submittedTransaction,
        homeDomain: homeDomain,
        urlFields: {
          asset_code: selectedAsset?.code,
          asset_issuer: selectedAsset?.issuer,
          account: address
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
        throw new Error("Popups are blocked. You’ll need to enable popups for this demo to work",)
      }
      popup?.focus();
      window.addEventListener('message', (event): void => {
        if (event.origin.includes(homeDomain)) {
          popup?.close()
          handleNextStep();
        }
      })
      function checkPopupClosed() {
        if (popup?.closed) {
          setDepositError('The popup was closed before submitting the transaction')
          // Limpia el intervalo si el popup está cerrado
          clearInterval(popupCheckInterval);
        }
      }
      let popupCheckInterval = setInterval(checkPopupClosed, 200);
    } catch (error: any) {
      setDepositError(error.toString());
      console.error(error);
      setIsLoading(false);
    }
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
        setStatusModalState({
          isOpen: true,
          status: {
            ...statusModalState.status,
            trustline: true,
            trustlineError: '',
            settingTrustline: true,
          },
        });
        const res = await setTrustline({
          tokenSymbol: selectedAsset?.code!,
          tokenAdmin: selectedAsset?.issuer!,
          sorobanContext
        });
        if (res === undefined) throw new Error('The response is undefined');
        await checkTrustline();
        console.log('trustline set');
        handleCloseStatusModal();
      } catch (error: any) {
        console.log('error setting trustline');
        setStatusModalState({
          isOpen: true,
          status: {
            ...statusModalState.status,
            trustlineError: error.toString(),
          },
        });
        console.error(error);
        setNeedTrustline(true);
        setIsLoading(false);
        handleCloseStatusModal();
      }
    } else {
      try {
        setIsLoading(true);
        InitDeposit(selectedAnchor?.home_domain!)
        setIsLoading(false);
      } catch (error: any) {
        setDepositError(error.toString());
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
    setModalState({
      ...modalState,
      assetModal: {
        ...modalState.assetModal,
        isLoading: true,
      }
    })
    const currencies = await getCurrencies(selectedAnchor?.home_domain!);
    setCurrencies(currencies);
    setIsLoading(false);
    setModalState({
      ...modalState,
      assetModal: {
        ...modalState.assetModal,
        isLoading: false,
      }
    })
    handleOpen('asset');
  }

  const handleOpen = (modal: string) => {
    if (modal == 'anchor') {
      setModalState({
        ...modalState,
        anchorModal: {
          ...modalState.anchorModal,
          visible: true,
          selectedAnchor: modalState.anchorModal.selectedAnchor,
        }
      });
    } else if (modal == 'asset') {
      setModalState({
        ...modalState,
        assetModal: {
          ...modalState.assetModal,
          visible: true,
          selectedAsset: modalState.assetModal.selectedAsset,
        }
      });
    }
  }

  const handleClose = (modal: string) => {
    if (modal == 'anchor') {
      setModalState({
        ...modalState,
        anchorModal: {
          ...modalState.anchorModal,
          visible: false,
          selectedAnchor: modalState.anchorModal.selectedAnchor,
        }
      });
    } else if (modal == 'asset') {
      setModalState({
        ...modalState,
        assetModal: {
          ...modalState.assetModal,
          visible: false,
          selectedAsset: modalState.anchorModal.selectedAnchor,
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
      <BuyStatusModal
        isOpen={statusModalState.isOpen}
        activeStep={statusModalState.status.activeStep}
        handleNext={handleNextStep}
        handlePrev={handlePrevStep}
        handleClose={handleCloseStatusModal}
        trustline={statusModalState.status.trustline}
        trustlineError={statusModalState.status.trustlineError}
        settingTrustline={statusModalState.status.settingTrustline}
        depositError={statusModalState.status.depositError} />
      <BuyModal
        isOpen={modalState.anchorModal.visible}
        anchors={anchors}
        onClose={() => { handleClose('anchor') }}
        handleSelect={(e) => handleSelect('anchor', e)} />
      <BuyModal
        isOpen={modalState.assetModal.visible}
        assets={currencies}
        onClose={() => { handleClose('asset') }}
        handleSelect={(e) => handleSelect('asset', undefined, e)} />
      <StyledWrapper sx={{ pt: 3 }}>
        <SwapHeader showConfig={false}/>
        <SwapSection sx={{ my: 3 }}>
          <InputPanel>
            <Container hideInput={false} >
              <div>You pay with:</div>
              <Aligner>
                <RowFixed sx={{ my: 1 }}>
                  <StyledSelect
                    visible="true"
                    selected={!!selectedAnchor}
                    onClick={() => handleOpen('anchor')}>
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
                  {modalState.assetModal.isLoading && (
                    <Skeleton variant="rounded" animation="wave" sx={{ borderRadius: 16 }}>
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
                    </Skeleton>
                  )}
                  {!modalState.assetModal.isLoading && (
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
                  )}
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