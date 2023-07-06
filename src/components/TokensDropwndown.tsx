import { MenuItem, TextField } from "@mui/material";
import { TokenType } from "../interfaces/tokens";
import { useTokensWithPair } from "../hooks/usePairExist";

export default function TokensDropdown({
  tokens,
  onChange,
  title,
  inputToken,
  isOutput,
}: {
  tokens: TokenType[];
  onChange: any;
  title: string;
  inputToken?: TokenType;
  isOutput: boolean;
}) {
  let tokensToShow = tokens;
  if (isOutput && inputToken) {
    tokensToShow = useTokensWithPair(tokens, inputToken);
  }

  return tokensToShow.length > 0 ? (
    <TextField
      id="outlined-select-currency"
      select
      label={title}
      defaultValue={
        !isOutput ? tokensToShow[0].token_symbol : tokensToShow[0].token_symbol
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
