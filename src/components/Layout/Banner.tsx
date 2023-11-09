import { Box, Typography, useTheme } from '@mui/material';
import Link from 'next/link';
import { useState } from 'react';
import { X } from 'react-feather';

const Banner = () => {
  const theme = useTheme();

  const [show, setShow] = useState<boolean>(true);

  const handleClose = () => {
    setShow(false);
  };

  if (!show) return null;

  return (
    <Box
      height="30px"
      display="flex"
      alignItems="center"
      justifyContent="center"
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
        style={{ position: 'absolute', right: 10, cursor: 'pointer' }}
      />
    </Box>
  );
};

export default Banner;
