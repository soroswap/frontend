import useGetPairAddress from './useGetPairAddress';
import useGetReserves from './useGetReserves';

interface Props {
  baseAddress?: string;
  otherAddress?: string;
}

const useGetReservesByPair = ({ baseAddress, otherAddress }: Props) => {
  const { data: pairAddress } = useGetPairAddress({
    addressA: baseAddress,
    addressB: otherAddress,
  });

  const { data: reserves, mutate: refetchReserves } = useGetReserves({ pairAddress });

  return { pairAddress, reserves, refetchReserves };
};

export default useGetReservesByPair;
