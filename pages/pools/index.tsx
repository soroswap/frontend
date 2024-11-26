import { Card, CircularProgress, Skeleton, Stack, styled, Switch, Tooltip, Typography, useMediaQuery, useTheme } from 'soroswap-ui';
import { useSorobanReact } from '@soroban-react/core';
import { ButtonPrimary } from 'components/Buttons/Button';
import { WalletButton } from 'components/Buttons/WalletButton';
import { AutoColumn } from 'components/Column';
import LiquidityPoolInfoModal from 'components/Pools/LiquidityPoolInfoModal';
import { LPPercentage } from 'components/Pools/styleds';
import CurrencyLogo from 'components/Logo/CurrencyLogo';
import { Dots } from 'components/Pool/styleds';
import { AutoRow } from 'components/Row';
import SettingsTab from 'components/Settings';
import { BodySmall, SubHeader } from 'components/Text';
import { AppContext } from 'contexts';
import { LpTokensObj } from 'functions/getLpTokens';
import useGetLpTokens from 'hooks/useGetLpTokens';
import { useRouter } from 'next/router';
import { ImgHTMLAttributes, useContext, useEffect, useState } from 'react';
import SEO from '../../src/components/SEO';
import { DEFAULT_SLIPPAGE_INPUT_VALUE } from 'components/Settings/MaxSlippageSettings';

import { visuallyHidden } from '@mui/utils';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from 'soroswap-ui';
import { shortenAddress } from 'helpers/address';
import { relevantTokensType, tokenBalance, tokenBalances } from 'hooks';
import useBoolean, { UseBooleanReturnProps } from 'hooks/useBoolean';
import useGetMyBalances from 'hooks/useGetMyBalances';
import useTable from 'hooks/useTable';
import ClipboardComponent from 'components/Clipboard/ClipboardComponent';
import { TokenType } from 'interfaces';
const PageWrapper = styled(AutoColumn)`
  position: relative;
  background: ${({ theme }) => `linear-gradient(${theme.palette.customBackground.bg2}, ${theme.palette.customBackground.bg2
    }) padding-box,
              linear-gradient(150deg, rgba(136,102,221,1) 0%, rgba(${theme.palette.mode == 'dark' ? '33,29,50,1' : '255,255,255,1'
    }) 35%, rgba(${theme.palette.mode == 'dark' ? '33,29,50,1' : '255,255,255,1'
    }) 65%, rgba(136,102,221,1) 100%) border-box`};
  border: 1px solid transparent;
  border-radius: 16px;
  padding: 32px;
  transition: transform 250ms ease;
  max-width: 99vw;
  width: 95vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`;

const LPTokensContainer = styled('div')`
  width: calc(100% + 64px);
  background-color: ${({ theme }) => theme.palette.customBackground.surface};
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 32px;
  gap: 24px;
`;

const LPCard = styled('div')`
  background-color: ${({ theme }) => theme.palette.customBackground.bg1};
  background-color: ${({ theme }) => theme.palette.customBackground.bg1};
  border-radius: 16px;
  width: 100%;
  min-height: 86px;
  padding: 16px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`;

const StatusWrapper = styled('div')`
  background-color: ${({ theme }) => theme.palette.customBackground.accentAction};
  font-size: 20px;
  font-weight: 600;
  padding: 16px;
  color: ${({ theme }) => theme.palette.custom.accentTextLightPrimary};
  width: 100%;
  max-width: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
`;
interface TokenProps extends ImgHTMLAttributes<HTMLImageElement> {
  token?: any;
  imageUrl?: string;
}

const TokenImage: React.FC<TokenProps> = ({ imageUrl, ...imgProps }) => {
  return (
    <img
      src={imageUrl || `/favicon.ico`}
      style={{ borderRadius: "100%" }}
      width="26px"
      height="26px"
      {...imgProps}
    />
  );
};
const shortenStellarClassicAddress = (address: string) => {
  const [first, last] = address.split(':');
  return `${first}:${shortenAddress(last)}`;
};

