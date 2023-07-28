import { SorobanContextType } from "@soroban-react/core/dist/SorobanContext";
import { useAllPairsFromTokens } from "hooks/usePairExist";
import { TokenType } from "interfaces/tokens";
import { useEffect } from "react";

export function AllPairs({tokens, setPairs, sorobanContext}: {tokens: TokenType[], setPairs:any, sorobanContext: SorobanContextType}) {
    const allPairs = useAllPairsFromTokens(tokens, sorobanContext);
    useEffect(() => {
        setPairs(allPairs)
    }, [setPairs, allPairs])
    
    return null
}