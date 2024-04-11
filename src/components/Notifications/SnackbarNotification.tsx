import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import { SnackbarContent, styled, useTheme } from '@mui/material';
import swapIconDark from '../../assets/svg/swapIconDark.svg';
import swapIconLight from '../../assets/svg/swapIconLight.svg';
import Image from 'next/image';
import Column from 'components/Column';
import React, { useContext } from 'react';
import { AppContext, SnackbarIconType } from 'contexts';
import { AlertTriangle, MinusCircle, Plus, PlusCircle, Triangle } from 'react-feather';

const CustomSnackbarContent = styled(SnackbarContent, {
  shouldForwardProp: (prop) => prop !== 'error',
})<{ error?: boolean }>`
  border-radius: 16px;
  background: ${({ error, theme }) =>
    error
      ? `linear-gradient(${theme.palette.customBackground.bg1}, ${theme.palette.customBackground.bg1}) padding-box,
  linear-gradient(90deg, rgba(255,100,100,0.5) 0%, rgba(255,255,255,0) 35%, rgba(255,255,255,0) 65%, rgba(255,100,100,0.5) 100%) border-box`
      : `linear-gradient(${theme.palette.customBackground.bg1}, ${theme.palette.customBackground.bg1}) padding-box,
  linear-gradient(90deg, rgba(180,239,175,0.5) 0%, rgba(255,255,255,0) 35%, rgba(255,255,255,0) 65%, rgba(180,239,175,0.5) 100%) border-box`};
  border: 1px solid transparent;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(50px);
  margin-top: 7rem;
  color: ${({ theme }) => theme.palette.primary.main};
  font-weight: 500;
  font-size: 20px;
`;

const MessageWrapper = styled('div')`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

const SubtitleText = styled('span')<{ error?: boolean }>`
  color: ${({ error, theme }) =>
    error ? theme.palette.error.main : theme.palette.custom.textQuaternary};
  font-weight: 400;
  font-size: 14px;
`;

export default function SnackbarNotification() {
  const theme = useTheme();
  const { SnackbarContext } = useContext(AppContext);
  const { openSnackbar, setOpenSnackbar, snackbarTitle, snackbarMessage, snackbarType } =
    SnackbarContext;

  const handleClose = () => {
    setOpenSnackbar(false);
  };

  const Icon = () => {
    switch (snackbarType) {
      case SnackbarIconType.SWAP:
        return (
          <Image
            src={theme.palette.mode === 'dark' ? swapIconLight.src : swapIconDark.src}
            alt="swapIcon"
            width={32}
            height={32}
          />
        );
      case SnackbarIconType.MINT:
        return <Plus width={32} height={32} />;
      case SnackbarIconType.ADD_LIQUIDITY:
        return <PlusCircle width={32} height={32} />;
      case SnackbarIconType.REMOVE_LIQUIDITY:
        return <MinusCircle width={32} height={32} />;
      case SnackbarIconType.ERROR:
        return <AlertTriangle width={32} height={32} />;
      default:
        return (
          <Image
            src={theme.palette.mode === 'dark' ? swapIconLight.src : swapIconDark.src}
            alt="swapIcon"
            width={32}
            height={32}
          />
        );
    }
  };

  const message = (
    <React.Fragment>
      <MessageWrapper>
        {Icon()}
        <Column>
          <div>{snackbarTitle}</div>
          <SubtitleText error={snackbarType === SnackbarIconType.ERROR}>
            {snackbarMessage}
          </SubtitleText>
        </Column>
      </MessageWrapper>
    </React.Fragment>
  );

  return (
    <Box sx={{ width: 500 }}>
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={openSnackbar}
        onClose={handleClose}
        autoHideDuration={5000}
      >
        <CustomSnackbarContent message={message} error={snackbarType === SnackbarIconType.ERROR} />
      </Snackbar>
    </Box>
  );
}
