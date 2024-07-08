import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Box, Switch, SwitchProps, useMediaQuery, styled, useTheme, Navbar } from 'soroswap-ui';
import soroswapLogoPurpleBlack from 'assets/svg/SoroswapPurpleBlack.svg';
import soroswapLogoPurpleWhite from 'assets/svg/SoroswapPurpleWhite.svg';
import darkModeMoon from 'assets/svg/darkModeMoon.svg';
import lightModeSun from 'assets/svg/lightModeSun.svg';
import { ColorModeContext } from 'contexts';
import ProfileSection, { ActiveChainHeaderChip } from './ProfileSection';

const MainBox = styled('div') <{ isMobile: boolean }>`
  display: flex;
  width: 100%;
  padding: ${({ isMobile }) => (isMobile ? '24px 15px' : '24px 75px')};
  align-items: center;
  justify-content: space-between;
  gap: 40px;
`;

const ButtonsBox = styled('div')`
  display: flex;
  align-items: center;
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

const DrawerExtraContent = () => {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" p={1}>
        <ProfileSection />
        <ModeSwitch
          sx={{ m: 1 }}
          defaultChecked={theme.palette.mode === 'dark' ? true : false}
          onChange={(e) => colorMode.toggleColorMode()}
        />
      </Box>
    </Box>
  );
};

const HeaderNavbar = () => {
  const theme = useTheme();
  const router = useRouter();
  const { pathname } = router;
  const isMobile = useMediaQuery(theme.breakpoints.down(1220));

  return (
    <Navbar
      onClickItem={(item) => {
        if (item.label === 'Info') {
          window.open(`https://info.soroswap.finance`, '_self');
        } else {
          router.push(item.path);
        }
      }}
      isActiveItem={(item) => {
        if (item.label === 'Info') return false;
        if (item.label === 'Swap' && pathname === '/') return true;
        return item.path === pathname;
      }}
      isMobile={isMobile}
      size="lg"
      mobileProps={{
        drawerMarginTop: 78,
        extraContent: <DrawerExtraContent />,
      }}
    />
  );
};

export default function Header() {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);

  const isMobile = useMediaQuery(theme.breakpoints.down(1220));

  const logoWidth = isMobile ? 88 : 162;
  const logoHeight = isMobile ? 30 : 56;

  const HeaderContainer = ({ children }: { children: React.ReactNode }) => {
    if (isMobile) {
      return (
        <Box display="flex" alignItems="flex-start" gap="18px">
          {children}
        </Box>
      );
    }
    return <>{children}</>;
  };

  interface NavItem {
    href: string;
    label: string;
    target?: string;
    test_id?: string;
  }

  const navItems: NavItem[] = [
    { href: '/balance', label: 'Balance', target: '_self', test_id: 'balance__link' },
    { href: '/swap', label: 'Swap', target: '_self', test_id: 'swap__link"' },
    { href: '/liquidity', label: 'Liquidity', target: '_self', test_id: 'liquidity__link"' },
    { href: '/bridge', label: 'Bridge', target: '_self', test_id: 'bridge__link"' },
    { href: 'https://info.soroswap.finance', label: 'Info', target: '_blank', test_id: 'info__link"' },
  ];

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
        <HeaderContainer>
          {isMobile && <ActiveChainHeaderChip isMobile={isMobile} />}
          <Box data-testid="navbar__container">
            <HeaderNavbar />
          </Box>
          {!isMobile && (
            <ButtonsBox>
              <ModeSwitch
                sx={{ m: 1 }}
                defaultChecked={theme.palette.mode === 'dark' ? true : false}
                onChange={(e) => colorMode.toggleColorMode()}
              />
              <ProfileSection />
            </ButtonsBox>
          )}
        </HeaderContainer>
      </MainBox>
    </>
  );
}
