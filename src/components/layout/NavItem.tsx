// material-ui
import { useTheme } from "@mui/material/styles";
import {
  Avatar,
  Chip,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
} from "@mui/material";
import React, { useState } from "react";
import Link from "next/link";

interface NavItemProps {
  item: any;
  level: any;
}

export default function NavItem({ item, level }:NavItemProps) {
  const theme = useTheme();
  // const customization = useSelector((state) => state.customization);
  const matchesSM = useMediaQuery(theme.breakpoints.down("lg"));

  const Icon = item.icon;

  // let itemTarget = '_self';
  // if (item.target) {
  //   itemTarget = '_blank';
  // }

  // let listItemProps = {
  //   component: forwardRef((props, ref) => <Link ref={ref} {...props} to={item.url} target={itemTarget} />)
  // };
  // if (item?.external) {
  //   listItemProps = { component: 'a', href: item.url, target: itemTarget };
  // }

  // const itemHandler = (id) => {
  //   dispatch({ type: MENU_OPEN, id });
  //   if (matchesSM) dispatch({ type: SET_MENU, opened: false });
  // };

  // // active menu item on page load
  // useEffect(() => {
  //   const currentIndex = document.location.pathname
  //     .toString()
  //     .split('/')
  //     .findIndex((id) => id === item.id);
  //   if (currentIndex > -1) {
  //     dispatch({ type: MENU_OPEN, id: item.id });
  //   }
  //   // eslint-disable-next-line
  // }, [pathname]);

  return (
    <Link href={item.url}>
      <ListItemButton
        // {...listItemProps}
        disabled={item.disabled}
        sx={{
          borderRadius: 10,
          m: 2,
          alignItems: "flex-start",
          backgroundColor: theme.palette.primary.main,
          py: 1.25,
          pl: `${level * 24}px`,
        }}
        selected={false}
      >
        <ListItemIcon sx={{ my: "auto", minWidth: !item?.icon ? 18 : 36 }}>
          <Icon />
        </ListItemIcon>
        <ListItemText
          primary={
            <Typography variant={"body1"} color="inherit">
              {item.title}
            </Typography>
          }
          secondary={
            item.caption && (
              <Typography variant="caption" display="block" gutterBottom>
                {item.caption}
              </Typography>
            )
          }
        />
        {item.chip && (
          <Chip
            color={item.chip.color}
            variant={item.chip.variant}
            size={item.chip.size}
            label={item.chip.label}
            avatar={item.chip.avatar && <Avatar>{item.chip.avatar}</Avatar>}
          />
        )}
      </ListItemButton>
    </Link>
  );
}
