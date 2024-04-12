import { Box, CircularProgress } from "@mui/material";
import { getSubstrateChain, useInkathon } from "@scio-labs/use-inkathon";
import { useSorobanReact } from "@soroban-react/core";
import { ButtonPrimary } from "components/Buttons/Button";
import { ButtonText } from "components/Text";

interface PendulumBridgeButtonProps {
  isLoading?: boolean;
  disabled?: boolean;
  callback: () => void;
}

export function BridgeButton({ isLoading, disabled, callback }: PendulumBridgeButtonProps) {
  const { address } = useSorobanReact();
  const {
    connect,
    isConnected,
    isConnecting,
  } = useInkathon();

  const handleConnect = async () => {
    const substrateChain = getSubstrateChain('pendulum');
    
    await connect?.(substrateChain);
  };

  const buttonText = () => {
    if (!address) {
      return "Connect Wallet"
    }
    if (!isConnected) {
      return "Connect Pendulum wallet"
    }
    if (isConnected) {
      return "Bridge"
    }
  }

  const handleButtonClick = () => {
    if (!isConnected) {
      handleConnect()
    } else {
      callback()
    }
  }
  
  return (
    <div>
      <ButtonPrimary
        disabled={isConnecting || isLoading || !address || disabled}
        onClick={handleButtonClick}
        sx={{ height: '64px' }}
      >
        <ButtonText fontSize={20} fontWeight={600}>
          {isLoading || isConnecting ? (
            <Box display="flex" alignItems="center" component="span">
              <CircularProgress size="24px" />
            </Box>
          ) : (
              <>{buttonText()}</>
          )}
        </ButtonText>
      </ButtonPrimary>
    </div>
  );
}