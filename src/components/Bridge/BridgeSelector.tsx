import {
  CurrencySelect,
  StyledDropDown,
  StyledTokenName,
  Aligner,
} from 'components/CurrencyInputPanel/SwapCurrencyInputPanel';
import { Asset } from 'stellar-sdk';
import { Box, Modal, Typography, styled, useMediaQuery, useTheme } from '@mui/material';
import { BridgeChains } from './BridgeComponentNew';
import { opacify } from 'themes/utils';
import { RowFixed } from 'components/Row';
import Column from 'components/Column';
import CurrencyLogo from 'components/Logo/CurrencyLogo';
import useBoolean from 'hooks/useBoolean';
import { useGetBridgeAssetInfo } from 'hooks/bridge/pendulum/useGetBridgeAssetInfo';
import BridgeAssetItem from './BridgeAssetItem';

export const ModalContentWrapper = styled(Column, {
  shouldForwardProp: (prop) => prop !== 'modalheight',
})<{ modalheight?: number | string }>`
  overflow: hidden;
  border-radius: 20px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% - 40px);
  max-width: 500px;
  height: ${({ modalheight }) => modalheight ?? '90px'};
  min-height: 90px;
  background: ${({ theme }) => `linear-gradient(${theme.palette.customBackground.module}, ${
    theme.palette.customBackground.module
  }) padding-box,
              linear-gradient(150deg, rgba(136,102,221,1) 0%, rgba(${
                theme.palette.mode == 'dark' ? '33,29,50,1' : '255,255,255,1'
              }) 35%, rgba(${
                theme.palette.mode == 'dark' ? '33,29,50,1' : '255,255,255,1'
              }) 65%, rgba(136,102,221,1) 100%) border-box`};
  border: 1px solid transparent;
`;

const ModalLeftContainer = styled(Box)`
  width: 180px;
  height: 100%;
  border-right: 1px solid ${({ theme }) => opacify(30, theme.palette.custom.borderColor)};
  padding: 0px 8px 24px 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ModalRightContainer = styled(Box)`
  height: 100%;
  width: calc(100% - 180px);
  padding: 0px 24px 24px 0px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SelectItemContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isSelected' && prop !== 'isDisabled',
})<{ isSelected?: boolean; isDisabled?: boolean }>`
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  cursor: ${({ isDisabled }) => (isDisabled ? 'default' : 'pointer')};
  &:hover {
    background-color: ${({ theme, isDisabled }) =>
      isDisabled ? 'transparent' : theme.palette.customBackground.interactive};
  }
  background-color: ${({ isSelected, theme }) =>
    isSelected ? theme.palette.customBackground.interactive : 'transparent'};
  transition: background-color 0.2s;
  opacity: ${({ isDisabled }) => (isDisabled ? 0.5 : 1)};
`;

interface Props {
  assets: Asset[];
  chains: { name: BridgeChains; icon: JSX.Element }[];
  modalTitle: string;
  selectedChain: BridgeChains | null;
  setSelectedChain: React.Dispatch<React.SetStateAction<BridgeChains | null>>;
  selectedAsset: Asset | undefined;
  setSelectedAsset: React.Dispatch<React.SetStateAction<Asset | undefined>>;
  disabled?: boolean;
  disabledChains?: (BridgeChains | null)[];
}

const BridgeSelector = (props: Props) => {
  const {
    assets,
    chains,
    disabled,
    disabledChains,
    modalTitle,
    selectedAsset,
    selectedChain,
    setSelectedAsset,
    setSelectedChain,
  } = props;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const modal = useBoolean();

  const onSelectAsset = (asset: Asset) => {
    if (!selectedChain) return;
    setSelectedAsset(asset);
    modal.setFalse();
  };

  const onSelectChain = (chainName: BridgeChains) => {
    setSelectedChain(chainName);

    if (selectedAsset) {
      modal.setFalse();
    }
  };

  const { code, token } = useGetBridgeAssetInfo({ asset: selectedAsset, chain: selectedChain });

  return (
    <>
      <Modal open={modal.value} onClose={modal.setFalse}>
        <div>
          <ModalContentWrapper modalheight="60vh">
            <Typography
              variant="h6"
              sx={{
                padding: '16px 24px 12px 18px',
              }}
            >
              {modalTitle}
            </Typography>
            <Box display="flex" height="100%" gap={2}>
              <ModalLeftContainer>
                {chains.map((chain, index) => {
                  const isDisabled = disabledChains?.includes(chain.name);
                  return (
                    <SelectItemContainer
                      key={index}
                      isSelected={selectedChain === chain.name}
                      onClick={() => (isDisabled ? null : onSelectChain(chain.name))}
                      isDisabled={isDisabled}
                    >
                      {chain.icon}
                      <Typography variant="body1">{chain.name}</Typography>
                    </SelectItemContainer>
                  );
                })}
              </ModalLeftContainer>
              <ModalRightContainer>
                {assets.map((asset, index) => (
                  <SelectItemContainer
                    key={index}
                    isSelected={selectedAsset?.code === asset.code}
                    onClick={() => onSelectAsset(asset)}
                    isDisabled={!selectedChain}
                  >
                    <BridgeAssetItem asset={asset} chain={selectedChain} />
                  </SelectItemContainer>
                ))}
              </ModalRightContainer>
            </Box>
          </ModalContentWrapper>
        </div>
      </Modal>
      <Box>
        <CurrencySelect
          visible
          disabled={disabled}
          selected={!!selectedAsset && !!selectedChain}
          onClick={modal.setTrue}
        >
          <Aligner>
            <RowFixed>
              {selectedAsset && selectedChain && (
                <CurrencyLogo
                  style={{ marginRight: '2px' }}
                  currency={token}
                  size={isMobile ? '16px' : '24px'}
                />
              )}

              <StyledTokenName className="token-symbol-container">
                {selectedChain && selectedAsset ? code : 'Select token'}
              </StyledTokenName>
            </RowFixed>
            <StyledDropDown selected={true} />
          </Aligner>
        </CurrencySelect>
      </Box>
    </>
  );
};

export default BridgeSelector;
