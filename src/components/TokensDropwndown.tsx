import { MenuItem, TextField } from "@mui/material";
import { TokenType } from "../interfaces/tokens";
import { useTokensWithPair } from "../hooks/usePairExist";

export default function TokensDropdown({
  tokens,
  onChange,
  title,
  inputToken,
}: {
  tokens: TokenType[];
  onChange: any;
  title: string;
  inputToken?: TokenType;
}) {
  let tokensToShow = tokens;
  if (inputToken) {
    tokensToShow = tokens.filter((token) => token !== inputToken);
  }

  return tokens.length > 0 ? (
    <TextField
      id="outlined-select-currency"
      select
      label={title}
      defaultValue={
        !inputToken ? tokens[0].token_symbol : tokens[1].token_symbol
      }
      onChange={onChange}
    >
      {tokensToShow.map((option) => (
        <MenuItem key={option.token_id} value={option.token_symbol}>
          {`${option.token_name} (${option.token_symbol})`}
        </MenuItem>
      ))}
    </TextField>
  ) : null;
}
