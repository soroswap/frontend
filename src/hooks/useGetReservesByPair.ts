import { ReservesType } from 'functions/getExpectedAmount';
import { getPairAddress } from 'functions/getPairAddress';
import React, { useEffect, useState } from 'react';
import { reservesBNWithTokens } from './useReserves';
import { useSorobanReact } from '@soroban-react/core';

interface Props {
  baseAddress?: string;
  otherAddress?: string;
}

const useGetReservesByPair = ({ baseAddress, otherAddress }: Props) => {
  const sorobanContext = useSorobanReact();

  const [pairAddress, setPairAddress] = useState<string | undefined>(undefined);
  const [reserves, setReserves] = useState<ReservesType | null>(null);
  const [currentBaseAddress, setCurrentBaseAddress] = useState<string | undefined>(undefined);
  const [currentOtherAddress, setCurrentOtherAddress] = useState<string | undefined>(undefined);

  useEffect(() => {
    const getAndSetPairAddressAndReserves = async () => {
      try {
        const pairAddressResponse = await getPairAddress(baseAddress, otherAddress, sorobanContext);

        const reservesResponse = await reservesBNWithTokens(pairAddressResponse, sorobanContext);

        setPairAddress(pairAddressResponse);
        setReserves(reservesResponse);
        setCurrentBaseAddress(baseAddress);
        setCurrentOtherAddress(otherAddress);
      } catch (error) {
        setCurrentBaseAddress(undefined);
        setCurrentOtherAddress(undefined);
        setPairAddress(undefined);
        setReserves(null);
      }
    };
    if (baseAddress && otherAddress) {
      if (baseAddress != currentBaseAddress || otherAddress != currentOtherAddress) {
        getAndSetPairAddressAndReserves();
      }
    }
  }, [baseAddress, otherAddress, sorobanContext, currentBaseAddress, currentOtherAddress]);

  return { pairAddress, reserves, currentBaseAddress, currentOtherAddress };
};

export default useGetReservesByPair;
