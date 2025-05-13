import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight } from 'react-feather';
import { Box, styled } from 'soroswap-ui';
import Row, { RowBetween, RowFixed } from 'components/Row';
import { BodySmall, LabelSmall } from 'components/Text';
import { InterfaceTrade, PlatformType } from 'state/routing/types';
import { useSorobanReact } from 'stellar-react';
import { useAllTokens } from 'hooks/tokens/useAllTokens';
import { findToken } from 'hooks/tokens/useToken';
import { MouseoverTooltip } from 'components/Tooltip';
import { LoadingRows } from 'components/Loader/styled';

export const PathBox = styled(Box)`
  display: flex;
  align-items: end;
  justify-content: center;
  flex-direction: row;
`;

export const AggregatorPathBox = styled(Box)`
  display: flex;
  align-items: end;
  justify-content: center;
  flex-direction: column;
`;

export function PathLoadingPlaceholder({
  syncing,
  width,
  children,
}: {
  syncing: boolean;
  width: number;
  children: JSX.Element;
}) {
  return syncing ? (
    <LoadingRows data-testid="loading-rows" sx={{ mt: '5px' }}>
      <div style={{ height: '15px', width: `${width}px` }} />
    </LoadingRows>
  ) : (
    children
  );
}

export interface distributionData {
  parts: number;
  path: string[];
  protocol: string;
}
export const formattedProtocolName = (protocol: string) => {
  return protocol.charAt(0).toUpperCase() + protocol.slice(1);
};
export const calculatePercentage = (parts: number, totalParts: number) => {
  return (parts / totalParts) * 100;
};

