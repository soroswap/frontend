import { useSorobanReact } from '@soroban-react/core';
import { LpTokensObj, getLpTokens } from 'functions/getLpTokens';
import { useEffect, useState } from 'react';

const useGetLpTokens = () => {
  const sorobanContext = useSorobanReact();

  const [lpTokens, setLpTokens] = useState<LpTokensObj[]>();

  useEffect(() => {
    getLpTokens(sorobanContext).then((resp) => {
      setLpTokens(resp);
    });
  }, [sorobanContext]);

  return { lpTokens, sorobanContext };
};

export default useGetLpTokens;
