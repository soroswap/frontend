import { MenuItem, TextField } from "@mui/material";
import { TokenType } from "../interfaces/tokens";
import {useTokensWithPair} from '../hooks/usePairExist';


export default function TokensDropdown(
  {tokens, onChange, title, inputToken}:
  { tokens: TokenType[],
    onChange: any, 
    title: string, 
    inputToken: TokenType}) {
      

  let tokensToShow = tokens;
  if (inputToken){
    tokensToShow = useTokensWithPair(tokens, inputToken)
  }
  
  return (
    <TextField
          id="outlined-select-currency"
          select
          label={title}
          // defaultValue={tokensToShow[0].token_symbol}
          onChange={onChange}
        >
          {tokensToShow.map((option) => ( 
            <MenuItem key={option.token_id} value={option.token_symbol}>
              {`${option.token_name} (${option.token_symbol})`}
            </MenuItem>
          ))}
        </TextField>
  )
}
