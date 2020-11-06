import dayjs from "dayjs";
import utc from "dayjs/plugin/utc"; // dependent on utc plugin
import timezone from "dayjs/plugin/timezone";
import { cryptoList } from "./config/crypto-currency-codes";
import { currencyList } from "./config/currency-codes";

dayjs.extend(utc);
dayjs.extend(timezone);

/*
 * Number
 */

export const isNumber = (str: string): boolean => {
  return !isNaN(Number(str));
};

export const convertToNumber = (str: string): number => {
  return Number(str);
};

/*
 * Account
 */
export const isAccountName = (str: string): boolean => {
  return str.indexOf(":") > 0;
};

/*
 * Currency
 */
export const isCurrency = (str: string): boolean => {
  // const allUpperCaseReg = /^[A-Z]{3,}$/g;
  return currencyList.includes(str) || cryptoList.includes(str);
};

/*
 * Date
 */
// Note: one regex bug https://stackoverflow.com/questions/3891641/regex-test-only-works-every-other-time
const ymdReg = /^(\d{4})-(\d{2})-(\d{2})$/;
const nameReg = /^(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:,\s?\d{4})?$/;

export const nowWithTimezone = (timezone: string | undefined) =>
  timezone ? dayjs().tz(timezone) : dayjs();

export const isDate = (str: string): boolean => {
  // Supported formats: 2020-11-01 / Jul 2 / October 30 (case insensitive)
  // some bad cases: Jul 33 / October 99 will be recognized as year 2033 or 1999
  return (
    (ymdReg.test(str) || nameReg.test(str)) &&
    new Date(str).toString() !== "Invalid Date"
  );
};

export const convertToYMD = (str: string): string | null => {
  if (!isDate(str)) {
    return null;
  }

  return ymdReg.test(str) ? str : dayjs(new Date(str)).format("YYYY-MM-DD");
};

/*
 * Serialize
 */
export const serialize = (
  arr: string[],
  account: Record<string, string>
): string => {
  if (!arr.length) return "";
  arr = arr.map((item) => account[item] || item);
  return arr.join(" ").replace(/\"/g, "");
};
