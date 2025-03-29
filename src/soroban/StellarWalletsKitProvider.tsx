import { standalone, testnet, mainnet } from '@soroban-react/chains';
import { WalletChain } from '@soroban-react/types';
import useMounted from 'hooks/useMounted';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import * as StellarWalletsKitSDK from '@creit.tech/stellar-wallets-kit';
import { WalletNetwork, XBULL_ID, FREIGHTER_ID } from '@creit.tech/stellar-wallets-kit';

const chains: WalletChain[] =
  process.env.NODE_ENV === 'production' ? [testnet, mainnet] : [standalone, testnet, mainnet];

const findWalletChainByName = (name: string): WalletChain | undefined => {
  return chains.find((chain) => chain.id === name);
};

const activeChainName = process.env.NEXT_PUBLIC_DEFAULT_NETWORK || 'testnet';
const activeChain: WalletChain = findWalletChainByName(activeChainName) || testnet;

interface StellarWalletsKitContextType {
  kit: StellarWalletsKitSDK.StellarWalletsKit | null;
  address: string | undefined;
  activeChain: WalletChain;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  selectedWalletId: string | undefined;
  isConnected: boolean;
}

const StellarWalletsKitContext = createContext<StellarWalletsKitContextType | undefined>(undefined);

export function useStellarWalletsKit() {
  const context = useContext(StellarWalletsKitContext);
  if (context === undefined) {
    throw new Error('useStellarWalletsKit must be used within a StellarWalletsKitProvider');
  }
  return context;
}

interface StellarWalletsKitProviderProps {
  children: ReactNode;
  appName?: string;
}

export function StellarWalletsKitProvider({ 
  children, 
  appName = 'Soroswap' 
}: StellarWalletsKitProviderProps) {
  const mounted = useMounted();
  const [kit, setKit] = useState<StellarWalletsKitSDK.StellarWalletsKit | null>(null);
  const [address, setAddress] = useState<string | undefined>(undefined);
  const [selectedWalletId, setSelectedWalletId] = useState<string | undefined>(undefined);
  const [isConnected, setIsConnected] = useState(false);

  const connect = async () => {
    try {
      const newKit = new StellarWalletsKitSDK.StellarWalletsKit({
        network: activeChain.networkPassphrase as StellarWalletsKitSDK.WalletNetwork,
        modules: StellarWalletsKitSDK.allowAllModules(),
        selectedWalletId: StellarWalletsKitSDK.XBULL_ID
      });
      
      setKit(newKit);
      
      await newKit.openModal({
        onWalletSelected: async (wallet: StellarWalletsKitSDK.ISupportedWallet) => {
          newKit.setWallet(wallet.id);
          setSelectedWalletId(wallet.id);
          
          const { address } = await newKit.getAddress();
          setAddress(address);
          setIsConnected(true);
        }
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnect = async () => {
    setKit(null);
    setAddress(undefined);
    setSelectedWalletId(undefined);
    setIsConnected(false);
  };

  const contextValue: StellarWalletsKitContextType = {
    kit,
    address,
    activeChain,
    connect,
    disconnect,
    selectedWalletId,
    isConnected
  };

  if (!mounted) return null;
  
  return (
    <StellarWalletsKitContext.Provider value={contextValue}>
      {children}
    </StellarWalletsKitContext.Provider>
  );
}