import React, { useState } from 'react';
import { Button, CircularProgress, Box, Typography, styled } from 'soroswap-ui';
import { useStellarWalletsKit } from 'soroban/StellarWalletsKitProvider';

const ConnectButton = styled(Button)(({ theme }) => ({
  height: '64px',
  fontWeight: 600,
  padding: '0 24px',
  borderRadius: '12px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)'
  }
}));

export function SWKWalletButton() {
  const { address, connect, disconnect, selectedWalletId } = useStellarWalletsKit();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect();
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getWalletName = () => {
    switch (selectedWalletId) {
      case 'freighter':
        return 'Freighter';
      case 'xbull':
        return 'xBull';
      case 'lobstr':
        return 'LOBSTR';
      case 'hana':
        return 'Hana';
      default:
        return 'Wallet';
    }
  };

  return (
    <ConnectButton
      variant="contained"
      color="primary"
      onClick={address ? handleDisconnect : handleConnect}
      disabled={isConnecting}
    >
      {isConnecting ? (
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="button">Connecting</Typography>
          <CircularProgress size={24} color="inherit" />
        </Box>
      ) : address ? (
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="button">
            {getWalletName()}: {shortenAddress(address)}
          </Typography>
        </Box>
      ) : (
        <Typography variant="button">Connect Wallet</Typography>
      )}
    </ConnectButton>
  );
}