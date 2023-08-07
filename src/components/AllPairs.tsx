import { SorobanContextType } from "@soroban-react/core/dist/SorobanContext";
import { usePairContractAddress } from "hooks/usePairContractAddress";
import { useAllPairsFromTokens, usePairExist } from "hooks/usePairExist";
import { TokenType } from "interfaces/tokens";
import { useEffect } from "react";

export function AllPairs({
    selectedToken,
    selectedOutputToken,
    setPairExist,
    setPairAddress,
    sorobanContext,
}: {
    selectedToken: TokenType,
    selectedOutputToken: TokenType,
    setPairExist: any,
    setPairAddress: any,
    sorobanContext: SorobanContextType,
}) {
    const pairExist = usePairExist(
        selectedToken.token_address,
        selectedOutputToken.token_address,
        sorobanContext,
    );

    const pairAddress = usePairContractAddress(
        selectedToken.token_address,
        selectedOutputToken.token_address,
        sorobanContext,
    );
    
    useEffect(() => {
        console.log("pairExists", pairExist)
        console.log("pairAddress", pairAddress)
        setPairExist(pairExist)
        if (pairExist) {
            setPairAddress(pairAddress)
        } else {
            setPairAddress(null)
        }
    }, [setPairExist,setPairAddress, pairExist, pairAddress])

    return null
}