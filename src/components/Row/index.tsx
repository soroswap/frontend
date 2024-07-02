import { Box, styled } from 'soroswap-ui';

const Row = styled(Box)<{
  width?: string;
  align?: string;
  justify?: string;
  padding?: string;
  border?: string;
  borderRadius?: string;
}>`
  width: ${({ width }) => width ?? '100%'};
  display: flex;
  padding: 0;
  align-items: ${({ align }) => align ?? 'center'};
  justify-content: ${({ justify }) => justify ?? 'flex-start'};
  padding: ${({ padding }) => padding};
  border: ${({ border }) => border};
  border-radius: ${({ borderRadius }) => borderRadius};
`;

export const RowBetween = styled(Row)`
  justify-content: space-between;
`;

export const RowFlat = styled('div')`
  display: flex;
  align-items: flex-end;
`;

export const AutoRow = styled(Row, {
  shouldForwardProp: (prop) => prop !== 'gap' && prop !== 'nowrap' && prop !== 'justify',
})<{ gap?: string; justify?: string; nowrap?: boolean }>`
  flex-wrap: ${({ nowrap }) => (nowrap ? `nowrap` : `wrap`)};
  justify-content: ${({ justify }) => justify && justify};

  & > * {
    margin: ${({ gap }) => gap};
  }
`;

export const RowFixed = styled(Row)<{ gap?: string; justify?: string }>`
  width: fit-content;
  margin: ${({ gap }) => gap && `-${gap}`};
`;

export default Row;
