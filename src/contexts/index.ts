import React from 'react';

type ConnectWalletModalType = {
  isConnectWalletModalOpen: boolean;
  setConnectWalletModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export enum SnackbarIconType {
  MINT,
  SWAP,
  ADD_LIQUIDITY,
  REMOVE_LIQUIDITY,
  ERROR,
}

export type SnackbarContextType = {
  openSnackbar: boolean;
  snackbarMessage: string;
  snackbarTitle: string;
  snackbarType: SnackbarIconType;
  setOpenSnackbar: React.Dispatch<React.SetStateAction<boolean>>;
  setSnackbarMessage: React.Dispatch<React.SetStateAction<string>>;
  setSnackbarTitle: React.Dispatch<React.SetStateAction<string>>;
  setSnackbarType: React.Dispatch<React.SetStateAction<SnackbarIconType>>;
};

type AppContextType = {
  ConnectWalletModal: ConnectWalletModalType;
  SnackbarContext: SnackbarContextType;
};

export const ColorModeContext = React.createContext({
  toggleColorMode: () => {},
});

export const AppContext = React.createContext<AppContextType>({
  ConnectWalletModal: {
    isConnectWalletModalOpen: false,
    setConnectWalletModalOpen: () => {},
  },
  SnackbarContext: {
    openSnackbar: false,
    snackbarMessage: '',
    snackbarTitle: '',
    snackbarType: SnackbarIconType.SWAP,
    setOpenSnackbar: () => {},
    setSnackbarMessage: () => {},
    setSnackbarTitle: () => {},
    setSnackbarType: () => {},
  },
});
