/*
 * Parse Transaction
 */

import { isNumber, convertToNumber, isAccountName, isCurrency } from "./utils";
import { UserConfig } from "./interface";

interface TransactionResult {
  amount: number | null;
  currency: string | null;
  account: string | null;
  tags: string[];
  links: string[];
  payee: string | null;
  narration: string;
}

export const parseTransaction = (
  arr: string[],
  config: UserConfig,
  symbolToRemove?: string
): TransactionResult => {
  let result: any = {
    tags: [],
    links: [],
  };
  let doubleQuotesCount = 0;

  arr = arr.reverse().filter((item) => {
    if (item.indexOf('"') >= 0) {
      doubleQuotesCount++;
    }
    if (isNumber(item)) {
      result.amount = convertToNumber(item);
      return false;
    }
    if (config?.account[item] && !result.account) {
      result.account = config.account[item];
      return false;
    }
    if (isAccountName(item) && !result.account) {
      result.account = item;
      return false;
    }
    if (isCurrency(item, config?.upperCaseAsCurrencyCode || false)) {
      result.currency = item;
      return false;
    }
    if (item.startsWith("@")) {
      result.payee = item.replace(/@/g, "");
      return false;
    }
    if (item.startsWith("#")) {
      result.tags.push(item.replace(/\#/g, ""));
      return false;
    }
    if (item.startsWith("^")) {
      result.links.push(item.replace(/\^/g, ""));
      return false;
    }
    if (item === symbolToRemove) return false;
    return true;
  });

  const strLeft = arr.reverse().join(" ");
  if (doubleQuotesCount === 4) {
    let tmp = strLeft.split('"');
    tmp = tmp.filter((str) => str.length && str.trim().length);
    result.payee = tmp[0];
    result.narration = tmp[1];
  } else {
    if (!result.account && !config?.defaultAccount) {
      result.account = arr[arr.length - 1];
      result.narration = arr.slice(0, arr.length - 1);
    } else {
      result.account = result.account || config?.defaultAccount || null;
      result.narration = strLeft;
    }
  }

  result.tags = result.tags.reverse();
  result.links = result.links.reverse();

  result = Object.assign(
    {
      amount: null,
      currency: null,
      account: null,
      tags: [],
      links: [],
      payee: null,
      narration: "",
    },
    result
  );
  return result;
};