function SwapPathComponent({ trade }: { trade: InterfaceTrade | undefined }) {
  const sorobanContext = useSorobanReact();
  const { tokensAsMap, isLoading } = useAllTokens();

  const memoizedTradePath = useMemo(() => trade, [trade]);
  const [pathArray, setPathArray] = useState<string[]>([]);
  const [distributionArray, setDistributionArray] = useState<distributionData[]>([]);
  const [totalParts, setTotalParts] = useState<number>(0);
  const [pathTokensIsLoading, setPathTokensIsLoading] = useState<boolean>(false);

  const getTradedCurrencies = async (pathes: string[]) => {
    const promises = pathes.map(async (contract) => {
      const asset = await findToken(
        contract,
        tokensAsMap,
        sorobanContext,
        'SwapPathComponent.tsx&trade.platform == PlatformType.ROUTER',
      );
      const code = asset?.code == 'native' ? 'XLM' : asset?.code;

      return code;
    });
    const results = await Promise.allSettled(promises);

    return results
      .filter((result) => result.status === 'fulfilled' && result.value)
      .map((result) => (result.status === 'fulfilled' && result.value ? result.value : ''));
  };

  const getAggregatorPathCurrencyCodes = async (
    path: string[],
    tokensAsMap: any,
    sorobanContext: any,
  ) => {
    const promises = path.map(async (contract) => {
      const asset = await findToken(
        contract,
        tokensAsMap,
        sorobanContext,
        'SwapPathComponent.tsx&trade.platform == PlatformType.AGGREGATOR',
      );
      const code = asset?.code == 'native' ? 'XLM' : asset?.code;
      return code;
    });
    const results = await Promise.allSettled(promises);
    return results
      .filter((result) => result.status === 'fulfilled' && result.value)
      .map((result) => (result.status === 'fulfilled' && result.value ? result.value : ''));
  };

  useEffect(() => {
    (async () => {
      if (!memoizedTradePath || isLoading) return;
      console.log('!!!Change swap items', memoizedTradePath, isLoading, sorobanContext);

      if (memoizedTradePath.platform == PlatformType.ROUTER && memoizedTradePath.path) {
        setPathTokensIsLoading(true);

        //TODO: memoizedTradePath.path.inputAmount && memoizedTradePath.path.output already have this - We don't need external request
        let pathtokenNames = ['', ''];
        if (
          !memoizedTradePath.inputAmount ||
          !memoizedTradePath.outputAmount ||
          memoizedTradePath?.path[0] !== memoizedTradePath?.inputAmount?.currency?.contract ||
          memoizedTradePath.path[1] !== memoizedTradePath?.outputAmount?.currency?.contract
        ) {
          console.log('GET FROM API');
          pathtokenNames = await getTradedCurrencies(memoizedTradePath?.path);
        } else {
          console.log('GET FROM STATE');
          pathtokenNames = [memoizedTradePath?.inputAmount?.currency?.code, memoizedTradePath.outputAmount?.currency?.code as string];
        }
    
        setPathArray(pathtokenNames);
        setPathTokensIsLoading(false);
      } else if (memoizedTradePath.platform == PlatformType.STELLAR_CLASSIC && memoizedTradePath.path) {
        setPathTokensIsLoading(true);
        const codes = memoizedTradePath.path.map((address) => {
          if (address == 'native') return 'XLM';
          return address.split(':')[0];
        });
        setPathArray(codes);
        setPathTokensIsLoading(false);
      } else if (memoizedTradePath.platform == PlatformType.AGGREGATOR) {
        if (!memoizedTradePath?.distribution) return;

        let tempDistributionArray: distributionData[] = [];
        setPathTokensIsLoading(true); // Set loading to true at the start of processing aggregator paths

        for (let distribution of memoizedTradePath?.distribution) {
          const fulfilledValues = await getAggregatorPathCurrencyCodes(
            distribution.path,
            tokensAsMap,
            sorobanContext,
          );

          tempDistributionArray.push({
            path: fulfilledValues,
            parts: distribution.parts,
            protocol: distribution.protocol_id,
          });
          setDistributionArray(tempDistributionArray);
          setTotalParts(tempDistributionArray.reduce((acc, curr) => acc + curr.parts, 0));
        }
        setPathTokensIsLoading(false);
      }
    })();
  }, [trade?.path, isLoading, sorobanContext]);

  return (
    <RowBetween sx={{ alignItems: 'start' }}>
      <RowFixed>
        <MouseoverTooltip
          title={`
                  Routing through these assets resulted in the best price for your trade
                `}
        >
          <BodySmall color="textSecondary">
            {memoizedTradePath?.platform == PlatformType.AGGREGATOR && distributionArray.length > 1
              ? 'Paths:'
              : 'Path'}
          </BodySmall>
        </MouseoverTooltip>
      </RowFixed>

      {(memoizedTradePath?.platform == PlatformType.ROUTER ||
        memoizedTradePath?.platform == PlatformType.STELLAR_CLASSIC) && (
        <PathLoadingPlaceholder syncing={pathTokensIsLoading} width={100}>
          <PathBox data-testid="swap__details__path">
            {pathArray?.map((contract, index) => (
              <React.Fragment key={index}>
                {contract}
                {index !== pathArray.length - 1 && <ChevronRight style={{ opacity: '50%' }} />}
              </React.Fragment>
            ))}
          </PathBox>
        </PathLoadingPlaceholder>
      )}
      {memoizedTradePath?.platform == PlatformType.AGGREGATOR && (
        <PathLoadingPlaceholder syncing={pathTokensIsLoading} width={200}>
          <AggregatorPathBox data-testid="swap__details__path">
            {distributionArray.map((distribution, index) => (
              <Box key={index}>
                <Row>
                  <LabelSmall fontWeight={100} sx={{ mr: 1 }}>
                    {formattedProtocolName(distribution.protocol) + ':'}
                  </LabelSmall>
                  {distribution.path.map((symbol, index) => (
                    <React.Fragment key={index}>
                      <LabelSmall fontWeight={100}>{symbol}</LabelSmall>
                      {index !== distribution.path.length - 1 && (
                        <ChevronRight style={{ opacity: '50%' }} />
                      )}
                    </React.Fragment>
                  ))}
                  <LabelSmall fontWeight={100} sx={{ ml: 1 }}>
                    ({calculatePercentage(distribution.parts, totalParts)}%)
                  </LabelSmall>
                </Row>
              </Box>
            ))}
          </AggregatorPathBox>
        </PathLoadingPlaceholder>
      )}
    </RowBetween>
  );
}

export default SwapPathComponent;
