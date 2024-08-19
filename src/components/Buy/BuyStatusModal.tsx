import { useEffect } from 'react'
import ModalBox from 'components/Modals/ModalBox'
import { styled } from 'soroswap-ui';
import { Box, Button, CircularProgress, Container, Modal, Typography, useMediaQuery } from 'soroswap-ui';
import { BodyPrimary, BodySmall, Caption } from 'components/Text';
import { Step, StepContent, StepLabel, Stepper } from '@mui/material';
import { AlertTriangle, CheckCircle } from 'react-feather'
import { useTheme } from '@mui/material'

const ContentWrapper = styled('div') <{ isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 24px;
  font-family: Inter;
  text-align: ${({ isMobile }) => (isMobile ? 'center' : 'left')};
`;

const stepperStyle = {

};


function BuyStatusModal({
  isOpen,
  activeStep,
  handleNext,
  handlePrev,
  handleClose,
  trustline,
  trustlineError,
  settingTrustline,
  depositError
}: {
  isOpen: boolean,
  activeStep: number,
  handleNext: () => void,
  handlePrev: () => void,
  handleClose: () => void,
  trustline?: boolean,
  trustlineError?: string,
  settingTrustline?: boolean,
  depositError?: string,
}
) {
  const theme = useTheme()

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
    >
      <>
        <ModalBox>
          <Container sx={{ width: 500 }}>
            <ContentWrapper isMobile={false}>
              {trustline ? (
                <>
                  <Typography variant="h5">Setting up trustline</Typography>
                  <BodyPrimary>
                    Setting up trustline is required to buy this token. This will allow you to receive the token after the purchase.
                  </BodyPrimary>
                  {settingTrustline && (trustlineError == '') ?
                    <>
                      <BodySmall>
                        Waiting for transaction completed
                      </BodySmall>
                      <Box textAlign={'center'} sx={{ my: 4 }}>
                        <CircularProgress />
                      </Box>
                    </>
                    : (
                      <>
                        <Box textAlign={'center'} sx={{ my: 2 }}>
                          <AlertTriangle data-testid="pending-modal-failure-icon" strokeWidth={2} color={theme.palette.error.main} size="48px" />
                          <BodySmall sx={{ my: 2 }}>
                            {trustlineError}
                          </BodySmall>
                          <Button
                            sx={{ mt: 2 }}
                            variant="contained"
                            onClick={handleClose}
                          >
                            Close
                          </Button>
                        </Box>
                      </>
                    )}
                </>
              ) :
                ((depositError === '') ? (<Stepper orientation='vertical' activeStep={activeStep} >
                  <Step>
                    <StepLabel style={stepperStyle}>
                      <Typography sx={{ color: '#fff' }}>
                        Requesting authorization
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography sx={{ fontWeight: 200, fontSize: '12px' }}>Please, confirm the transaction in your wallet to allow Soroswap send your addres to anchor.</Typography>
                      <Box sx={{ mt: 4 }} textAlign={'center'}>
                        <CircularProgress />
                      </Box>
                    </StepContent>
                  </Step>
                  <Step>
                    <StepLabel>
                      <Typography sx={{ color: '#fff' }}>
                        Fill the interactive deposit
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography sx={{ fontWeight: 200, fontSize: '12px' }}>Please, fill the requested information in the new window and wait for the deposit</Typography>
                      <Box sx={{ mt: 4 }} textAlign={'center'}>
                        <CircularProgress />
                      </Box>
                    </StepContent>
                  </Step>
                  <Step>
                    <StepLabel>
                      <Typography sx={{ color: '#fff' }}>
                        Await for the deposit:
                      </Typography>
                    </StepLabel>
                    <StepContent>
                      <Typography sx={{ fontWeight: 200, fontSize: '12px' }}>Everything is handled on our end. Please relax and take a break. Your funds should update automatically once the anchor completes the deposit.</Typography>
                      <Box sx={{ mb: 2, pt: 4 }} textAlign={'center'}>
                        <CheckCircle data-testid="pending-modal-success-icon" strokeWidth={2} color={theme.palette.success.main} size="48px" />
                      </Box>
                      <Box textAlign={'center'}>
                        <Caption>
                          This process may take several minutes. Please, be patient.
                        </Caption>
                        <Button
                          variant="outlined"
                          onClick={handleClose}
                          sx={{ mt: 2, mr: 1 }}
                        >
                          Close
                        </Button>
                      </Box>
                    </StepContent>
                  </Step>
                </Stepper>) : (
                  <>
                    <Box textAlign={'center'} sx={{ my: 2 }}>
                      <AlertTriangle data-testid="pending-modal-failure-icon" strokeWidth={2} color={theme.palette.error.main} size="48px" />
                      <BodySmall sx={{ my: 2 }}>
                        {depositError}
                      </BodySmall>
                      <Button
                        sx={{ mt: 2 }}
                        variant="outlined"
                        onClick={handleClose}
                      >
                        Close
                      </Button>
                    </Box>
                  </>
                ))
              }
            </ContentWrapper>
          </Container>
        </ModalBox>
      </>
    </Modal>
  )
}

export default BuyStatusModal