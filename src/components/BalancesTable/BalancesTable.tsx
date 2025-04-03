import { Card, Stack, Switch, Tooltip, Typography } from 'soroswap-ui';

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

import { visuallyHidden } from '@mui/utils';

import ClipboardComponent from 'components/Clipboard/ClipboardComponent';
import CurrencyLogo from 'components/Logo/CurrencyLogo';
import { shortenAddress } from 'helpers/address';
import { relevantTokensType } from 'hooks';
import useBoolean, { UseBooleanReturnProps } from 'hooks/useBoolean';
import useGetMyBalances from 'hooks/useGetMyBalances';
import useTable from 'hooks/useTable';
import { useRouter } from 'next/router';
import * as React from 'react';

const shortenStellarClassicAddress = (address: string) => {
  const [first, last] = address.split(':');
  return `${first}:${shortenAddress(last)}`;
};

interface HeadCell {
  id: keyof relevantTokensType | 'type';
  label: string;
  numeric: boolean;
  align: 'left' | 'center' | 'right';
}

const headCells: readonly HeadCell[] = [
  {
    id: 'code',
    numeric: false,
    label: 'Token',
    align: 'left',
  },

  {
    id: 'contract',
    numeric: false,
    label: 'Address',
    align: 'left',
  },
  {
    id: 'type',
    numeric: false,
    label: 'Type',
    align: 'left',
  },
  {
    id: 'balance',
    numeric: true,
    label: 'Balance',
    align: 'right',
  },
];

interface BalancesTableProps {
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    property: keyof relevantTokensType | 'type',
  ) => void;
  order: 'asc' | 'desc';
  orderBy: string;
  showStellarClassicAddresses: UseBooleanReturnProps;
}

function BalancesTableHead(props: BalancesTableProps) {
  const { order, orderBy, onRequestSort, showStellarClassicAddresses } = props;
  const createSortHandler =
    (property: keyof relevantTokensType | 'type') => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, property);
    };

  return (
    <TableHead>
      <TableRow sx={{ verticalAlign: 'bottom' }}>
        <TableCell>#</TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.id === 'contract' && (
              <Tooltip title="Toggle Address for Stellar Classic Assets" placement="top">
                <Stack direction="row" alignItems="center" mb={1}>
                  <Typography fontSize={12}>Wrapped</Typography>
                  <Switch
                    color="warning"
                    size="small"
                    checked={showStellarClassicAddresses.value}
                    onChange={(e) => showStellarClassicAddresses.setValue(e.target.checked)}
                  />
                  <Typography fontSize={12}>Stellar Classic</Typography>
                </Stack>
              </Tooltip>
            )}
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
        ))}
      </TableRow>
    </TableHead>
  );
}

export default function BalancesTable(props: any) {
  const { nativeToken } = props;
  const { tokens, tokenBalancesResponse } = useGetMyBalances();
  const rows =
    tokenBalancesResponse?.balances?.map((x) => ({
      ...x,
      type: x.issuer
        ? 'Stellar Classic Asset'
        : x.contract && x.contract === nativeToken.contract && x.code === nativeToken.code
        ? 'Native'
        : 'Soroban Token',
    })) ?? [];

  const showStellarClassicAddresses = useBoolean();

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
  } = useTable<relevantTokensType & { type: string }>({
    rows,
    defaultOrder: 'desc',
    defaultOrderBy: 'balance',
    defaultRowsPerPage: 5,
  });

  const router = useRouter();

  const onClickRow = (pool: string) => {
    // router.push(`/pools/${pool}`);
  };

  if (rows.length === 0) {
    return <Card sx={{ p: 2 }}>No tokens found.</Card>;
  }

  return (
    <TableContainer>
      <Table sx={{ minWidth: 700 }}>
        <BalancesTableHead
          showStellarClassicAddresses={showStellarClassicAddresses}
          order={order}
          orderBy={orderBy}
          onRequestSort={handleRequestSort}
        />
        <TableBody>
          {visibleRows.map((row, index) => {
            const isStellarClassicAsset = row.type === 'Stellar Classic Asset';
            return (
              <TableRow onClick={() => onClickRow(row.contract)} key={index}>
                <TableCell>{index + 1 + page * rowsPerPage}</TableCell>
                <TableCell align="left">
                  <Box display="flex" gap="2px" alignItems="center">
                    <CurrencyLogo
                      currency={tokens.find((token) => token.contract === row.contract)}
                      size={'16px'}
                      style={{ marginRight: '8px' }}
                    />
                    {row.code}
                  </Box>
                </TableCell>
                <TableCell align="left" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ClipboardComponent
                    size={16}
                    onClick={() => {
                      const copyText =
                        isStellarClassicAsset && showStellarClassicAddresses.value
                          ? `${row.code}:${row.issuer}`
                          : row.contract;
                      navigator.clipboard.writeText(copyText);
                    }}
                  />
                  <Tooltip
                    title={
                      isStellarClassicAsset && showStellarClassicAddresses.value
                        ? row.name
                        : row.contract
                    }
                    placement="top"
                  >
                    <div>
                      {isStellarClassicAsset && showStellarClassicAddresses.value
                        ? shortenStellarClassicAddress(`${row.code}:${row.issuer}`)
                        : shortenAddress(row.contract)}
                    </div>
                  </Tooltip>
                </TableCell>
                <TableCell align="left">{row.type}</TableCell>
                <TableCell align="right">
                  {' '}
                  {row.balance === undefined ? '0' :
                    Number(row.balance).toLocaleString('en', { maximumFractionDigits: 7 }) as string}
                </TableCell>
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
    </TableContainer>
  );
}
