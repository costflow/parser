import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js"; // dependent on utc plugin
import timezone from "dayjs/plugin/timezone.js";
import { cryptoList } from "./config/crypto-currency-codes.mjs";
import { currencyList } from "./config/currency-codes.mjs";

dayjs.extend(utc);
dayjs.extend(timezone);

/*
 * Number
 */

export const isNumber = (str) => {
  return !isNaN(Number(str));
};

export const convertToNumber = (str) => {
  return Number(str);
};

/*
 * Account
 */
export const isAccountName = (str) => {
  return str.indexOf(":") > 0;
};

/*
 * Currency
 */
export const isCurrency = (str, upperCaseAsCurrencyCode) => {
  const allUpperCaseReg = /^[A-Z]{3,}$/;
  return (
    (upperCaseAsCurrencyCode && allUpperCaseReg.test(str)) ||
    currencyList.includes(str) ||
    cryptoList.includes(str)
  );
};

/*
 * Date
 */
// Note: one regex bug https://stackoverflow.com/questions/3891641/regex-test-only-works-every-other-time
const ymdReg = /^(\d{4})-(\d{2})-(\d{2})$/;
const nameReg =
  /^(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:,\s?\d{4})?$/;

export const nowWithTimezone = (timezone) =>
  timezone ? dayjs().tz(timezone) : dayjs();

export const isDate = (str) => {
  // Supported formats: 2020-11-01 / Jul 2 / October 30 (case insensitive)
  // some bad cases: Jul 33 / October 99 will be recognized as year 2033 or 1999
  return (
    (ymdReg.test(str) || nameReg.test(str)) &&
    new Date(str).toString() !== "Invalid Date"
  );
};

export const convertToYMD = (str) => {
  if (!isDate(str)) {
    return null;
  }

  return ymdReg.test(str) ? str : dayjs(new Date(str)).format("YYYY-MM-DD");
};

/*
 * Serialize
 */
export const serialize = (arr, account) => {
  if (!arr.length || !account) return "";
  arr = arr.map((item) => getItemByInsensitiveKey(item, account) || item);
  return arr.join(" ").replace(/\"/g, "");
};

export const getItemByInsensitiveKey = (searchKey, obj) => {
  if (!obj) return null;
  const originalKey = Object.keys(obj).find(
    (key) => key.toLowerCase() === searchKey.toLowerCase()
  );
  return originalKey ? obj[originalKey] : null;
};
