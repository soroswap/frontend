import { futurenet, sandbox, standalone, testnet } from "@soroban-react/chains";
import { freighter } from "@soroban-react/freighter";
import { ChainMetadata, Connector } from "@soroban-react/types";
import React from "react";
import { SorobanReactProvider } from "utils/packages/core/src";

const chains: ChainMetadata[] = [testnet, sandbox, standalone, futurenet];
const connectors: Connector[] = [freighter()];

export default function MySorobanReactProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SorobanReactProvider
      chains={chains}
      appName={"Example Stellar App"}
      connectors={connectors}
    >
      {children}
    </SorobanReactProvider>
  );
}
