/*
 * Parse Transaction
 */

import { isNumber, convertToNumber, isAccountName, isCurrency } from "./utils";

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
  account: Record<string, string>,
  symbolToRemove?: string
): TransactionResult => {
  let result: any = {
    tags: [],
    links: [],
  };
  let doubleQuotesCount = 0;

  arr = arr.filter((item) => {
    if (item.indexOf('"') >= 0) {
      doubleQuotesCount++;
    }
    if (isNumber(item)) {
      result.amount = convertToNumber(item);
      return false;
    }
    if (account[item]) {
      result.account = account[item];
      return false;
    }
    if (isAccountName(item)) {
      result.account = item;
      return false;
    }
    if (isCurrency(item)) {
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

  const strLeft = arr.join(" ");
  if (doubleQuotesCount === 4) {
    let tmp = strLeft.split('"');
    tmp = tmp.filter((str) => str.length && str.trim().length);
    result.payee = tmp[0];
    result.narration = tmp[1];
  } else {
    result.narration = strLeft;
  }

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
