import { useEffect } from 'react'
import ModalBox from 'components/Modals/ModalBox'
import { styled } from 'soroswap-ui';
import { Box, Container, Modal, useMediaQuery } from '@mui/material';
import { BodyPrimary, BodySmall, Caption } from 'components/Text';
import { anchor, currency } from './BuyComponent'

const ContentWrapper = styled('div') <{ isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 24px;
  font-family: Inter;
  text-align: ${({ isMobile }) => (isMobile ? 'center' : 'left')};
`;

const ContainerBox = styled('div')`
  cursor: pointer;
  display: flex;
  background-color: ${({ theme }) => theme.palette.customBackground.surface};
  border-radius: 12px;
  padding: 16px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
`;

const BoxGroup = styled('div')`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  align-self: stretch;
  max-height: 50vh;
  padding-right: 4px;
  overflow-y: auto;
    ::-webkit-scrollbar {
    width: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.15);        /* color of the tracking area */
  }
  
  ::-webkit-scrollbar-thumb {
    background-color: rgb(100, 102, 108, 0.25);    /* color of the scroll thumb */
    border-radius: 6px;
    border: solid 1px rgba(0, 0, 0, 1);
  }
`;
const BuyModal = ({
  isOpen,
  anchors,
  assets,
  onClose,
  handleSelect
}: {
  isOpen: boolean;
  anchors?: anchor[];
  assets?: currency[];
  onClose: () => void;
  handleSelect: (data: any) => void;
}) => {
  useEffect(() => {

  }, [])
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
    >
      <>
        <ModalBox>
          <Container sx={{ width: 500 }}>
            <ContentWrapper isMobile={false}>
              <Box>
                {anchors ? <h3>Pay</h3> : <h3>Receive</h3>}
                {anchors ? <BodySmall>Select a fiat currency to pay.</BodySmall> : <BodySmall>Select a crypto asset to receive</BodySmall>}
              </Box>
              <BoxGroup>
                {anchors ? anchors.map((anchor) => (
                  <ContainerBox key={anchor.name} onClick={() => handleSelect(anchor)}>
                    <BodyPrimary>{anchor.currency}</BodyPrimary>
                    <Caption fontWeight={100}>{anchor.name}</Caption>
                  </ContainerBox>
                )) :
                  assets ? assets.map((asset) => (
                    <ContainerBox key={asset.code} onClick={() => handleSelect(asset)}>
                      <Box>{asset.code}</Box>
                    </ContainerBox>
                  )) :
                    <BodyPrimary>Please, select a fiat currency first.</BodyPrimary>
                }
              </BoxGroup>
            </ContentWrapper>
          </Container>
        </ModalBox>
      </>
    </Modal>
  )
}

export default BuyModal