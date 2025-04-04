import { AppContext } from 'contexts';
import { useSorobanReact } from 'stellar-react';
import React, { useContext, useEffect } from 'react';
import { ButtonLight, ButtonPrimary } from './Button';

export function WalletButton({ style, light }: { style?: React.CSSProperties; light?: boolean }) {
  const { address, disconnect, connect } = useSorobanReact();

  const ButtonComponent = light ? ButtonLight : ButtonPrimary;
  const handleClick = () => {
    if (address) {
      disconnect();
    } else {
      connect();
    }
  };
  return (
    <>
      <ButtonComponent data-testid="wallet-button" style={style} onClick={handleClick}>
        Connect Wallet
      </ButtonComponent>
    </>
  );
}
