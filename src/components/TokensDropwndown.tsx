import { MenuItem, TextField } from "@mui/material";
import { TokenType } from "../interfaces/tokens";



export default function TokensDropdown({tokens, onChange, title, pairExist}: {tokens: TokenType[], onChange: any, title: string, pairExist?: (value: TokenType) => boolean}) {
  if (pairExist === undefined) {
    pairExist = () => {return true}
  }

  return (
    <TextField
          id="outlined-select-currency"
          select
          label={title}
          onChange={onChange}
        >
          {tokens.map((option) => (
            pairExist!(option)?<MenuItem key={option.token_id} value={option.token_symbol}>
              {`${option.token_name} (${option.token_symbol})`}
            </MenuItem>:null
          ))}
        </TextField>
  )
}
