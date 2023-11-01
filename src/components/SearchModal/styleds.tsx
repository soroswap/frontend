import searchIcon from 'assets/svg/searchDark.svg';
import searchIconLight from 'assets/svg/searchLight.svg';

import { AutoColumn } from '../Column';
import { RowBetween } from '../Row';
import { styled } from '@mui/material';
import { opacify } from '../../themes/utils';
import { LoadingRows as BaseLoadingRows } from 'components/Loader/styled';

export const PaddedColumn = styled(AutoColumn)`
  padding: 20px;
`;

export const MenuItem = styled(RowBetween, {
  shouldForwardProp: (prop) => prop !== 'dim',
})<{ dim?: boolean; disabled: boolean; selected: boolean }>`
  padding: 4px 20px;
  height: 56px;
  display: grid;
  grid-template-columns: auto minmax(auto, 1fr) auto minmax(0, 0px);
  grid-gap: 16px;
  cursor: ${({ disabled }) => !disabled && 'pointer'};
  pointer-events: ${({ disabled }) => disabled && 'none'};
  :hover {
    background-color: ${({ theme }) => opacify(8, theme.palette.secondary.main)};
  }
  opacity: ${({ disabled, selected, dim }) => (dim || disabled || selected ? 0.4 : 1)};
`;

export const SearchInput = styled('input')`
  background: no-repeat scroll 7px 7px;
  background-image: ${({ theme }) =>
    theme.palette.mode == 'dark' ? `url(${searchIcon.src})` : `url(${searchIconLight.src})`};
  background-size: 20px 20px;
  background-position: 12px center;
  position: relative;
  display: flex;
  padding: 16px;
  padding-left: 40px;
  height: 40px;
  align-items: center;
  width: 100%;
  white-space: nowrap;
  background-color: ${({ theme }) => theme.palette.customBackground.module};
  border: none;
  outline: none;
  border-radius: 12px;
  color: ${({ theme }) => theme.palette.primary.main};
  border-style: solid;
  border: 1px solid ${({ theme }) => opacify(24, theme.palette.secondary.main)};
  -webkit-appearance: none;

  font-size: 16px;

  ::placeholder {
    color: ${({ theme }) => theme.palette.custom.accentTextLightSecondary};
    font-size: 16px;
  }
  transition: border 100ms;
  :focus {
    border: 1px solid ${({ theme }) => opacify(24, theme.palette.custom.borderColor)};
    background-color: ${({ theme }) => theme.palette.customBackground.surface};
    outline: none;
  }
`;
export const Separator = styled('div')`
  width: 100%;
  height: 1px;
  background-color: ${({ theme }) => theme.palette.custom.textTertiary};
`;

export const LoadingRows = styled(BaseLoadingRows)`
  grid-column-gap: 0.5em;
  grid-template-columns: repeat(12, 1fr);
  max-width: 960px;
  padding: 12px 20px;

  & > div:nth-child(4n + 1) {
    grid-column: 1 / 8;
    height: 1em;
    margin-bottom: 0.25em;
  }
  & > div:nth-child(4n + 2) {
    grid-column: 12;
    height: 1em;
    margin-top: 0.25em;
  }
  & > div:nth-child(4n + 3) {
    grid-column: 1 / 4;
    height: 0.75em;
  }
`;
