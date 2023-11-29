import { Box, Switch, SwitchProps, useMediaQuery } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { Menu } from 'react-feather';
import soroswapLogoPurpleBlack from '../../assets/svg/SoroswapPurpleBlack.svg';
import soroswapLogoPurpleWhite from '../../assets/svg/SoroswapPurpleWhite.svg';
import darkModeMoon from '../../assets/svg/darkModeMoon.svg';
import lightModeSun from '../../assets/svg/lightModeSun.svg';
import { ColorModeContext } from '../../contexts';
import ProfileSection, { ActiveChainHeaderChip } from './ProfileSection';

const MainBox = styled('div')<{ isMobile: boolean }>`
  display: flex;
  width: 100%;
  padding: ${({ isMobile }) => (isMobile ? '24px 15px' : '24px 75px')};
  align-items: center;
  justify-content: space-between;
  gap: 40px;
`;

const NavBar = styled('div')`
  display: flex;
  height: 56px;
  padding: 8px 16px;
  align-items: center;
  gap: 8px;
  border-radius: 32px;
  background: ${({ theme }) => theme.palette.background.paper};
  box-shadow: 0px 4px 10px 0px rgba(136, 102, 221, 0.03);
`;

const NavBarMobile = styled('div')`
  display: flex;
  height: 48px;
  width: 100%;
  padding: 8px 16px;
  align-items: center;
  gap: 8px;
  border-radius: 32px;
  background: ${({ theme }) => theme.palette.background.paper};
  box-shadow: 0px 4px 10px 0px rgba(136, 102, 221, 0.03);
`;

const NavBarContainer = styled('div')`
  position: fixed;
  bottom: 1rem;
  display: flex;
  left: 50%;
  transform: translateX(-50%);
`;

const ButtonsBox = styled('div')`
  display: flex;
  align-items: center;
`;

const NavItem = styled(Link, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>`
  display: flex;
  padding: 4px 24px;
  align-items: center;
  gap: 10px;
  border-radius: 32px;
  background: ${({ active }) => (active ? '#8866DD' : '')};
  text-align: center;
  color: ${({ theme, active }) => (active ? '#FFFFFF' : theme.palette.custom.textTertiary)};
  font-family: Inter;
  font-size: 20px;
  font-weight: 600;
  line-height: 140%;
`;

const NavItemMobile = styled(Link, {
  shouldForwardProp: (prop) => prop !== 'active',
})<{ active?: boolean }>`
  display: flex;
  padding: 8px 18px;
  align-items: center;
  gap: 10px;
  border-radius: 18px;
  background: ${({ active }) => (active ? '#8866DD' : '')};
  text-align: center;
  color: ${({ theme, active }) => (active ? '#FFFFFF' : theme.palette.custom.textTertiary)};
  font-family: Inter;
  font-size: 16px;
  font-weight: 600;
  line-height: 100%;
`;

export const ModeSwitch = styled((props: SwitchProps) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 104,
  height: 56,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 8,
    '&.Mui-checked': {
      transform: 'translateX(46px)',
      color: '#8866DD',
      '& .MuiSwitch-thumb:before': {
        backgroundColor: '#8866DD',
        borderRadius: 32,
        backgroundImage: `url('${darkModeMoon.src}')`,
      },
      '& + .MuiSwitch-track': {
        backgroundColor: theme.palette.background.paper,
        opacity: 1,
        border: 0,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: '#F88F6D',
    width: 40,
    height: 40,
    '&:before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundImage: `url('${lightModeSun.src}')`,
    },
  },
  '& .MuiSwitch-track': {
    borderRadius: 32,
    backgroundColor: theme.palette.background.paper,
    opacity: 1,
  },
}));

interface HeaderProps {
  isDrawerOpen: boolean;
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Header({ isDrawerOpen, setDrawerOpen }: HeaderProps) {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);

  const router = useRouter();
  const { pathname } = router;

  const isMobile = useMediaQuery(theme.breakpoints.down(1220));

  const logoWidth = isMobile ? 88 : 162;
  const logoHeight = isMobile ? 30 : 56;

  return (
    <>
      <MainBox isMobile={isMobile}>
        <Image
          src={
            theme.palette.mode === 'dark'
              ? soroswapLogoPurpleWhite.src
              : soroswapLogoPurpleBlack.src
          }
          width={88}
          height={32}
          style={{
            width: '100%',
            height: '100%',
            maxWidth: logoWidth,
            maxHeight: logoHeight,
            minHeight: 30,
            minWidth: 88,
          }}
          alt={'Soroswap'}
        />
        {!isMobile ? (
          <>
            <NavBar data-testid="nav">
              <NavItem href={'/balance'} active={pathname.includes('/balance')} data-testid='nav-link'>
                Balance
              </NavItem>
              <NavItem href={'/swap'} active={pathname.includes('/swap')} data-testid='nav-link'>
                Swap
              </NavItem>
              <NavItem href={'/liquidity'} active={pathname.includes('/liquidity')} data-testid='nav-link'>
                Liquidity
              </NavItem>
              {/* <NavItem href={'/mint'} active={pathname.includes('/mint')}>
                Mint
              </NavItem> */}
            </NavBar>
            <ButtonsBox>
              <ModeSwitch
                sx={{ m: 1 }}
                defaultChecked={theme.palette.mode === 'dark' ? true : false}
                onChange={(e) => colorMode.toggleColorMode()}
              />
              <ProfileSection />
            </ButtonsBox>
          </>
        ) : (
          <>
            <Box display="flex" alignItems="center" gap="18px">
              <ActiveChainHeaderChip isMobile={isMobile} />
              <Menu
                onClick={() => setDrawerOpen(!isDrawerOpen)}
                width={24}
                height={24}
                color={theme.palette.custom.borderColor}
              />
            </Box>
            <NavBarContainer>
              <NavBarMobile>
                <NavItemMobile href={'/balance'} active={pathname.includes('/balance')}>
                  Balance
                </NavItemMobile>
                <NavItemMobile href={'/swap'} active={pathname.includes('/swap')}>
                  Swap
                </NavItemMobile>
                <NavItemMobile href={'/liquidity'} active={pathname.includes('/liquidity')}>
                  Liquidity
                </NavItemMobile>
                {/* <NavItemMobile href={'/mint'} active={pathname.includes('/mint')}>
                  Mint
                </NavItemMobile> */}
              </NavBarMobile>
            </NavBarContainer>
          </>
        )}
      </MainBox>
    </>
  );
}
