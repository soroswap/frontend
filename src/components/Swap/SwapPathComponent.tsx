import React, { useEffect, useState } from 'react'
import { ChevronRight } from 'react-feather'
import { Box, styled } from 'soroswap-ui'
import Row, { RowBetween, RowFixed } from 'components/Row'
import { BodySmall, LabelSmall } from 'components/Text'
import { InterfaceTrade, PlatformType } from 'state/routing/types'
import { useSorobanReact } from 'soroban-react-stellar-wallets-kit'
import { useAllTokens } from 'hooks/tokens/useAllTokens'
import { findToken } from 'hooks/tokens/useToken'
import { MouseoverTooltip } from 'components/Tooltip'
import { LoadingRows } from 'components/Loader/styled'

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
}
export const calculatePercentage = (parts: number, totalParts: number) => {
  return (parts / totalParts) * 100;
}

function SwapPathComponent({ trade }: { trade: InterfaceTrade | undefined }) {
  const sorobanContext = useSorobanReact();
  const { tokensAsMap, isLoading } = useAllTokens();


  const [pathArray, setPathArray] = useState<string[]>([]);
  const [distributionArray, setDistributionArray] = useState<distributionData[]>([]);
  const [totalParts, setTotalParts] = useState<number>(0);
  const [pathTokensIsLoading, setPathTokensIsLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      if (!trade?.path || isLoading) return;
      if (trade.platform == PlatformType.ROUTER) {
        setPathTokensIsLoading(true);
        const promises = trade.path.map(async (contract) => {
          const asset = await findToken(contract, tokensAsMap, sorobanContext);
          const code = asset?.code == 'native' ? 'XLM' : asset?.code;
          return code;
        });
        const results = await Promise.allSettled(promises);

        const fulfilledValues = results
          .filter((result) => result.status === 'fulfilled' && result.value)
          .map((result) => (result.status === 'fulfilled' && result.value ? result.value : ''));
        setPathArray(fulfilledValues);
        setPathTokensIsLoading(false);
      } else if (trade.platform == PlatformType.STELLAR_CLASSIC) {
        setPathTokensIsLoading(true);
        const codes = trade.path.map((address) => {
          if (address == 'native') return 'XLM';
          return address.split(':')[0];
        });
        setPathArray(codes);
        setPathTokensIsLoading(false);
      } else if (trade.platform == PlatformType.AGGREGATOR) {
        if (!trade?.distribution) return;
        let tempDistributionArray: distributionData[] = [];
        setPathTokensIsLoading(!pathTokensIsLoading);
        for (let distribution of trade?.distribution) {
          const promises = distribution.path.map(async (contract) => {
            const asset = await findToken(contract, tokensAsMap, sorobanContext);
            const code = asset?.code == 'native' ? 'XLM' : asset?.code;
            return code;
          });
          const results = await Promise.allSettled(promises);
          const fulfilledValues = results
            .filter((result) => result.status === 'fulfilled' && result.value)
            .map((result) => (result.status === 'fulfilled' && result.value ? result.value : ''));
          tempDistributionArray.push({ path: fulfilledValues, parts: distribution.parts, protocol: distribution.protocol_id });
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
          <BodySmall color="textSecondary">{trade?.platform == PlatformType.AGGREGATOR && distributionArray.length > 1 ? 'Paths:' : 'Path'}</BodySmall>
        </MouseoverTooltip>
      </RowFixed>

      {(trade?.platform == PlatformType.ROUTER || trade?.platform == PlatformType.STELLAR_CLASSIC) && (
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
      {(trade?.platform == PlatformType.AGGREGATOR) && (
        <PathLoadingPlaceholder syncing={pathTokensIsLoading} width={200} >
          <AggregatorPathBox data-testid="swap__details__path">
            {distributionArray.map((distribution, index) => (
              <Box key={index}>
                <Row>
                  <LabelSmall fontWeight={100} sx={{ mr: 1 }}>{formattedProtocolName(distribution.protocol) + ':'}</LabelSmall>
                  {distribution.path.map((symbol, index) => (
                    <React.Fragment key={index}>
                      <LabelSmall fontWeight={100}>{symbol}</LabelSmall>
                      {index !== distribution.path.length - 1 && (
                        <ChevronRight style={{ opacity: '50%' }} />
                      )}
                    </React.Fragment>
                  ))}
                  <LabelSmall fontWeight={100} sx={{ ml: 1 }}>({calculatePercentage(distribution.parts, totalParts)}%)</LabelSmall>
                </Row>
              </Box>
            ))}
          </AggregatorPathBox>
        </PathLoadingPlaceholder>
      )}
    </RowBetween>
  )
}

export default SwapPathComponent
