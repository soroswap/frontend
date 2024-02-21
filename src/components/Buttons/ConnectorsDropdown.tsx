import React from 'react'

import {ButtonPrimary} from './Button'
import ButtonGroup from '@mui/material/ButtonGroup';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import { Grid } from '@mui/material';

const options = ['Use Freighter Wallet', 'Use xBull wallet'];

export function ConnectorsDropdown() {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(1);

  const handleClick = () => {
    console.info(`You clicked ${options[selectedIndex]}`);
  };

  const handleMenuItemClick = (
    index: number,
  ) => {
    setSelectedIndex(index);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setOpen(false);
  };

  const buttonStyle = {
    height: '100%',
    padding: '16px 24px',
    borderRadius: '0px',
    borderTopLeftRadius: '24px',
    borderBottomLeftRadius: '24px',
    zIndex: 2,
    whiteSpace:'nowrap', 
    overflow: 'hidden', 
    textOverflow: 'ellipsis'

  }

  const dropdownStyle = {
    boxShadow: '6px 0px 12px -5px rgba(38,43,66,0.2) inset',
    borderRadius: '0px',
    borderTopRightRadius: '24px',
    borderBottomRightRadius: '24px',
    zIndex: 1,
  }

  const menuStyle = {
    paddingTop: '-18px',
    borderRadius: '0px',
    borderBottomLeftRadius: '16px',
    borderBottomRightRadius: '16px',
    backgroundColor: 'rgb(136,102,221)',
    zIndex: '-1',
  }

  return (
    <Grid container>
        <Grid item xs={12}>
            <ButtonGroup
                variant="contained"
                ref={anchorRef}
                aria-label="Button group with a nested menu"
            >
                <Grid container>
                    <Grid item xs={10}>
                        <ButtonPrimary style={buttonStyle} onClick={handleClick}>{options[selectedIndex]}</ButtonPrimary>
                    </Grid>
                    <Grid item xs={2}>
                        <ButtonPrimary
                            style={dropdownStyle}
                            size="small"
                            aria-controls={open ? 'split-button-menu' : undefined}
                            aria-expanded={open ? 'true' : undefined}
                            aria-label="select merge strategy"
                            aria-haspopup="menu"
                            onClick={handleToggle}
                        >
                            <ArrowDropDownIcon />
                        </ButtonPrimary>
                    </Grid>
                </Grid>
            </ButtonGroup>
        </Grid>

        <Grid item xs={12}>
            <Popper
                sx={{
                zIndex: 1,
                }}
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
            >
                {({ TransitionProps, placement }) => (
                <Grow
                    {...TransitionProps}
                    style={{
                    transformOrigin:
                        placement === 'bottom' ? 'center top' : 'center bottom',
                    }}
                >
                    <Paper style={menuStyle}>
                        <ClickAwayListener onClickAway={handleClose}>
                            <MenuList id="split-button-menu" autoFocusItem>
                            {options.map((option, index) => (
                                <MenuItem
                                key={option}
                                selected={index === selectedIndex}
                                onClick={(event) => handleMenuItemClick(event, index)}
                                >
                                {option}
                                </MenuItem>
                            ))}
                            </MenuList>
                        </ClickAwayListener>
                    </Paper>
                </Grow>
                )}
            </Popper>
        </Grid>
    </Grid>
  );
}