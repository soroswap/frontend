import { styled } from "@mui/material"

export const Column = styled('div')<{
  gap?: string
  alignItems?: string
}>`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: ${({alignItems}) => alignItems};
  gap: ${({ gap, theme }) => gap};
`
export const ColumnCenter = styled(Column)`
  width: 100%;
  align-items: center;
`

export const AutoColumn = styled('div')<{
  gap?: string
  justify?: 'stretch' | 'center' | 'start' | 'end' | 'flex-start' | 'flex-end' | 'space-between'
  grow?: true
}>`
  display: grid;
  grid-auto-rows: auto;
  grid-row-gap: ${({ gap }) => gap};
  justify-items: ${({ justify }) => justify && justify};
  flex-grow: ${({ grow }) => grow && 1};
`

export default Column
