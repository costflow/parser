/*
  Costflow Syntax: https://docs.costflow.io/syntax/
*/
import _ from "lodash";
import { currencyList } from "./config/currency-codes";
import { exchange, quote } from "./alphavantage";

import {
  isNumber,
  isDate,
  serialize,
  convertToYMD,
  convertToNumber,
  nowWithTimezone,
  isCurrency,
} from "./utils";
import { compileFormula } from "./formula";
import { parseTransaction } from "./transaction";

type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType[number];

export interface UserConfig {
  // user related
  currency: ArrayElement<typeof currencyList>;
  timezone?: string;

  // customize
  flowSymbol?: string;
  pipeSymbol?: string;
  accountMap: Record<string, string>;
  formula: Record<string, string>;

  // for transactions
  insertTime?: "metadata" | null;
  tag?: string | null;
  link?: string | null;

  // for beancount and other plain-text output
  indent?: number;
  lineLength?: number;

  // exchange API
  alphavantage?: string;
}

export type ParseResult = ParseResult.Result | ParseResult.Error;

export namespace ParseResult {
  export interface Result extends Record<string, any> {
    // Basic
    directive: string;
    date: string;
    created_at: string;
    shortcut?: string;
    timezone: string;
    data: any[];

    // Only for transactions
    completed: boolean | null;
    amount: number | null;
    payee: string | null;
    narration: string | null;
    tags: string[];
    links: string[];

    // Generate string for 'beancount' mode
    output?: string;
  }

  export interface Error {
    error:
      | "INVALID_MODE"
      | "INVALID_FLOW_SYMBOL"
      | "INVALID_PIPE_SYMBOL"
      | "INVALID_TIMEZONE"
      | "FORMULA_NOT_FOUND"
      | "FORMULA_LOOP"
      | "ALPHAVANTAGE_INVALID_KEY"
      | "ALPHAVANTAGE_EXCEED_RATE_LIMIT";
  }
}

// const PRESERVED_SYMBOLS: string[] = [
//   "+",
//   "-",
//   ">",
//   "|",
//   "*",
//   "!",
//   "$",
//   "@",
//   "/",
//   ";",
// ];
const DIRECTIVES: string[] = [
  "open",
  "close",
  "comment",
  "commodity",
  "formula",
  "option",
  "event",
  "note",
  "price",
  "snap",
  "pad",
  "balance",
  "transaction",
  "set", // set accountMaps
];
const DIRECTIVE_SHORTCUTS: Record<string, string> = {
  "//": "comment",
  ";": "comment",
  $: "snap",
  f: "formula",
  "!": "transaction",
  "*": "transaction",
};
const DATE_SHORTCUTS: Record<string, number> = {
  dby: -2,
  ytd: -1,
  yesterday: -1,
  tmr: 1,
  tomorrow: 1,
  dat: 2,
};

