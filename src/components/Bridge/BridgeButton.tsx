/* eslint-disable @next/next/no-img-element */
import { Box, CircularProgress } from 'soroswap-ui';
import { ButtonPrimary } from 'components/Buttons/Button';
import { ButtonText } from 'components/Text';
import { ConnectPendulumWalletButton } from './ConnectPendulumWalletButton';
import { useInkathon } from '@scio-labs/use-inkathon';
import { useSorobanReact } from '@soroban-react/core';

interface PendulumBridgeButtonProps {
  isLoading?: boolean;
  disabled?: boolean;
  callback: () => void;
  text?: string; // Optional text to force display
}

export function BridgeButton({ isLoading, disabled, callback, text }: PendulumBridgeButtonProps) {
  const { address } = useSorobanReact();
  const { isConnecting, isConnected } = useInkathon();

  if (!isConnected) {
    return <ConnectPendulumWalletButton />;
  }

  return (
    <>
      <div>
        <ButtonPrimary
          disabled={isConnecting || isLoading || !address || disabled}
          onClick={callback}
          sx={{ height: '64px' }}
        >
          <ButtonText fontSize={20} fontWeight={600}>
            {isLoading || isConnecting ? (
              <Box display="flex" alignItems="center" component="span">
                <CircularProgress size="24px" />
              </Box>
            ) : (
              <>{text || 'Send'}</>
            )}
          </ButtonText>
        </ButtonPrimary>
      </div>
    </>
  );
}