export const formatNumberToMoney = (
  number: number | undefined,
  decimals: number = 7
) => {
  if (!number) return "-";

  if (typeof number === "string") {
    number = parseFloat(number);
  }

  if (typeof number !== "number") return "$0.00";

  if (number > 1000000000) {
    return `$${(number / 1000000000).toFixed(2)}b`;
  }
  if (number > 1000000) {
    return `$${(number / 1000000).toFixed(2)}m`;
  }
  if (number > 1000) {
    return `$${(number / 1000).toFixed(2)}k`;
  }
  return `$${number.toFixed(decimals)}`;
};

export const shouldShortenCode = (contract: string) => {
  if (!contract) return;
  if (contract.length > 10) return shortenAddress(contract);
  return contract;
};
export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  border: 0,
  height: 10,
}));

interface PoolsCell {
  name: string;
  address: string;
  tvl: string;
  volume24h: string;
  volume7d: string;
  fees24h: string;
  feesYearly: string;
}

interface HeadCell {
  id: keyof PoolsCell | 'shares';
  label: string;
  numeric: boolean;
  align: 'left' | 'center' | 'right';
}

const headCells: readonly HeadCell[] = [
  {
    id: 'name',
    numeric: false,
    label: 'Pool',
    align: 'left',
  },
  {
    id: 'tvl',
    numeric: false,
    label: 'TVL',
    align: 'center',
  },
  {
    id: 'volume24h',
    numeric: false,
    label: 'Volume 24h',
    align: 'center',
  },
  {
    id: 'volume7d',
    numeric: true,
    label: 'Volume 7d',
    align: 'center',
  },
  {
    id: 'fees24h',
    numeric: true,
    label: 'Fees 24h',
    align: 'center',
  },
  {
    id: 'feesYearly',
    numeric: true,
    label: 'Fees Yearly',
    align: 'center',
  },
  {
    id: 'shares',
    numeric: true,
    label: 'Shares',
    align: 'center'
  },
];
interface BalancesTableProps {
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof PoolsCell | 'shares',
  ) => void;
  order: 'asc' | 'desc';
  orderBy: string;
}

function PoolsTableHead(props: BalancesTableProps) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler =
    (property: keyof PoolsCell | 'shares') => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };
  const { address } = useSorobanReact();
  return (
    <TableHead>
      <TableRow sx={{ verticalAlign: 'bottom' }}>
        {headCells.map((headCell) => {
          if (headCell.id === 'shares' && !address) return null;
          return (
            <TableCell
              key={headCell.id}
              align={headCell.align}
              sortDirection={orderBy === headCell.id ? order : false}
            >
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            </TableCell>
          )
        }
        )}
        {address && <TableCell align="center">Action</TableCell>}
      </TableRow>
    </TableHead>
  );
}

interface PoolData {
  address: string;
  fees24h: number;
  feesChartData: any[];
  feesYearly: number;
  reserveA: string;
  reserveB: string;
  tokenA: TokenType;
  tokenAPrice: number;
  tokenB: TokenType;
  tokenBPrice: number;
  tvl: number;
  tvlChartData: any[];
  volume7d: number;
  volume24h: number;
  volumeChartData: any[];
  totalShares: number;
}



