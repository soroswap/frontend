import { MenuItem, TextField } from "@mui/material";
import { TokenType } from "../interfaces/tokens";



export default function TokensDropdown({tokens, onChange, title}: {tokens: TokenType[], onChange: any, title: string}) {


  return (
    <TextField
          id="outlined-select-currency"
          select
          label={title}
          onChange={onChange}
        >
          {tokens.map((option) => (
            <MenuItem key={option.token_id} value={option.token_symbol}>
              {`${option.token_name} (${option.token_symbol})`}
            </MenuItem>
          ))}
        </TextField>
  )
}
