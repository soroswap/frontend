import { TokenType } from "./tokens";

export type RouterEventsAPIResponse = RouterEventAPI[];

export interface RouterEventAPI {
  tokenA?: TokenType;
  tokenB?: TokenType;
  amountA: string;
  amountB: string;
  txHash?: string;
  eType: RouterEventType;
  account?: string;
  timestamp?: string;
}

export type RouterEventType = "swap" | "add" | "remove" | "init";
