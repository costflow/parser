import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js"; // dependent on utc plugin
import timezone from "dayjs/plugin/timezone.js";
dayjs.extend(utc);
dayjs.extend(timezone);

export const testConfig = {
  mode: "json",
  currency: "USD",
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
