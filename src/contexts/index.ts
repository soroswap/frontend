import React from 'react';
import { PlatformType, Protocol } from 'state/routing/types';
import defaultSettings from 'configs/default.settings.json';

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

export interface ProtocolsStatus {
  key: Protocol | PlatformType;
  value: boolean;
  url: string;
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

export type Settings = {
  maxHops: number;
  setMaxHops: React.Dispatch<React.SetStateAction<number>>;
  protocolsStatus: ProtocolsStatus[];
  setProtocolsStatus: React.Dispatch<React.SetStateAction<ProtocolsStatus[]>>;
  isAggregatorState: boolean;
  setAggregatorStatus: React.Dispatch<React.SetStateAction<boolean>>;
  aggregatorAddress: string | undefined;
  setAggregatorAddress: React.Dispatch<React.SetStateAction<string | undefined>>;
};

export type AppContextType = {
  ConnectWalletModal: ConnectWalletModalType;
  SnackbarContext: SnackbarContextType;
  Settings: Settings;
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
  Settings: {
    maxHops: defaultSettings.maxHops,
    setMaxHops: () => {},
    protocolsStatus: [],
    setProtocolsStatus: () => {},
    isAggregatorState: false,
    setAggregatorStatus: () => {},
    aggregatorAddress: '',
    setAggregatorAddress: () => {},
  },
});
