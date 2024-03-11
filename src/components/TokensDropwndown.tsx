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
      defaultValue={inputToken?.code}
      onChange={onChange}
    >
      {tokensToShow.map((option) => (
        <MenuItem key={option.contract} value={option.code}>
          {`${option.name} (${option.code})`}
        </MenuItem>
      ))}
    </TextField>
  ) : null;
}
