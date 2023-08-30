import React from "react";

type ConnectWalletModalType = {
  isConnectWalletModalOpen: boolean;
  setConnectWalletModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

type AppContextType = {
  ConnectWalletModal: ConnectWalletModalType;
};

export const ColorModeContext = React.createContext({
  toggleColorMode: () => {},
});

export const AppContext = React.createContext<AppContextType>({
  ConnectWalletModal: {
    isConnectWalletModalOpen: false,
    setConnectWalletModalOpen: () => {},
  },
});
