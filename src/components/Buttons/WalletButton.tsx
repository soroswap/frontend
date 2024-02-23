import { ButtonLight, ButtonPrimary } from 'components/Buttons/Button';
import { AppContext } from 'contexts';
import React, { useContext } from 'react';


export function WalletButton({ style, light }: { style?: React.CSSProperties; light?: boolean}) {
    const { ConnectWalletModal } = useContext(AppContext);
    const { isConnectWalletModalOpen, setConnectWalletModalOpen } = ConnectWalletModal;

    const handleClick = () => {
        setConnectWalletModalOpen(true);
    };

    const ButtonComponent = light ? ButtonLight : ButtonPrimary;
    
    return (
        <>  
            <ButtonComponent style={style} onClick={handleClick}>
                Connect Wallet
            </ButtonComponent>
        </>
    );
}
