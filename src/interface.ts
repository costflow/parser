import { currencyList } from "./config/currency-codes";

export type ArrayElement<
  ArrayType extends readonly unknown[]
> = ArrayType[number];

export interface UserConfig {
  mode?: "json" | "beancount";
  // user related
  currency: ArrayElement<typeof currencyList>;
  timezone?: string;

  // customize
  flowSymbol?: string;
  pipeSymbol?: string;
  account?: Record<string, string>;
  formula?: Record<string, string>;

  // for transactions
  defaultAccount?: string; // default account full name
  upperCaseAsCurrencyCode?: boolean;
  insertTime?: "metadata" | null;
  tag?: string | null;
  link?: string | null;

  // for beancount and other plain-text output
  indent?: number;
  lineLength?: number;

  // exchange API
  alphavantage?: string;
}

export type ParseResult =
  | NParseResult.Result
  | NParseResult.TransactionResult
  | NParseResult.Error
  | string;

export namespace NParseResult {
  export interface Result extends Record<string, any> {
    // Basic
    directive: string;
    date: string;
    created_at: string;
    shortcut?: string;
    timezone: string;
    data: any;

    // Generate string for 'beancount' mode
    output?: string;
  }
  export interface TransactionResult extends Result {
    // Basic
    directive: string;
    date: string;
    created_at: string;
    shortcut?: string;
    timezone: string;
    data: any;
  }

  export interface Error {
    error:
      | "INVALID_MODE"
      | "INVALID_FLOW_SYMBOL"
      | "INVALID_PIPE_SYMBOL"
      | "INVALID_TIMEZONE"
      | "TRANSACTION_SYMBOL_MIXED"
      | "TRANSACTION_FLOW_SYMBOL_TOO_MANY"
      | "FORMULA_NOT_FOUND"
      | "FORMULA_LOOP"
      | "FORMULA_COMPILE_ERROR"
      | "DOUBLE_QUOTES_SHOULD_BE_FOUR"
      | "OUTPUT_MODE_NOT_SUPPORT_YET"
      | "ALPHAVANTAGE_INVALID_KEY"
      | "ALPHAVANTAGE_EXCEED_RATE_LIMIT";
  }
}

export interface AAC {
  amount: number;
  account: string;
  currency: string;
}
