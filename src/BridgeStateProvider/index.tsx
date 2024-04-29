
import { useCallback, useContext, useEffect, useMemo, useRef, useState, createContext } from 'react';
import { TenantName, ThemeName } from 'BridgeStateProvider/models';


const config = {
  tenants: {
    [TenantName.Amplitude]: {
      name: 'Amplitude',
      rpc: 'wss://rpc-amplitude.pendulumchain.tech',
      theme: ThemeName.Amplitude,
      explorer: 'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frpc-foucoco.pendulumchain.tech#/explorer/query',
    },
    [TenantName.Pendulum]: {
      name: 'Pendulum',
      rpc: 'wss://rpc-pendulum.prd.pendulumchain.tech',
      theme: ThemeName.Pendulum,
      explorer: 'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frpc-foucoco.pendulumchain.tech#/explorer/query',
    },
    [TenantName.Foucoco]: {
      name: 'Foucoco',
      rpc: 'wss://rpc-foucoco.pendulumchain.tech',
      theme: ThemeName.Amplitude,
      explorer: 'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frpc-foucoco.pendulumchain.tech#/explorer/query',
    },
    [TenantName.Local]: {
      name: 'Local',
      rpc: 'ws://localhost:9944',
      theme: ThemeName.Amplitude,
      explorer: 'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frpc-foucoco.pendulumchain.tech#/explorer/query',
    },
  }
}

export const chainIds: Record<TenantName | 'polkadot', string> = {
  polkadot: 'polkadot:91b171bb158e2d3848fa23a9f1c25182',
  foucoco: 'polkadot:67221cd96c1551b72d55f65164d6a39f', // foucoco,
  amplitude: 'polkadot:cceae7f3b9947cdb67369c026ef78efa', // amplitude
  pendulum: 'polkadot:5d3c298622d5634ed019bf61ea4b7165', // pendulum
  local: 'polkadot:67221cd96c1551b72d55f65164d6a39f', // foucoco
};

const SECONDS_IN_A_DAY = 86400;
const EXPIRATION_PERIOD = 2 * SECONDS_IN_A_DAY; // 2 days

export interface BridgeState {
  dAppName: string;
  tenantName: TenantName;
  tenantRPC?: string;
  walletAccount?: any;//WalletAccount;
  setWalletAccount: (data: any)=> void;//WalletAccount) => void;
  removeWalletAccount: () => void;
  getThemeName: () => ThemeName;
}

export const defaultTenant = TenantName.Pendulum;
const BridgeStateContext = createContext<BridgeState | undefined>(undefined);

/**
 * Initializes the Talisman wallet for the specified dApp name and selects a wallet account.
 * @param dAppName - The name of the dApp.
 * @param selected - The address of the selected wallet account.
 * @returns The selected wallet account.
 */
const initTalisman = async (dAppName: string, selected?: string) => {
  console.log('initTalisman', dAppName, selected);
};

/**
 * Initializes the WalletConnect service with the given chain ID.
 * @param chainId - The chain ID to initialize the WalletConnect service with.
 * @returns A promise that resolves to the initialized WalletConnect service.
 */
const initWalletConnect = async (chainId: string) => {
  console.log('initWalletConnect', chainId);
};

/**
 * Initializes the Metamask wallet for the specified tenant.
 * If a Metamask wallet address is found in the storage, it initiates the Metamask injected account.
 * 
 * @param tenantName - The name of the tenant.
 * @returns A promise that resolves to void.
 */
const initMetamaskWallet = async (tenantName: TenantName) => {
  console.log('init MM wallet', tenantName)
};

const BridgeStateProvider = ({ children }: { children: any }) => {
  const tenantRef = useRef<string>();
  const [walletAccount, setWallet] = useState<any | undefined>(undefined); //useState<WalletAccount | undefined>(undefined);
  const pathname = 'this tab route';
  const network = pathname.split('/').filter(Boolean)[0]?.toLowerCase();

  const tenantName = useMemo(() => {
    return network && Object.values<string>(TenantName).includes(network) ? (network as TenantName) : defaultTenant;
  }, [network]);

  const dAppName = tenantName;

  const getThemeName = useCallback(
    () => (tenantName ? config.tenants[tenantName]?.theme || ThemeName.Amplitude : ThemeName.Amplitude),
    [tenantName],
  );

  const {
    state: storageAddress,
    set,
    clear,
  } = {state: 'aa', set():any{}, clear():any{}}

  /**
   * Handles the wallet connect and disconnect functionality.
   * If the wallet account is using the WalletConnect extension,
   * it disconnects the client from the session topic with the reason 'USER_DISCONNECTED'.
   */
  const handleWalletConnectDisconnect = useCallback(async () => {
    console.log('handle Wallet Connect/Disconnect')
  }, [walletAccount]);

  /**
   * Removes the wallet account.
   * This function disconnects the wallet, clears any stored data, and removes the selected wallet name and metamask snap account from storage.
   * It also sets the wallet state to undefined.
   */
  const removeWalletAccount = useCallback(async () => {
    console.log('removed wallet');
  }, [clear, handleWalletConnectDisconnect]);

  /**
   * Sets the wallet account and performs additional actions based on the wallet source.
   * if (wallet?.source === WALLET_SOURCE_METAMASK) {
        storageService.set(`metamask-snap-account`, wallet.address);
      }
   * @param wallet - The wallet account to set.
   */
  const setWalletAccount = useCallback(
    //(wallet: WalletAccount | undefined) => {
    (wallet: any | undefined) => {
      console.log('set wallet account', wallet);
    },
    [set],
  );

  const accountAddress = walletAccount?.address;
  
  useEffect(() => {
    /**
     * Runs the initialization process for the bridge state provider.
     * If the storage address is not available, it removes the wallet account.
     * If the tenant is already initialized or the account address is available, it skips the initialization process.
     * Otherwise, it initializes the selected wallet based on the provided dAppName, storage address, and tenant name.
     * If a selected wallet is found, it sets the wallet state.
     */
    const run = async () => {
      if (!storageAddress) {
        removeWalletAccount();
        return;
      }
      // skip if tenant already initialized
      if (tenantRef.current === tenantName || accountAddress) return;
      tenantRef.current = tenantName;
      const appName = dAppName || TenantName.Amplitude;
      const selectedWallet =
        (await initTalisman(appName, storageAddress))! ||
        (await initWalletConnect(chainIds[tenantName])!)! ||
        (await initMetamaskWallet(tenantName));
      if (selectedWallet!) setWallet(selectedWallet);
    };
    run();
  }, [storageAddress, removeWalletAccount, dAppName, tenantName, accountAddress]);

  const providerValue = useMemo<BridgeState>(
    () => ({
      walletAccount,
      tenantName: tenantName,
      tenantRPC: config.tenants[tenantName].rpc,
      setWalletAccount,
      removeWalletAccount,
      getThemeName,
      dAppName,
    }),
    [dAppName, getThemeName, removeWalletAccount, setWalletAccount, tenantName, walletAccount],
  );

  return <BridgeStateContext.Provider value={providerValue}>{children}</BridgeStateContext.Provider>;
};

const useBridgeState = () => {
  const state = useContext(BridgeStateContext);
  if (!state) throw 'BridgeStateProvider not defined!';
  return state;
};

export { BridgeStateContext, BridgeStateProvider, useBridgeState };
