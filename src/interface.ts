import { currencyList } from "./config/currency-codes";
import type { cryptoList } from "./config/crypto-currency-codes";
import type { exchangeList } from "./config/currency-codes";

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
  | NParseResult.Error;

export namespace NParseResult {
  export interface Result {
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
    links: string[];
    tags: string[];
    payee: string;
    narration: string;
    completed: boolean;
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
      | "OUTPUT_MODE_NOT_SUPPORT"
      | "ALPHAVANTAGE_INVALID_KEY"
      | "ALPHAVANTAGE_EXCEED_RATE_LIMIT"
      | "ALPHAVANTAGE_ERROR";
  }
}

export interface AAC {
  amount: number;
  account: string;
  currency: string;
}

/* for alphavantage */

export type AlphaVantageCryptoCurrency = ArrayElement<typeof cryptoList>;
export type AlphaVantageFiatCurrency = ArrayElement<typeof exchangeList>;
export type AlphaVantageCurrency =
  | AlphaVantageCryptoCurrency
  | AlphaVantageFiatCurrency;

export namespace NAlphaVantage {
  export interface IExchangeSuccessResponse {
    rate: number;
    updatedAt: number;
  }
  export interface IQuoteSuccessResponse {
    price: number;
    change: number;
    percent: number;
  }
  export interface AlphaVantageError {
    error:
      | "ALPHAVANTAGE_INVALID_KEY"
      | "ALPHAVANTAGE_EXCEED_RATE_LIMIT"
      | "ALPHAVANTAGE_ERROR";
  }
}

export type ExchangeResponse =
  | NAlphaVantage.IExchangeSuccessResponse
  | NAlphaVantage.AlphaVantageError;

export type QuoteResponse =
  | NAlphaVantage.IQuoteSuccessResponse
  | NAlphaVantage.AlphaVantageError;
