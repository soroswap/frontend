import React from "react";
import { styled, useTheme } from "@mui/material/styles";
import { Avatar, Box, ButtonBase, FormControlLabel, IconButton, Switch, SwitchProps, useMediaQuery } from "@mui/material";
import ProfileSection from "./ProfileSection";
import MenuIcon from "@mui/icons-material/Menu";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { ColorModeContext } from "../../contexts";
import logo from '../../assets/svg/LogoAndText.svg'
import soroswapLogoPurpleWhite from '../../assets/svg/SoroswapPurpleWhite.svg'
import soroswapLogoPurpleBlack from '../../assets/svg/SoroswapPurpleBlack.svg'
import darkModeMoon from '../../assets/svg/darkModeMoon.svg'
import lightModeSun from '../../assets/svg/lightModeSun.svg'
import Image from "next/image";
import { useRouter } from "next/router";
import Link from "next/link";
import { Menu } from "react-feather";

const MainBox = styled('div')<{ isMobile: boolean }>`
  display: flex;
  width: 100%;
  padding: ${({ isMobile }) => isMobile ? '24px 15px' : '24px 75px'};
  align-items: center;
  justify-content: space-between;
  gap: 40px;
`

const NavBar = styled('div')`
  display: flex;
  height: 56px;
  padding: 8px 16px;
  align-items: center;
  gap: 8px;
  border-radius: 32px;
  background: ${({ theme }) => theme.palette.background.paper};
  box-shadow: 0px 4px 10px 0px rgba(136, 102, 221, 0.03);
`

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
`

const NavBarContainer = styled('div')`
  position: fixed;
  bottom: 1rem;
  display: flex;
  left: 50%;
  transform: translateX(-50%);
`

const ButtonsBox = styled('div')`
  display: flex;
  align-items: center;
`

const NavItem = styled(Link)<{active?: boolean}>`
  display: flex;
  padding: 4px 24px;
  align-items: center;
  gap: 10px;
  border-radius: 32px;
  background: ${({ active }) => (active ? "#8866DD" : "")};
  text-align: center;
  color: ${({ theme, active }) => (active ? "#FFFFFF" : theme.palette.custom.textTertiary)};
  font-family: Inter;
  font-size: 20px;
  font-weight: 600;
  line-height: 140%;
`

const NavItemMobile = styled(Link)<{active?: boolean}>`
  display: flex;
  padding: 8px 18px;
  align-items: center;
  gap: 10px;
  border-radius: 18px;
  background: ${({ active }) => (active ? "#8866DD" : "")};
  text-align: center;
  color: ${({ theme, active }) => (active ? "#FFFFFF" : theme.palette.custom.textTertiary)};
  font-family: Inter;
  font-size: 16px;
  font-weight: 600;
  line-height: 100%;
`

const ModeSwitch = styled((props: SwitchProps) => (
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
}

export default function Header({}: HeaderProps) {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);

  const router = useRouter();
  const { pathname } = router;

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  
  const logoWidth = isMobile ? 88 : 162
  const logoHeight = isMobile ? 30 : 56

  return (
    <>
      <MainBox isMobile={isMobile}>
        <Image src={theme.palette.mode === "dark" ? soroswapLogoPurpleWhite.src : soroswapLogoPurpleBlack.src} width={logoWidth} height={logoHeight} alt={"Soroswap"} />
        {!isMobile ? (
          <>
            <NavBar>
              <NavItem href={"/"} active={pathname === "/"}>Balance</NavItem>
              <NavItem href={"/swap"} active={pathname.includes("/swap")}>Swap</NavItem>
              <NavItem href={"/liquidity"} active={pathname.includes("/liquidity")}>Liquidity</NavItem>
              <NavItem href={"/mint"} active={pathname.includes("/mint")}>Mint</NavItem>
              <NavItem href={"/all"} active={pathname.includes("/all")}>All</NavItem>
            </NavBar>
            <ButtonsBox>
              <ModeSwitch
                sx={{ m: 1 }}
                defaultChecked={theme.palette.mode === "dark" ? true : false}
                onChange={(e) => colorMode.toggleColorMode()}
              />
              <ProfileSection />
            </ButtonsBox>
          </>
        ) : (
          <>
              <Menu width={24} height={24} color={theme.palette.custom.borderColor} />
              <NavBarContainer>
                <NavBarMobile>
                  <NavItemMobile href={"/swap"} active={pathname.includes("/swap")}>Swap</NavItemMobile>
                  <NavItemMobile href={"/liquidity"} active={pathname.includes("/liquidity")}>Liquidity</NavItemMobile>
                  <NavItemMobile href={"/mint"} active={pathname.includes("/mint")}>Mint</NavItemMobile>
                </NavBarMobile>
              </NavBarContainer>
          </>
        )}
      </MainBox>
    </>
  );
}