'Use Client';
import React, { useContext, useState, useEffect } from 'react'
import { useSorobanReact } from '@soroban-react/core';
import { ButtonPrimary, ButtonLight } from 'components/Buttons/Button';
import { AppContext } from 'contexts';
import { isConnected, isAllowed, setAllowed } from "@stellar/freighter-api";

import * as Bowser from 'bowser'

export function WalletButton({ style, light }: { style?: React.CSSProperties; light?: boolean}) {
    const sorobanContext = useSorobanReact();
    const { address } = sorobanContext;
    const { ConnectWalletModal } = useContext(AppContext);
    const { isConnectWalletModalOpen, setConnectWalletModalOpen } = ConnectWalletModal;
    const [ hasFreighter, setHasFreighter ]  = useState(false)
    const handleClick = () => {
        setConnectWalletModalOpen(true);
    };
    const installFreighter = () => {
        connected();
        console.log(hasFreighter)
        if (hasFreighter) {
            window.location.reload();
        }
        else {
            const browser = Bowser.getParser(window.navigator.userAgent).getBrowserName()
            console.log(browser)
            switch (browser) {
                case 'Firefox':
                    window.open('https://addons.mozilla.org/en-US/firefox/addon/freighter/', '_self');
                    break;
                default: 
                    window.open('https://chromewebstore.google.com/detail/freighter/bcacfldlkkdogcmkkibnjlakofdplcbk', '_self');
                    break;
            }
            setTimeout(() => {
                window.location.reload();
            }
            , 12000)
        }
    }
    const connected = async () => {
        const connected = await isConnected()
        setHasFreighter(connected)
        return connected
      }
    const ButtonComponent = light ? ButtonLight : ButtonPrimary;
      
    useEffect(() => {
        connected();
    }, [])
    
    return (
        <>
            { hasFreighter ? (
                <ButtonComponent style={style} onClick={handleClick}>
                    Connect Wallet
                </ButtonComponent>
            ) : (
                <ButtonComponent style={style} onClick={installFreighter}>
                    Install Freighter
                </ButtonComponent>
            )
            }
            
        </>
    );
}
