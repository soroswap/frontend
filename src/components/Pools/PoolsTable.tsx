import { useEffect, useState } from 'react';
import { useSorobanReact } from '@soroban-react/core';
import { useRouter } from 'next/router';

import { TokenType } from 'interfaces';

import useGetMyBalances from 'hooks/useGetMyBalances';
import useGetLpTokens from 'hooks/useGetLpTokens';
import useTable from 'hooks/useTable';

import { LpTokensObj } from 'functions/getLpTokens';
import { formatNumberToMoney, shouldShortenCode } from 'helpers/utils';

import LiquidityPoolInfoModal from 'components/Pools/LiquidityPoolInfoModal';
import { ButtonPrimary } from 'components/Buttons/Button';
import CurrencyLogo from 'components/Logo/CurrencyLogo';
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
  Card,
  Skeleton,
  styled
} from 'soroswap-ui';
import { visuallyHidden } from '@mui/utils';
import { fetchTokens } from 'services/tokens';


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

interface PoolsCell {
  name: string;
  address: string;
  tvl: string;
  volume24h: string;
  volume7d: string;
  fees24h: string;
  feesYearly: string;
  totalShares: string;
}

interface HeadCell {
  id: keyof PoolsCell;
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
    id: 'totalShares',
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
export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  border: 0,
  height: 10,
}));

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
          if (headCell.id === 'totalShares' && !address) return null;
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

export function PoolsTable(props: any) {
  const { nativeToken } = props;
  const { tokens, tokenBalancesResponse } = useGetMyBalances();
  const { lpTokens, isLoading, mutate } = useGetLpTokens();
  const router = useRouter();
  const { address } = useSorobanReact();
  const { activeChain } = useSorobanReact()
  const [rows, setRows] = useState<PoolData[]>([]);
  const [loadingRows, setLoadingRows] = useState<boolean>(true);
  const [loadingShares, setLoadingShares] = useState<boolean>(true);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedLP, setSelectedLP] = useState<LpTokensObj>();

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
    defaultOrderBy: 'tvl',
    defaultRowsPerPage: 5,
  });

  const filterTokens = async (rows: any) => {
    if (!activeChain) return;
    let allowedTokens = await fetchTokens(activeChain?.id).then((data) => {
      switch (activeChain?.id) {
        case 'testnet':
          return data[1].assets;
        case 'mainnet':
          return data.assets;
        default:
          return data;
      }
    });
    console.log(rows)
    console.log(allowedTokens)
    const filteredRows = rows.filter((row: any) =>
      allowedTokens.some((token: any) => token.contract === row.tokenA.contract) &&
      allowedTokens.some((token: any) => token.contract === row.tokenB.contract) ||
      allowedTokens.some((token: any) => token.contract === row.tokenB.contract) &&
      allowedTokens.some((token: any) => token.contract === row.tokenA.contract)
    );
    return filteredRows;
  }

  useEffect(() => {
    const fetchPools = async () => {
      const response = await fetch(`https://info.soroswap.finance/api/pairs?network=${activeChain?.id.toUpperCase()}`);
      if (address && lpTokens) {
        response.json().then(async (data) => {
          const pools = data.map((pool: any) => {
            const tempShare = lpTokens?.find((lpToken: any) => lpToken.address === pool.address)?.balance;
            return {
              ...pool,
              totalShares: tempShare ?? 0,
            };
          });
          const filteredTokens = await filterTokens(pools);
          setRows(filteredTokens);
          setLoadingShares(false);
        })
      } else {
        response.json().then(async (data) => {
          const filteredTokens = await filterTokens(data);
          setRows(filteredTokens);
        })
      }
      setLoadingRows(false);
    }
    fetchPools();
  }, [activeChain, address, lpTokens]);


  const handleLPClick = (obj: any) => {
    const parsedData: LpTokensObj = {
      token_0: obj.tokenA,
      token_1: obj.tokenB,
      balance: obj.totalShares,
      lpPercentage: obj.totalShares,
      status: 'Active',
      reserve0: obj.reserveA,
      reserve1: obj.reserveB,
      totalShares: obj.totalShares,
      myReserve0: obj.reserveA,
      myReserve1: obj.reserveB,
    };
    setSelectedLP(parsedData);
    setModalOpen(true);
  };

  if (rows.length === 0 && !loadingRows) {
    return <Card sx={{ p: 2, my: 4 }}>No pools found.</Card>;
  }
  if (rows.length === 0 && loadingRows) {
    const skeletonRow = () => {
      return (
        <TableRow>
          <TableCell >
            <Skeleton height={34} />
          </TableCell>
          <TableCell >
            <Skeleton height={34} />
          </TableCell>
          <TableCell >
            <Skeleton height={34} />
          </TableCell>
          <TableCell >
            <Skeleton height={34} />
          </TableCell>
          <TableCell >
            <Skeleton height={34} />
          </TableCell>
          <TableCell>
            <Skeleton height={34} />
          </TableCell>
          {address && (
            <>
              <TableCell>
                <Skeleton height={34} />
              </TableCell>
              <TableCell>
                <Skeleton height={34} />
              </TableCell>
            </>

          )}
        </TableRow>
      )
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
            {skeletonRow()}
            {skeletonRow()}
            {skeletonRow()}
            {skeletonRow()}
            {skeletonRow()}
          </TableBody>
        </Table>
      </TableContainer>)
  }

  const tableButtonStyle = { height: 10, fontSize: 12, width: 120, justifySelf: 'center', borderRadius: 16 }
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
              <TableRow key={index}>
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
                    {(loadingShares || isLoading) ?
                      <Skeleton style={{ justifySelf: 'center' }} width={'200px'} height={'34px'} /> : formatNumberToMoney(row.totalShares / 10 ** 7, 2)
                    }
                  </StyledTableCell>
                )}
                {address && (
                  <StyledTableCell align="center">
                    {(loadingShares || isLoading) &&
                      <Skeleton width={'120px'} height={'34px'} style={{ justifySelf: 'center' }} />
                    }
                    {row.totalShares === 0 && (
                      <ButtonPrimary size='small' style={tableButtonStyle} onClick={() => router.push(`pools/add/${row.tokenA.contract}/${row.tokenB.contract}`)}>
                        + Add Liquidity
                      </ButtonPrimary>
                    )}
                    {row.totalShares > 0 && (
                      <ButtonPrimary size='small' style={tableButtonStyle} onClick={() => handleLPClick(row)}>
                        Manage
                      </ButtonPrimary>
                    )}
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
      <LiquidityPoolInfoModal
        selectedLP={selectedLP}
        isOpen={isModalOpen}
        onDismiss={() => setModalOpen(false)}
      />
    </TableContainer >
  );
}