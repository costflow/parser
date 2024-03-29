/*
  Costflow Syntax: https://www.costflow.io/docs/syntax/
*/
import _ from "lodash";
import {
  isNumber,
  isDate,
  serialize,
  convertToYMD,
  convertToNumber,
  nowWithTimezone,
  isCurrency,
  getItemByInsensitiveKey,
} from "./utils.mjs";
import { compileFormula } from "./formula.mjs";
import { parseTransaction } from "./transaction.mjs";
import * as alphavantage from "./alphavantage.mjs";
import {
  DIRECTIVES,
  DIRECTIVE_SHORTCUTS,
  DATE_SHORTCUTS,
} from "./config/index.mjs";
import { generate } from "./generator.mjs";

export default async function costflow(
  input,
  config,
  overwriteConfig,
  overwriteResult,
  _isFromFormula
) {
  /*
   * 0. Preparation
   */
  // todo: invalid flowSymbol check?
  // todo: invalid pipeSymbol check?
  // todo: invalid timezone check?

  config = Object.assign(
    {
      mode: "json",
      currency: "USD",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      flowSymbol: ">",
      pipeSymbol: "|",
      account: {},
      formula: {},
    },
    config,
    overwriteConfig || {}
  );

  let _numbersInInput = [];
  let _doubleQuotedIndexInInput = [];

  let _plusSymbolIndex = [];
  let _flowSymbolIndex = [];
  let _pipeSymbolIndex = [];

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

  let _word = (offset) => {
    return _inputArr[_index + (offset || 0)];
  };

  // result
  var result = {
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
    result.date = convertToYMD(`${_word()} ${_word(1)}, ${_now().year()}`);
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
  } else if (
    config?.formula &&
    getItemByInsensitiveKey(_word(), config.formula)
  ) {
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
  const formulaMatch = getItemByInsensitiveKey(_word(), config.formula);
  if (result.directive === "formula") {
    if (!config || !config.formula || !formulaMatch) {
      return { error: "FORMULA_NOT_FOUND" };
    }
    if (_isFromFormula) {
      return { error: "FORMULA_LOOP" };
    }

    const compiled = compileFormula(formulaMatch, {
      pre: _inputArr.slice(_index + 1).join(" "),
      amount: _numbersInInput.length ? _numbersInInput[0] : "",
    });
    if (typeof compiled === "string") {
      return costflow(compiled, config, overwriteConfig, overwriteResult, true);
    } else {
      return { error: "FORMULA_COMPILE_ERROR" };
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
      if (_doubleQuotedIndexInInput.length !== 4) {
        return { error: "DOUBLE_QUOTES_SHOULD_BE_FOUR" };
      }
      result.data = {};

      const key = serialize(
        _inputArr.slice(
          _doubleQuotedIndexInInput[0],
          _doubleQuotedIndexInInput[1] + 1
        ),
        config.account
      );
      const val = serialize(
        _inputArr.slice(_doubleQuotedIndexInInput[2]),
        config.account
      );

      result.data = Object.assign(result.data, {
        [key]: val,
      });
    } else {
      const key = serialize([_word()], config.account);
      const val = serialize(_inputArr.slice(_index + 1), config.account);
      result.data = {
        [key]: val, // Record<string, string>
      };
    }
  }

  /*
   * 2.4 Parse [snap, price] directives
   */

  if (result.directive === "snap" || result.directive === "price") {
    const _data = {};
    if (_numbersInInput.length) {
      if (result.directive === "price") {
        _data.rate = _numbersInInput[_numbersInInput.length - 1];
      } else {
        _data.amount = _numbersInInput[_numbersInInput.length - 1];
        _index++;
      }
    }
    const _currencies = _inputArr.filter((word) => isCurrency(word, false));
    if (!_currencies.length) {
      // quote
      const remote = await alphavantage.quote(config?.alphavantage, _word());
      if ("error" in remote) {
        return remote;
      }
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
      const remote = await alphavantage.exchange(
        config?.alphavantage,
        _data.from,
        _data.to
      );
      if ("error" in remote) {
        return remote;
      }
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
      config
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
      return { error: "TRANSACTION_SYMBOL_MIXED" };
    } else if (_flowSymbolIndex.length > 1) {
      return { error: "TRANSACTION_FLOW_SYMBOL_TOO_MANY" };
    }

    result.data = [];
    result.completed =
      typeof result.completed === "boolean" ? result.completed : true;

    result.tags = config.tag
      ? config.tag.split(" ").map((word) => word.replace(/#/g, ""))
      : [];
    result.links = config.link
      ? config.link.split(" ").map((word) => word.replace(/\^/g, ""))
      : [];

    if (_flowSymbolIndex.length > 0) {
      const data = [];
      const _flowSliceIndex = _.sortBy(
        _.uniq(_flowSymbolIndex.concat([_index]).concat(_plusSymbolIndex))
      );

      let _leftAmount = 0;
      let _rightAmount = 0;
      let _leftCurrency;
      const _flowIndex = _flowSymbolIndex[0];

      for (let f = 0; f < _flowSliceIndex.length; f++) {
        const parseResult = parseTransaction(
          _inputArr.slice(_flowSliceIndex[f], _flowSliceIndex[f + 1]),
          config,
          config.flowSymbol
        );
        const { account, narration, payee, tags, links } = parseResult;
        let { amount, currency } = parseResult;

        if (_flowSliceIndex[f] < _flowIndex) {
          amount = amount && amount > 0 ? 0 - amount : amount;
          _leftAmount += Math.abs(amount || 0);
          _leftCurrency = currency;
        } else {
          if (amount) {
            _rightAmount += amount;
          } else {
            amount =
              (_leftAmount - _rightAmount) / (_flowSliceIndex.length - f);
            _rightAmount += amount;
          }
          if (!currency) {
            currency = _leftCurrency || config.currency;
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
      const data = [];
      const _pipeSliceIndex = _.sortBy(
        _.uniq(_pipeSymbolIndex.concat([_index]))
      );

      for (let f = 0; f < _pipeSliceIndex.length; f++) {
        const parseResult = parseTransaction(
          _inputArr.slice(_pipeSliceIndex[f], _pipeSliceIndex[f + 1]),
          config,
          config.pipeSymbol
        );
        const { account, currency, narration, payee, tags, links } =
          parseResult;
        let { amount } = parseResult;

        data.push({
          account,
          amount,
          currency: currency || config.currency,
        });
        result.data = data; // AccountAmountCurrency[]
        result.payee = result.payee || payee;
        result.narration = result.narration || narration;
        result.tags = _.uniq(result.tags.concat(tags));
        result.links = _.uniq(result.links.concat(links));
      }
    }

    if (!_flowSymbolIndex.length && !_pipeSymbolIndex.length) {
      const parseResult = parseTransaction(_inputArr.slice(_index), config);
      const data = [];
      const { account, currency, narration, payee, tags, links } = parseResult;
      let { amount } = parseResult;

      data.push({
        account,
        amount,
        currency: currency || config.currency,
      });
      result.data = data; // AccountAmountCurrency[]
      result.payee = result.payee || payee;
      result.narration = result.narration || narration;
      result.tags = _.uniq(result.tags.concat(tags));
      result.links = _.uniq(result.links.concat(links));
    }
  }

  /*
   * Overwrite parse result if necessary
   */

  result = Object.assign(result, overwriteResult || {});

  /*
   * Generate string output for Beancount, etc
   */

  if (config.mode !== "json") {
    const str = generate(result, config.mode, config);
    if (typeof str !== "string") {
      return str;
    } else {
      result.output = str;
    }
  }
  return result;
}
