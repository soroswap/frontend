import React from 'react'
import {SorobanReactProvider} from '@soroban-react/core';
// eslint-disable-next-line
import {chains} from '@soroban-react/chains';
import {ChainMetadata, ConnectorList} from "@soroban-react/types";
import { freighter } from '@soroban-react/freighter';

 
  const appName = "Pet Adopt Dapp"
  const allowedConnectorName = "My Allowed Connectors for Pet Adopt Dapp"
  const allowedChains: ChainMetadata[] = [chains.sandbox, chains.standalone, chains.futurenet];

  const allowedConnectors: ConnectorList = [
      {
        groupName: allowedConnectorName,
        connectors: [freighter({ appName, chains:allowedChains })],
      },
    ];

  export default function MySorobanReactProvider({children}:{children: React.ReactNode}) {
    return (
      <SorobanReactProvider
        chains={allowedChains}
        connectors={allowedConnectors}>
          {children}
      </SorobanReactProvider>
    )
  } 