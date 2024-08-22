import ModalBox from 'components/Modals/ModalBox'
import { styled } from 'soroswap-ui';
import { Box, Button, CircularProgress, Container, Modal } from 'soroswap-ui';
import { BodyPrimary, BodySmall, ButtonText, Caption, HeadlineSmall } from 'components/Text';
import { Step, StepContent, StepIconProps, StepLabel, Stepper } from '@mui/material';
import StepConnector, { stepConnectorClasses } from '@mui/material/StepConnector';
import { AlertTriangle, CheckCircle } from 'react-feather'
import { useTheme } from '@mui/material'
import { Check } from '@mui/icons-material';

const StepperConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: 'calc(-50% + 16px)',
    right: 'calc(50% + 16px)',
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: '#784af4',
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: '#784af4',
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
    borderTopWidth: 3,
    borderRadius: 1,
  },
}));

const StepperIconRoot = styled('div')<{ ownerState: { active?: boolean } }>(
  ({ theme, ownerState }) => ({
    color: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#eaeaf0',
    display: 'flex',
    height: 22,
    alignItems: 'center',
    ...(ownerState.active && {
      color: '#784af4',
    }),
    '& .StepperIcon-completedIcon': {
      color: '#784af4',
      zIndex: 1,
      fontSize: 18,
    },
    '& .StepperIcon-circle': {
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: 'currentColor',
    },
  }),
);

function StepperIcon(props: StepIconProps) {
  const { active, completed, className } = props;

  return (
    <StepperIconRoot ownerState={{ active }} className={className}>
      {completed ? (
        <Check className="StepperIcon-completedIcon" />
      ) : (
        <div className="StepperIcon-circle" />
      )}
    </StepperIconRoot>
  );
}



const ContentWrapper = styled('div') <{ isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 24px;
  font-family: Inter;
  text-align: ${({ isMobile }) => (isMobile ? 'center' : 'left')};
`;

const stepperStyle = {
  border: '1px solid red',
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
                  <HeadlineSmall>Setting up trustline</HeadlineSmall>
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
                ((depositError === '') ? (<Stepper orientation='vertical' activeStep={activeStep} connector={<StepperConnector />}>
                  <Step>
                    <StepLabel StepIconComponent={StepperIcon}>
                      <HeadlineSmall fontWeight={400}>
                        Requesting authorization
                      </HeadlineSmall>
                    </StepLabel>
                    <StepContent>
                      <BodySmall>Please, confirm the transaction in your wallet to allow Soroswap send your addres to anchor.</BodySmall>
                      <Box sx={{ mt: 4 }} textAlign={'center'}>
                        <CircularProgress />
                      </Box>
                    </StepContent>
                  </Step>
                  <Step>
                    <StepLabel StepIconComponent={StepperIcon}>
                      <HeadlineSmall fontWeight={400}>
                        Fill the interactive deposit
                      </HeadlineSmall>
                    </StepLabel>
                    <StepContent>
                      <BodySmall>Please, fill the requested information in the new window and wait for the deposit</BodySmall>
                      <Box sx={{ mt: 4 }} textAlign={'center'}>
                        <CircularProgress />
                      </Box>
                    </StepContent>
                  </Step>
                  <Step>
                    <StepLabel StepIconComponent={StepperIcon}>
                      <HeadlineSmall fontWeight={400}>
                        Await for the deposit:
                      </HeadlineSmall>
                    </StepLabel>
                    <StepContent>
                      <BodySmall>Everything is handled on our end. Please relax and take a break. Your funds should update automatically once the anchor completes the deposit.</BodySmall>
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
                          <ButtonText>
                            Close
                          </ButtonText>
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
                          <ButtonText>
                            Close
                          </ButtonText>
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