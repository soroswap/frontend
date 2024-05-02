import { rpc } from '@pendulum-chain/types';
import { UseInkathonProvider, pendulum } from '@scio-labs/use-inkathon';
import { ReactNode } from 'react';

const InkathonProvider = ({ children }: { children: ReactNode }) => {
  return (
    <UseInkathonProvider appName="Soroswap" apiOptions={{rpc}} defaultChain={pendulum} connectOnInit={false}>
      {children}
    </UseInkathonProvider>
  );
};

export default InkathonProvider;