function PoolsTable(props: any) {
  const { nativeToken } = props;
  const { tokens, tokenBalancesResponse } = useGetMyBalances();
  const { lpTokens, isLoading, mutate } = useGetLpTokens();

  const { activeChain } = useSorobanReact()

  const [poolsData, setPoolsData] = useState<PoolData[]>([]);

  const fetchPools = async () => {
    const response = await fetch(`https://info.soroswap.finance/api/pairs?network=${activeChain?.id.toUpperCase()}`);
    const data = await response.json();
    setPoolsData(data);
  }
  const [rows, setRows] = useState<PoolData[]>([]);
  const [loadingShares, setLoadingShares] = useState<boolean>(true);

  useEffect(() => {
    const fetchRows = async () => {
      console.log('setting shares for pools')
      await setLoadingShares(true);
      const tempRows = await Promise.all(poolsData.map(async (x: any) => {
        if (lpTokens) {
          console.log('lpTokens', lpTokens)
          const tempShare = lpTokens.find((lp: any) => lp.address === x.address)?.totalShares;
          console.log('tempShare', tempShare)
          return ({ ...x, totalShares: tempShare ?? 0 });
        } else {
          return ({ ...x, totalShares: 0 });
        }
      }))
      setRows(tempRows);
    };
    fetchRows();
  }, [poolsData, lpTokens])

  useEffect(() => {
    console.log('activeChain', activeChain)
    fetchPools();
  }, [activeChain]);

  const {
    order,
    orderBy,
    handleRequestSort,
    visibleRows,
    emptyRows,
    rowsPerPage,
    page,
    handleChangePage,
    handleChangeRowsPerPage,
  } = useTable<PoolData>({
    rows,
    defaultOrder: 'desc',
    defaultOrderBy: 'address',
    defaultRowsPerPage: 5,
  });

  const onClickRow = (pool: string) => {
    // router.push(`/pools/${pool}`);
  };

  const { address } = useSorobanReact();

  if (rows.length === 0) {
    return <Card sx={{ p: 2 }}>No pools found.</Card>;
  }

  return (
    <TableContainer>
      <Table sx={{ minWidth: 700 }}>
        <PoolsTableHead
          order={order}
          orderBy={orderBy}
          onRequestSort={handleRequestSort}
        />
        <TableBody>
          {visibleRows.map((row, index) => {
            return (
              <TableRow onClick={() => onClickRow(row.address)} key={index}>
                <StyledTableCell
                  align="left"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    height: 70,
                    minWidth: 290,
                  }}
                >
                  <Box display="flex" alignItems="center">
                    <CurrencyLogo
                      currency={tokens.find((token) => token.contract === row.tokenA.contract)}
                      size={'16px'}
                      style={{ marginRight: '4px' }}
                    />
                    <CurrencyLogo
                      currency={tokens.find((token) => token.contract === row.tokenB.contract)}
                      size={'16px'}
                      style={{ marginRight: '8px' }}
                    />

                  </Box>
                  {shouldShortenCode(row.tokenA?.code)} /{" "}
                  {shouldShortenCode(row.tokenB?.code)}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {formatNumberToMoney(row.tvl, 2)}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {formatNumberToMoney(row.volume24h / 10 ** 7, 2)}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {formatNumberToMoney(row.volume7d / 10 ** 7, 2)}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {formatNumberToMoney(row.fees24h / 10 ** 7, 2)}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {formatNumberToMoney(row.feesYearly / 10 ** 7, 2)}
                </StyledTableCell>
                {address && (
                  <StyledTableCell align="center">
                    {(loadingShares) ?
                      <Skeleton width={'200px'} height={'35px'} /> : formatNumberToMoney(row.totalShares / 10 ** 7, 2)
                    }
                  </StyledTableCell>
                )}
                {address && (
                  <StyledTableCell align="center">
                    add liquidity
                  </StyledTableCell>
                )}
              </TableRow>
            );
          })}
          {emptyRows > 0 && (
            <TableRow
              style={{
                height: 53 * emptyRows,
              }}
            >
              <TableCell colSpan={6} />
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 20, 100]}
      />
    </TableContainer >
  );
}


