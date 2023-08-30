import { MenuItem, TextField } from "@mui/material";
import { TokenType } from "../interfaces/tokens";

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

  return tokens.length > 0 ? (
    <TextField
      id="outlined-select-currency"
      select
      label={title}
      defaultValue={inputToken?.symbol}
      onChange={onChange}
    >
      {tokensToShow.map((option) => (
        <MenuItem key={option.address} value={option.symbol}>
          {`${option.name} (${option.symbol})`}
        </MenuItem>
      ))}
    </TextField>
  ) : null;
}
