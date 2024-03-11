import { SorobanContextType } from '@soroban-react/core/dist/SorobanContext';
import { usePairContractAddress } from 'hooks/usePairContractAddress';
import { usePairExist } from 'hooks/usePairExist';
import { TokenType } from 'interfaces/tokens';
import { useEffect } from 'react';

export function AllPairs({
  selectedToken,
  selectedOutputToken,
  setPairExist,
  setPairAddress,
  sorobanContext,
}: {
  selectedToken: TokenType;
  selectedOutputToken: TokenType;
  setPairExist: any;
  setPairAddress: any;
  sorobanContext: SorobanContextType;
}) {
  const pairExist = usePairExist(
    selectedToken.contract,
    selectedOutputToken.contract,
    sorobanContext,
  );

  const pairAddress = usePairContractAddress(
    selectedToken.contract,
    selectedOutputToken.contract,
    sorobanContext,
  );

  useEffect(() => {
    setPairExist(pairExist);
    if (pairExist) {
      setPairAddress(pairAddress);
    } else {
      setPairAddress(null);
    }
  }, [setPairExist, setPairAddress, pairExist, pairAddress]);

  return null;
}
