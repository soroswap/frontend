import Row from 'components/Row';
import { useUserSlippageTolerance } from 'state/user/hooks';
import { styled, useMediaQuery, useTheme } from 'soroswap-ui';
import { Settings } from 'react-feather';
import settingsIcon from '../../../assets/svg/settingsIcon.svg';
import Image from 'next/image';
import { DEFAULT_SLIPPAGE_INPUT_VALUE } from '../MaxSlippageSettings';

const Icon = styled(Settings)`
  height: 24px;
  width: 24px;
`;

const Button = styled('button') <{ isActive: boolean }>`
  border: none;
  background-color: transparent;
  margin: 0;
  padding: 0;
  cursor: pointer;
  outline: none;

  :not([disabled]):hover {
    opacity: 0.7;
  }

  ${({ isActive }) => isActive && `opacity: 0.7`}
`;

const IconContainer = styled(Row)`
  padding: 6px 12px;
  border-radius: 16px;
`;

const IconContainerWithSlippage = styled(IconContainer)`
  div {
    color: ${({ theme }) => theme.palette.secondary.main};
  }

  background-color: transparent};
`;

const ButtonContent = () => {
  const [userSlippageTolerance] = useUserSlippageTolerance();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (userSlippageTolerance === DEFAULT_SLIPPAGE_INPUT_VALUE) {
    return (
      <IconContainer>
        <Image
          width={isMobile ? 24 : 32}
          height={isMobile ? 24 : 32}
          src={settingsIcon.src}
          alt="Settings"
        />
      </IconContainer>
    );
  }

  return (
    <IconContainerWithSlippage data-testid="settings-icon-with-slippage" gap="sm">
      <Image
        width={isMobile ? 24 : 32}
        height={isMobile ? 24 : 32}
        src={settingsIcon.src}
        alt="Settings"
      />
    </IconContainerWithSlippage>
  );
};

export default function MenuButton({
  onClick,
  isActive,
}: {
  onClick: () => void;
  isActive: boolean;
}) {
  return (
    <Button
      onClick={onClick}
      isActive={isActive}
      id="open-settings-dialog-button"
      data-testid="open-settings-dialog-button"
    >
      <ButtonContent />
    </Button>
  );
}
