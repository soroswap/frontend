import { Box, Typography, useMediaQuery, useTheme } from '@mui/material';
import Link from 'next/link';
import { useState } from 'react';
import { X } from 'react-feather';

const Banner = () => {
  const theme = useTheme();

  const [show, setShow] = useState<boolean>(true);

  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClose = () => {
    setShow(false);
  };

  if (!show) return null;

  return (
    <Box
      padding="4px"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection={isMobile ? 'column' : 'row'}
      sx={{ backgroundColor: theme.palette.customBackground.accentAction }}
    >
      <Typography
        fontSize="14px"
        textAlign="center"
        color="white"
        width={isMobile ? '300px' : '100%'}
      >
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
          position: isMobile ? 'initial' : 'absolute',
          right: 10,
          cursor: 'pointer',
          marginTop: isMobile ? 10 : 0,
          marginBottom: isMobile ? 5 : 0,
        }}
      />
    </Box>
  );
};

export default Banner;
