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
  accountMap: Record<string, string>,
  symbolToRemove?: string
): TransactionResult => {
  let result: any = {
    tags: [],
    links: [],
  };
  arr = arr.filter((item) => {
    if (isNumber(item)) {
      result.amount = convertToNumber(item);
      return false;
    }
    if (accountMap[item]) {
      result.account = accountMap[item];
      return false;
    }
    if (isAccountName(item)) {
      result.account = item;
      return false;
    }
    if (isCurrency(item)) {
      result.currency = item.toUpperCase();
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
  result.narration = arr.join(" ");

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
