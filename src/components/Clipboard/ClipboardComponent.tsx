import React, { useState } from 'react';
import { CheckSquare, Clipboard } from 'react-feather';

interface Props {
  onClick: () => void;
  [rest: string]: any;
}

const ClipboardComponent = ({ onClick, ...rest }: Props) => {
  const [isCopied, setIsCopied] = useState(false);

  const Icon = isCopied ? CheckSquare : Clipboard;

  return (
    <Icon
      color={isCopied ? 'green' : 'gray'}
      onClick={() => {
        onClick();
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 1000);
      }}
      style={{ cursor: 'pointer' }}
      {...rest}
    />
  );
};

export default ClipboardComponent;
