import {
  Skeleton,
  Box,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from "soroswap-ui";

import { visuallyHidden } from "@mui/utils";
import { useRouter } from "next/router";
import * as React from "react";
import useTable from "../../hooks/use-table";
import { Pool } from "../../types/pools";
import {
  formatNumberToMoney,
  shouldShortenCode,
} from "../../utils/utils";
import Token from "../token";
import { StyledTableCell } from "../styled/table-cell";
import { StyledCard } from "../styled/card";
import { useTheme } from "soroswap-ui";
import { useSorobanReact } from '@soroban-react/core';
import { ButtonPrimary } from 'components/Buttons/Button';
import { WalletButton } from 'components/Buttons/WalletButton';

interface HeadCell {
  id: keyof Pool | 'shareOfPool' | 'actions';
  label: string;
  numeric: boolean;
}

const getHeadCells = (isWalletConnected: boolean): readonly HeadCell[] => {
  const cells: HeadCell[] = [
    {
      id: "address",
      numeric: false,
      label: "Pool",
    },
    {
      id: "tvl",
      numeric: true,
      label: "TVL",
    },
    {
      id: "apy",
      numeric: true,
      label: "APY",
    }
  ];

  if (isWalletConnected) {
    cells.push({
      id: "shareOfPool",
      numeric: true,
      label: "Share of Pool",
    });
    cells.push({
      id: "actions",
      numeric: true,
      label: "",
    });
  }

  return cells;
};

function PoolsTableHead({
  order,
  orderBy,
  onRequestSort,
  isWalletConnected,
}: {
  order: "asc" | "desc";
  orderBy: string;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Pool | 'shareOfPool' | 'actions') => void;
  isWalletConnected: boolean;
}) {
  const createSortHandler = (property: keyof Pool | 'shareOfPool' | 'actions') => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow sx={{ bgcolor: "#1b1b1b" }}>
        <StyledTableCell>#</StyledTableCell>
        {getHeadCells(isWalletConnected).map((headCell) => (
          <StyledTableCell
            key={headCell.id}
            align={headCell.numeric ? "right" : "left"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </StyledTableCell>
        ))}
        {!isWalletConnected && <StyledTableCell />}
      </TableRow>
    </TableHead>
  );
}

export default function PoolsTable({
  rows,
  emptyMessage = "No pools found",
  isLoading = false,
}: {
  rows: Pool[];
  emptyMessage?: string;
  isLoading?: boolean;
}) {
  const sorobanContext = useSorobanReact();
  const { address } = sorobanContext;
  const isWalletConnected = !!address;

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
  } = useTable<Pool>({
    rows: rows.map(row => ({
      ...row,
      shareOfPool: row.shareOfPool || 0
    })),
    defaultOrder: "desc",
    defaultOrderBy: "shareOfPool" as keyof Pool,
  });

  const router = useRouter();
  const theme = useTheme();

  const handleAction = (pool: Pool) => {
    if (!isWalletConnected) return;
    
    if (pool.shareOfPool && pool.shareOfPool > 0) {
      router.push({
        pathname: `/pools/${pool.address}`,
        query: { network: router.query.network },
      });
    } else {
      router.push({
        pathname: '/pools/add',
        query: { pool: pool.address, network: router.query.network },
      });
    }
  };

  const handleCreatePool = () => {
    router.push({
      pathname: '/pools/add',
      query: { network: router.query.network },
    });
  };

  if (isLoading) {
    return <Skeleton variant="rounded" height={300} />;
  }

  return (
    <Box sx={{ width: "100%" }}>
      {isWalletConnected && (
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <ButtonPrimary
            onClick={handleCreatePool}
            style={{ width: 'auto', padding: '8px 16px' }}
          >
            Create Liquidity Pool
          </ButtonPrimary>
        </Box>
      )}
      <StyledCard 
        sx={{ 
          width: "100%",
          bgcolor: "rgba(22, 21, 34, 1)", 
          borderRadius: "16px",
        }}
      >
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
            <PoolsTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              isWalletConnected={isWalletConnected}
            />
            <TableBody>
              {visibleRows?.map((row, index) => (
                <TableRow
                  key={index}
                  sx={{
                    "&:nth-of-type(2n)": {
                      bgcolor: "#1b1b1b",
                    },
                    "&:hover": {
                      cursor: "pointer",
                      bgcolor: theme.palette.background.paper,
                      borderTop: `1px solid ${theme.palette.customBackground.accentAction}`,
                      borderBottom: `1px solid ${theme.palette.customBackground.accentAction}`,
                    },
                    bgcolor: "transparent",
                  }}
                >
                  <StyledTableCell>{index + 1}</StyledTableCell>
                  <StyledTableCell
                    align="left"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      height: 70,
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      <Token
                        imageUrl={row.tokenA?.icon}
                        width={20}
                        height={20}
                      />
                      <Token
                        imageUrl={row.tokenB?.icon}
                        width={20}
                        height={20}
                      />
                    </Box>
                    {shouldShortenCode(row.tokenA?.code)} /{" "}
                    {shouldShortenCode(row.tokenB?.code)}
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    {formatNumberToMoney(row.tvl || 0, 2)}
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    {row.apy ? `${row.apy}%` : '-'}
                  </StyledTableCell>
                  {isWalletConnected ? (
                    <>
                      <StyledTableCell align="right">
                        {row.shareOfPool ? `${row.shareOfPool}%` : '0%'}
                      </StyledTableCell>
                      <StyledTableCell align="right">
                        <ButtonPrimary
                          onClick={() => handleAction(row)}
                          style={{ height: '36px', padding: '0 16px' }}
                        >
                          {row.shareOfPool && row.shareOfPool > 0 ? 'Manage' : 'Add Liquidity'}
                        </ButtonPrimary>
                      </StyledTableCell>
                    </>
                  ) : (
                    <StyledTableCell align="right">
                      <WalletButton style={{ height: '36px', padding: '0 16px' }} />
                    </StyledTableCell>
                  )}
                </TableRow>
              ))}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <StyledTableCell colSpan={isWalletConnected ? 6 : 5} />
                </TableRow>
              )}
              {visibleRows.length === 0 && (
                <TableRow>
                  <StyledTableCell colSpan={isWalletConnected ? 6 : 5} align="center">
                    {emptyMessage}
                  </StyledTableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[]}
        />
      </StyledCard>
    </Box>
  );
}