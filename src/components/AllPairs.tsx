import { usePairContractAddress } from "hooks/usePairContractAddress";
import { usePairExist } from "hooks/usePairExist";
import { TokenType } from "interfaces/tokens";
import { useEffect } from "react";
import { SorobanContextType } from "utils/packages/core/src/dist/SorobanContext";

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
        selectedToken.address,
        selectedOutputToken.address,
        sorobanContext,
    );

    const pairAddress = usePairContractAddress(
        selectedToken.address,
        selectedOutputToken.address,
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