const parser = async (
  input: string,
  config: UserConfig,
  mode?: "json" | "beancount",
  _isFromFormula?: boolean | undefined
): Promise<any> => {
  /*
   * 0. Preparation
   */
  // todo: invalid flowSymbol check?
  // todo: invalid pipeSymbol check?
  // todo: invalid timezone check?

  config = Object.assign(
    {
      currency: "USD",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      flowSymbol: ">",
      pipeSymbol: "|",
      accountMap: {},
      formula: {},
    },
    config
  );
  mode = mode || "json";

  let _numbersInInput: number[] = [];
  let _doubleQuotedIndexInInput: number[] = [];

  let _plusSymbolIndex: number[] = [];
  let _flowSymbolIndex: number[] = [];
  let _pipeSymbolIndex: number[] = [];

  const _inputArr = input
    .trim()
    .split(" ")
    .filter((item) => item.length > 0);

  _inputArr.forEach((item, index) => {
    if (isNumber(item)) {
      _numbersInInput.push(convertToNumber(item));
    }
    if (item === "+") {
      _plusSymbolIndex.push(index);
    }
    if (item === config.flowSymbol) {
      _flowSymbolIndex.push(index);
    }

    if (item === config.pipeSymbol) {
      _pipeSymbolIndex.push(index);
    }

    if (item[0] === '"') {
      _doubleQuotedIndexInInput.push(index);
    }
    if (item.length > 1 && item[item.length - 1] === '"') {
      _doubleQuotedIndexInInput.push(index);
    }
  });

  const _now = () => nowWithTimezone(config.timezone);

  // index of _inputArr
  let _index = 0;

  let _word = (offset?: number): string => {
    return _inputArr[_index + (offset || 0)];
  };

  // result
  const result: any = {
    created_at: _now().toISOString(),
    timezone: config.timezone,
  };

  /*
   * 1. Parse Date
   */

  if (typeof DATE_SHORTCUTS[_word().toLowerCase()] === "number") {
    result.date = _now()
      .add(DATE_SHORTCUTS[_word().toLowerCase()], "day")
      .format("YYYY-MM-DD");
  } else if (isDate(_word())) {
    result.date = convertToYMD(_word());
  } else if (isDate(`${_word()} ${_word(1)}`)) {
    // for date format like Jul 2 or October 30
    result.date = convertToYMD(`${_word()} ${_word(1)} ${_now().year()}`);
    _index++;
  } else {
    result.date = _now().format("YYYY-MM-DD");
    _index--;
  }
  _index++;

  /*
   * 2. Parse Directive
   */

  if (DIRECTIVE_SHORTCUTS[_word()]) {
    result.directive = DIRECTIVE_SHORTCUTS[_word()];
    result.shortcut = _word();
    if (_word() === "*" || _word() === "!") {
      result.completed = _word() === "*";
    }
  } else if (DIRECTIVES.includes(_word())) {
    result.directive = _word();
  } else if (config?.formula && config?.formula[_word()]) {
    result.directive = "formula";
    _index--;
  } else {
    if (_numbersInInput.length) {
      result.directive = "transaction";
    } else {
      result.directive = "comment";
    }
    _index--;
  }
  _index++;

  /*
   * 2.1 Parse [formula] directive
   */
  if (result.directive === "formula") {
    if (!config || !config.formula || !config.formula[_word()]) {
      return Error("FORMULA_NOT_FOUND");
    }
    if (_isFromFormula) {
      return Error("FORMULA_LOOP");
    }

    const compiled = compileFormula(config.formula[_word()], {
      pre: _inputArr.slice(_index).join(" "),
      amount: _numbersInInput.length ? _numbersInInput[0] : "",
    });
    if (typeof compiled === "string") {
      return parser(compiled, config, mode, true);
    } else {
      return Error("FORMULA?");
    }
  }

  /*
   * 2.2 Parse [comment/open/close/commodity] directives
   */
  if (
    result.directive === "comment" ||
    result.directive === "open" ||
    result.directive === "close" ||
    result.directive === "commodity"
  ) {
    result.data = _inputArr.slice(_index).join(" "); // string
  }

  /*
   * 2.3 Parse [option/event/note] directives
   */
  if (
    result.directive === "option" ||
    result.directive === "event" ||
    result.directive === "note" ||
    result.directive === "pad"
  ) {
    if (_doubleQuotedIndexInInput.length) {
      result.data = {};

      const _tmpIndex = _doubleQuotedIndexInInput[0];
      const key = serialize(
        _inputArr.slice(_tmpIndex, _doubleQuotedIndexInInput[1]),
        config.accountMap
      );
      const val = serialize(_inputArr.slice(_index + 2), config.accountMap);

      result.data = Object.assign(result.data, {
        [key]: val,
      });
    } else {
      const key = serialize([_word()], config.accountMap);
      const val = serialize(_inputArr.slice(_index + 1), config.accountMap);
      result.data = {
        [key]: val, // Record<string, string>
      };
    }
  }

  /*
   * 2.4 Parse [snap, price] directives
   */

  if (result.directive === "snap" || result.directive === "price") {
    const _data: any = {};
    if (_numbersInInput.length) {
      if (result.directive === "price") {
        _data.rate = _numbersInInput[_numbersInInput.length - 1];
      } else {
        _data.amount = _numbersInInput[_numbersInInput.length - 1];
        _index++;
      }
    }
    const _currencies = _inputArr.filter((word) => isCurrency(word));
    if (!_currencies.length) {
      // quote
      const remote = await quote(config?.alphavantage, _word());
      _data.rate = remote.price;
      _data.from = _word().toUpperCase();
      _data.to = "USD"; // Only stocks listed on US markets are supported at the moment
      _data.api = true;
      _data.change = remote.change;
      _data.percent = remote.percent;
    } else {
      _data.from = _currencies[0];
      _data.to = _currencies[1] || config.currency;
    }

    if (typeof _data.rate === "undefined") {
      // fetch from AlphaVantage API
      const remote = await exchange(config?.alphavantage, _data.from, _data.to);
      _data.rate = remote.rate;
      _data.api = true;
    }

    result.data = _data;
  }

  /*
   * 2.5 Parse [balance] directive
   */
  if (result.directive === "balance") {
    const { account, amount, currency } = parseTransaction(
      _inputArr.slice(_index),
      config.accountMap
    );
    result.data = [
      {
        account,
        amount,
        currency: currency || config.currency,
      },
    ]; // AccountAmountCurrency[]
  }

  /*
   * 2.6 Parse [transaction] directive
   */

  if (result.directive === "transaction") {
    if (_flowSymbolIndex.length > 0 && _pipeSymbolIndex.length > 0) {
      return Error("TRANSACTION_SYMBOL_MIXED");
    } else if (_flowSymbolIndex.length > 1) {
      return Error("TRANSACTION_FLOW_SYMBOL_ERROR");
    }

    result.data = [];
    result.tags = config.tag
      ? config.tag.split(" ").map((word) => word.replace(/#/g, ""))
      : [];
    result.links = config.link
      ? config.link.split(" ").map((word) => word.replace(/\^/g, ""))
      : [];

    if (_flowSymbolIndex.length > 0) {
      const data: any = [];
      const _flowSliceIndex = _.sortBy(
        _.uniq(_flowSymbolIndex.concat([_index]).concat(_plusSymbolIndex))
      );

      let _leftAmount = 0;
      let _rightAmount = 0;
      const _flowIndex = _flowSymbolIndex[0];

      for (let f = 0; f < _flowSliceIndex.length; f++) {
        const parseResult = parseTransaction(
          _inputArr.slice(_flowSliceIndex[f], _flowSliceIndex[f + 1]),
          config.accountMap,
          config.flowSymbol
        );
        const {
          account,
          currency,
          narration,
          payee,
          tags,
          links,
        } = parseResult;
        let { amount } = parseResult;

        if (_flowSliceIndex[f] < _flowIndex) {
          amount = amount && amount > 0 ? 0 - amount : amount;
          _leftAmount += amount || 0;
        } else {
          if (amount) {
            _rightAmount += amount;
          } else {
            amount =
              (_rightAmount - _leftAmount) / (_flowSliceIndex.length - f);
            _rightAmount -= amount;
          }
        }
        data.push({
          account,
          amount,
          currency: currency || config.currency,
        });
        result.data = data; // AccountAmountCurrency[]
        result.payee = result.payee || payee;
        result.narration = result.narration || narration;
        result.tags = result.tags.concat(tags);
        result.links = result.links.concat(links);
      }
    }

    if (_pipeSymbolIndex.length > 0) {
      const data: any = [];
      const _pipeSliceIndex = _.sortBy(
        _.uniq(_pipeSymbolIndex.concat([_index]))
      );

      for (let f = 0; f < _pipeSliceIndex.length; f++) {
        const parseResult = parseTransaction(
          _inputArr.slice(_pipeSliceIndex[f], _pipeSliceIndex[f + 1]),
          config.accountMap,
          config.pipeSymbol
        );
        const {
          account,
          currency,
          narration,
          payee,
          tags,
          links,
        } = parseResult;
        let { amount } = parseResult;

        data.push({
          account,
          amount,
          currency: currency || config.currency,
        });
        result.data = data; // AccountAmountCurrency[]
        result.payee = result.payee || payee;
        result.narration = result.narration || narration;
        result.tags = result.tags.concat(tags);
        result.links = result.links.concat(links);
      }
    }
  }

  /*
   * Generate string output for Beancount
   */

  /*
   * Return
   */
  return result;
};
