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
      defaultValue={""}
      onChange={onChange}
    >
      <MenuItem value={""}>
        </MenuItem>
      {tokensToShow.map((option) => (
        <MenuItem key={option.token_id} value={option.token_symbol}>
          {`${option.token_name} (${option.token_symbol})`}
        </MenuItem>
      ))}
    </TextField>
  ) : null;
}
