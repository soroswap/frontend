import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { X } from 'react-feather';
import Link from 'next/link';

interface Props {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}

const Banner = ({ show, setShow }: Props) => {
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClose = () => {
    setShow(false);
  };

  if (!show) return null;

  return (
    <Box
      padding="8px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      paddingRight={isMobile ? '35px' : '0px'}
      sx={{ backgroundColor: theme.palette.customBackground.accentAction }}
    >
      <Typography fontSize="14px" textAlign="center" color="white">
        Soroswap.Finance is currently working on Testnet. Click
        <Link
          href="https://google.com"
          target="_blank"
          style={{ marginRight: 3, marginLeft: 3, textDecoration: 'underline' }}
        >
          here
        </Link>
        to learn more.
      </Typography>

      <X
        onClick={handleClose}
        size="18px"
        color="white"
        style={{
          position: 'absolute',
          right: 10,
          cursor: 'pointer',
        }}
      />
    </Box>
  );
};

export default Banner;
