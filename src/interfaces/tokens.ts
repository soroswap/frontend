export interface TokenType {
  token_id: string;
  token_address: string;
  token_name: string;
  token_symbol: string;
}

export interface tokensResponse {
  network: string;
  tokens: TokenType[];
}
