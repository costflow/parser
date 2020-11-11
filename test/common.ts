import dayjs from "dayjs";
import utc from "dayjs/plugin/utc"; // dependent on utc plugin
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

import { ParseResult, NParseResult, UserConfig } from "../lib/interface";

export const testConfig: UserConfig = {
  mode: "json",
  currency: "USD" as const,
  timezone: "America/Los_Angeles",
  tag: "#costflow",
  account: {
    alice: "Assets:Receivables:Alice",
    bob: "Assets:Receivables:Bob",
    bofa: "Assets:BofA",
    coffee: "Expenses:Coffee",
    eob: "Equity:Opening-Balances",
    food: "Expenses:Food",
    phone: "Expenses:Phone",
    rent: "Expenses:Rent",
    visa: "Liabilities:Visa",
  },
  formula: {
    btv: "{{ pre }} bofa > visa",
    "☕️": "@Leplay's ☕️ {{ amount }} visa > coffee",
    loop: "loop",
    spotify: "@Spotify #music 15.98 USD visa > Expenses:Music",
    tb: "tmr balance {{pre}}",
    uber: "@Uber {{ amount }} USD #uber Liabilities:Visa > Expenses:Transport",
  },
  defaultAccount: "Assets:BofA",
  upperCaseAsCurrencyCode: true,
  alphavantage: "OFHZ0NT7D1Y2ZBRT", // https://www.alphavantage.co/support/
  indent: 2,
  lineLength: 60,
};

export const today = dayjs().tz(testConfig.timezone);

export function expectToBeNotError(
  data: ParseResult
): asserts data is NParseResult.Result {
  expect((data as NParseResult.Error).error).toBe(undefined);
}