export default function LiquidityPage() {
  const sorobanContext = useSorobanReact();
  const { address } = sorobanContext;
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { ConnectWalletModal } = useContext(AppContext);
  const { isConnectWalletModalOpen, setConnectWalletModalOpen } = ConnectWalletModal;

  const v2IsLoading = false;
  const noLiquidity = false;
  const isCreate = false;

  const { lpTokens, isLoading, mutate } = useGetLpTokens();

  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedLP, setSelectedLP] = useState<LpTokensObj>();

  const handleLPClick = (obj: LpTokensObj) => {
    setSelectedLP(obj);
    setModalOpen(true);
  };

  return (
    <>
      <SEO title="Liquidity - Soroswap" description="Soroswap Liquidity Pool" />
      <PageWrapper style={{ width: '99vw' }}>
        <div style={{ width: '100%' }}>
          <SubHeader>Liquidity Pools</SubHeader>
          <PoolsTable />
          <AutoRow style={{ justifyContent: 'space-between' }}>
            <SubHeader>Your liquidity</SubHeader>
            <SettingsTab autoSlippage={DEFAULT_SLIPPAGE_INPUT_VALUE} />
          </AutoRow>
          <div>
            <BodySmall>List of your liquidity positions</BodySmall>
          </div>
        </div>
        {!address ? (
          <LPTokensContainer>
            <BodySmall color={theme.palette.custom.accentTextLightSecondary} textAlign="center">
              <>Connect to a wallet to view your liquidity.</>
            </BodySmall>
          </LPTokensContainer>
        ) : v2IsLoading ? (
          <LPTokensContainer>
            <BodySmall color={theme.palette.custom.accentTextLightSecondary} textAlign="center">
              <Dots>
                <>Loading</>
              </Dots>
            </BodySmall>
          </LPTokensContainer>
        ) : lpTokens && lpTokens?.length > 0 ? (
          <LPTokensContainer>
            {lpTokens.map((obj: any, index: number) => (
              <LPCard onClick={() => handleLPClick(obj)} key={index}>
                <AutoRow gap={'2px'}>
                  <CurrencyLogo currency={obj.token_0} size={isMobile ? '16px' : '24px'} />
                  <CurrencyLogo currency={obj.token_1} size={isMobile ? '16px' : '24px'} />
                  <SubHeader>
                    {obj.token_0.code} - {obj.token_1.code}
                  </SubHeader>
                  <LPPercentage>{obj.lpPercentage}%</LPPercentage>
                </AutoRow>
                <StatusWrapper>{obj.status}</StatusWrapper>
              </LPCard>
            ))}
          </LPTokensContainer>
        ) : isLoading ? (
          <LPTokensContainer>
            <CircularProgress size="16px" />
          </LPTokensContainer>
        ) : (
          <LPTokensContainer>
            <BodySmall color={theme.palette.custom.accentTextLightSecondary} textAlign="center">
              <>No liquidity found.</>
            </BodySmall>
          </LPTokensContainer>
        )}
        {address ? (
          <ButtonPrimary onClick={() => router.push('/pools/add')}>
            + Add Liquidity
          </ButtonPrimary>
        ) : (
          <WalletButton />
        )}
        {/* <div style={{ width: '100%' }}>
          <AutoRow style={{ justifyContent: 'space-between' }}>
            <SubHeader>Your liquidity</SubHeader>
            <SettingsTab autoSlippage={DEFAULT_SLIPPAGE_INPUT_VALUE} />
          </AutoRow>
          <div>
            <BodySmall>List of your liquidity positions</BodySmall>
          </div>
        </div>
        {!address ? (
          <LPTokensContainer>
            <BodySmall color={theme.palette.custom.accentTextLightSecondary} textAlign="center">
              <>Connect to a wallet to view your liquidity.</>
            </BodySmall>
          </LPTokensContainer>
        ) : v2IsLoading ? (
          <LPTokensContainer>
            <BodySmall color={theme.palette.custom.accentTextLightSecondary} textAlign="center">
              <Dots>
                <>Loading</>
              </Dots>
            </BodySmall>
          </LPTokensContainer>
        ) : lpTokens && lpTokens?.length > 0 ? (
          <LPTokensContainer>
            {lpTokens.map((obj: any, index: number) => (
              <LPCard onClick={() => handleLPClick(obj)} key={index}>
                <AutoRow gap={'2px'}>
                  <CurrencyLogo currency={obj.token_0} size={isMobile ? '16px' : '24px'} />
                  <CurrencyLogo currency={obj.token_1} size={isMobile ? '16px' : '24px'} />
                  <SubHeader>
                    {obj.token_0.code} - {obj.token_1.code}
                  </SubHeader>
                  <LPPercentage>{obj.lpPercentage}%</LPPercentage>
                </AutoRow>
                <StatusWrapper>{obj.status}</StatusWrapper>
              </LPCard>
            ))}
          </LPTokensContainer>
        ) : isLoading ? (
          <LPTokensContainer>
            <CircularProgress size="16px" />
          </LPTokensContainer>
        ) : (
          <LPTokensContainer>
            <BodySmall color={theme.palette.custom.accentTextLightSecondary} textAlign="center">
              <>No liquidity found.</>
            </BodySmall>
          </LPTokensContainer>
        )}
        {address ? (
          <ButtonPrimary onClick={() => router.push('/liquidity/add')}>
            + Add Liquidity
          </ButtonPrimary>
        ) : (
          <WalletButton />
        )} */}
      </PageWrapper>
      <LiquidityPoolInfoModal
        selectedLP={selectedLP}
        isOpen={isModalOpen}
        onDismiss={() => setModalOpen(false)}
      />
    </>
  );
}
