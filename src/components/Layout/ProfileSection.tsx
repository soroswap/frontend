import { Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { SorobanContextType, useSorobanReact } from '@soroban-react/core';
import { AppContext } from 'contexts';
import { useContext, useRef } from 'react';
import { shortenAddress } from '../../helpers/address';

export default function ProfileSection() {
  const theme = useTheme();
  const { ConnectWalletModal } = useContext(AppContext);
  const sorobanContext: SorobanContextType = useSorobanReact();

  const anchorRef = useRef(null);

  const { isConnectWalletModalOpen, setConnectWalletModalOpen } = ConnectWalletModal;

  const handleClick = () => {
    setConnectWalletModalOpen(true);
  };

  return (
    <>
      <Chip
        sx={{
          display: 'inline-flex',
          height: 56,
          padding: '16px 24px',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
          borderRadius: '16px',
          backgroundColor: '#8866DD',
          '&[aria-controls="menu-list-grow"], &:hover': {
            color: theme.palette.primary.light,
            '& svg': {
              stroke: theme.palette.primary.light,
            },
          },
          '& .MuiChip-label': {
            color: '#FFFFFF',
            fontSize: 20,
            fontFamily: 'Inter',
            fontWeight: 600,
            lineHeight: '140%',
          },
          ':hover': {
            backgroundColor: '#8866DD',
          },
        }}
        label={
          sorobanContext.address ? (
            <div>{shortenAddress(sorobanContext.address ?? '')}</div>
          ) : (
            <div>Connect wallet</div>
          )
        }
        ref={anchorRef}
        onClick={handleClick}
      />
    </>
  );
}
