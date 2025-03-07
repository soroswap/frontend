import { useSorobanReact } from 'soroban-react-stellar-wallets-kit';
import { getPairAddress } from 'functions/getPairAddress';
import React from 'react';
import useSWRImmutable from 'swr/immutable';

interface Props {
  addressA?: string;
  addressB?: string;
}

const useGetPairAddress = ({ addressA, addressB }: Props) => {
  const sorobanContext = useSorobanReact();

  const { data, error, isLoading, mutate } = useSWRImmutable(
    ['pair', addressA, addressB, sorobanContext],
    ([key, addressA, addressB, sorobanContext]) =>
      getPairAddress(addressA, addressB, sorobanContext),
  );

  return { data, isError: error, isLoading, mutate };
};

export default useGetPairAddress;
