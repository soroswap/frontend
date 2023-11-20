import { Box, Chip, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { SorobanContextType, useSorobanReact } from '@soroban-react/core';
import { AppContext } from 'contexts';
import React, { useContext, useEffect, useRef } from 'react';
import { shortenAddress } from '../../helpers/address';

export const HeaderChip = ({
  label,
  onClick,
  isSmall,
  ...rest
}: {
  label: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLDivElement> | undefined;
  isSmall?: boolean;
}) => {
  const theme = useTheme();
  return (
    <Chip
      sx={{
        display: 'inline-flex',
        height: isSmall ? 20 : 56,
        padding: isSmall ? '4px 2px' : '16px 24px',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
        borderRadius: isSmall ? '4px' : '16px',
        backgroundColor: '#8866DD',
        '&[aria-controls="menu-list-grow"], &:hover': {
          color: theme.palette.primary.light,
          '& svg': {
            stroke: theme.palette.primary.light,
          },
        },
        '& .MuiChip-label': {
          color: '#FFFFFF',
          fontSize: isSmall ? 14 : 20,
          fontFamily: 'Inter',
          fontWeight: 600,
          lineHeight: '140%',
        },
        ':hover': {
          backgroundColor: '#8866DD',
        },
      }}
      label={label}
      onClick={onClick}
      {...rest}
    />
  );
};

export const ActiveChainHeaderChip = ({ isMobile }: { isMobile?: boolean }) => {
  const sorobanContext: SorobanContextType = useSorobanReact();

  return <HeaderChip label={sorobanContext.activeChain?.name} isSmall={isMobile} />;
};

export default function ProfileSection() {
  const { ConnectWalletModal } = useContext(AppContext);
  const sorobanContext: SorobanContextType = useSorobanReact();
  const theme = useTheme();
  const { setConnectWalletModalOpen } = ConnectWalletModal;
  const isMobile = useMediaQuery(theme.breakpoints.down(1220));

  const handleClick = () => {
    setConnectWalletModalOpen(true);
  };

  return (
    <Box display="flex" gap="8px">
      {!isMobile && <ActiveChainHeaderChip />}
      <HeaderChip
        label={
          sorobanContext.address ? (
            <div>{shortenAddress(sorobanContext.address ?? '')}</div>
          ) : (
            <div>Connect wallet</div>
          )
        }
        onClick={handleClick}
      />
    </Box>
  );
}
