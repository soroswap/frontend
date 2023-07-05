import React from 'react';
import Typography from '@mui/material/Typography';

import { useTheme } from '@mui/material/styles';
import { Avatar, Box, ButtonBase, IconButton } from '@mui/material';
import ProfileSection from './ProfileSection';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { ColorModeContext } from '../../contexts';

interface HeaderProps{
  handleDrawerToggle: () => void;
}

export default function Header({handleDrawerToggle}:HeaderProps) {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);

  return (
<>
      <Box
        sx={{
          width: 228,
          display: 'flex',
          alignItems: 'center',
          [theme.breakpoints.down('md')]: {
            width: 'auto'
          }
        }}
      >
        <Box component="span" sx={{ display: { xs: 'none', md: 'block' }, flexGrow: 1 }}>
          <img src={"https://upload.wikimedia.org/wikipedia/commons/e/e7/Uniswap_Logo.svg"} height={64} width={64} alt={'Soroswap'} />
        </Box>

        <Box component="span" sx={{ display: { xs: 'none', md: 'block' } }}>
          <Typography component="div">
            Soroswap AMM
          </Typography>
        </Box>

       {/* Hamburger button */}
        <ButtonBase sx={{ borderRadius: '8px', overflow: 'hidden', height: '34px' }}>
          <Avatar
            variant="rounded"
            sx={{
              cursor: 'pointer',
              borderRadius: '8px',
              width: '34px',
              height: '34px',
              fontSize: '1.2rem',
              transition: 'all .2s ease-in-out',
              background: theme.palette.primary.dark,
              color: theme.palette.primary.light,
              '&:hover': {
                background: theme.palette.primary.light,
                color: theme.palette.primary.dark
              }
            }}
            onClick={handleDrawerToggle}
            color="inherit"
          >
            <MenuIcon />
          </Avatar>
        </ButtonBase>
      </Box>

      <Box sx={{ flexGrow: 1 }} />
      <Box sx={{ flexGrow: 1 }} />
      <IconButton sx={{ ml: 1 }} onClick={colorMode.toggleColorMode} color="inherit">
          {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
      <ProfileSection />
    </>
  );
}
