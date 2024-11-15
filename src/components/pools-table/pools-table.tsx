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
  roundNumber,
  shouldShortenCode,
} from "../../utils/utils";
import Token from "../token";
import { StyledTableCell } from "../styled/table-cell";
import { StyledCard } from "../styled/card";
import { useTheme } from "soroswap-ui";

interface HeadCell {
  id: keyof Pool;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
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
    id: "volume24h",
    numeric: true,
    label: "Volume 24H",
  },
  {
    id: "volume7d",
    numeric: true,
    label: "Volume 7D",
  },
  {
    id: "fees24h",
    numeric: true,
    label: "Fees 24H",
  },
  {
    id: "feesYearly",
    numeric: true,
    label: "Fees Yearly",
  },
];

interface PoolsTableProps {
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof Pool
  ) => void;
  order: "asc" | "desc";
  orderBy: string;
}

function PoolsTableHead(props: PoolsTableProps) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler =
    (property: keyof Pool) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow sx={{ bgcolor: "#1b1b1b" }}>
        <StyledTableCell>#</StyledTableCell>
        {headCells.map((headCell) => (
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
    rows,
    defaultOrder: "desc",
    defaultOrderBy: "tvl",
  });

  const router = useRouter();

  const theme = useTheme();

  const onClickRow = (pool: string) => {
    router.push({
      pathname: `/pools/${pool}`,
      query: {
        network: router.query.network,
      },
    });
  };

  if (isLoading) {
    return <Skeleton variant="rounded" height={300} />;
  }

  return (
    <Box sx={{ width: "100%" }}>
      <StyledCard sx={{ width: "100%" }}>
        <TableContainer>
          <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
            <PoolsTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
            />
            <TableBody>
              {visibleRows?.map((row, index) => {
                return (
                  <TableRow
                    component="a"
                    href={`/pools/${row.address}?network=${router.query.network}`}
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
                      {formatNumberToMoney(row.tvl, 2)}
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      {formatNumberToMoney(row.volume24h)}
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      {formatNumberToMoney(row.volume7d)}
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      {formatNumberToMoney(row.fees24h)}
                    </StyledTableCell>
                    <StyledTableCell align="right">
                      {formatNumberToMoney(row.feesYearly)}
                    </StyledTableCell>
                  </TableRow>
                );
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 53 * emptyRows,
                  }}
                >
                  <StyledTableCell colSpan={6} />
                </TableRow>
              )}
              {visibleRows.length === 0 && (
                <TableRow>
                  <StyledTableCell colSpan={6} align="center">
                    No pools found
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
