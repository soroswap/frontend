import { Modal, Typography, styled, useMediaQuery, useTheme } from 'soroswap-ui';
import BigNumber from 'bignumber.js';
import { ButtonOutlined, ButtonPrimary } from 'components/Buttons/Button';
import { CloseButton } from 'components/Buttons/CloseButton';
import Column from 'components/Column';
import CurrencyLogo from 'components/Logo/CurrencyLogo';
import ModalBox from 'components/Modals/ModalBox';
import Row, { AutoRow } from 'components/Row';
import { BodyPrimary, SubHeader } from 'components/Text';
import { LpTokensObj } from 'functions/getLpTokens';
import { formatTokenAmount } from 'helpers/format';
import { useRouter } from 'next/router';
import { LPPercentage } from './styleds';

const ContentWrapper = styled('div') <{ isMobile: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 24px;
  font-family: Inter;
  text-align: left;
  width: ${({ isMobile }) => (isMobile ? '300px' : '360px')};
`;

export default function LiquidityPoolInfoModal({
  selectedLP,
  isOpen,
  onDismiss,
}: {
  selectedLP: LpTokensObj | undefined;
  isOpen: boolean;
  onDismiss: () => void;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();

  if (!selectedLP) return null;

  const handleAddClick = () => {
    router.push(`/pools/add/${selectedLP.token_0?.contract}/${selectedLP.token_1?.contract}`);
  };

  const handleRemoveClick = () => {
    router.push(
      `/pools/remove/${selectedLP.token_0?.contract}/${selectedLP.token_1?.contract}`,
    );
  };

  return (
    <Modal open={isOpen} onClose={onDismiss}>
      <div>
        <ModalBox>
          <ContentWrapper isMobile={isMobile}>
            <Row justify="space-between" gap="40px">
              <AutoRow gap={'2px'} nowrap>
                <CurrencyLogo currency={selectedLP.token_0} size={isMobile ? '16px' : '24px'} />
                <CurrencyLogo
                  style={{ marginLeft: '-14px' }}
                  currency={selectedLP.token_1}
                  size={isMobile ? '16px' : '24px'}
                />
                <SubHeader style={{ whiteSpace: 'nowrap' }}>
                  {selectedLP?.token_0?.code} - {selectedLP?.token_1?.code}
                </SubHeader>
              </AutoRow>
              <CloseButton onClick={onDismiss} data-testid="confirmation-close-icon" />
            </Row>
            <Column gap="8px">
              <Typography variant="h6">Liquidity Pool</Typography>

              <Row justify="space-between">
                <BodyPrimary>Total LP</BodyPrimary>
                <BodyPrimary>{formatTokenAmount(selectedLP.totalShares)}</BodyPrimary>
              </Row>
              <Row justify="space-between">
                <Row gap="6px">
                  <CurrencyLogo currency={selectedLP.token_0} size="16px" />
                  <BodyPrimary>{selectedLP?.token_0?.code}</BodyPrimary>
                </Row>
                <BodyPrimary>{formatTokenAmount(selectedLP?.reserve0 as BigNumber)}</BodyPrimary>
              </Row>
              <Row justify="space-between">
                <Row gap="6px">
                  <CurrencyLogo currency={selectedLP.token_1} size="16px" />
                  <BodyPrimary>{selectedLP?.token_1?.code}</BodyPrimary>
                </Row>
                <BodyPrimary>{formatTokenAmount(selectedLP?.reserve1 as BigNumber)}</BodyPrimary>
              </Row>
              <Typography variant="h6">Your Liquidity</Typography>
              <Row justify="space-between">
                <BodyPrimary>Share of pool</BodyPrimary>
                <LPPercentage>{selectedLP.lpPercentage}%</LPPercentage>
              </Row>
              <Row justify="space-between">
                <BodyPrimary>LP Balance</BodyPrimary>
                <BodyPrimary>{formatTokenAmount(selectedLP.balance)}</BodyPrimary>
              </Row>

              <Row justify="space-between">
                <Row gap="6px">
                  <CurrencyLogo currency={selectedLP.token_0} size="16px" />
                  <BodyPrimary>{selectedLP?.token_0?.code}</BodyPrimary>
                </Row>
                <BodyPrimary>{formatTokenAmount(selectedLP?.myReserve0 as BigNumber)}</BodyPrimary>
              </Row>
              <Row justify="space-between">
                <Row gap="6px">
                  <CurrencyLogo currency={selectedLP.token_1} size="16px" />
                  <BodyPrimary>{selectedLP?.token_1?.code}</BodyPrimary>
                </Row>
                <BodyPrimary>{formatTokenAmount(selectedLP?.myReserve1 as BigNumber)}</BodyPrimary>
              </Row>
            </Column>
            <ButtonPrimary onClick={handleAddClick}>Add</ButtonPrimary>
            <ButtonOutlined onClick={handleRemoveClick}>Remove</ButtonOutlined>
          </ContentWrapper>
        </ModalBox>
      </div>
    </Modal>
  );
}
