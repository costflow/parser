import test from "ava";
import _ from "lodash";
import dayjs from "dayjs";
import costflow from "../src/main.mjs";
import { testConfig, today } from "./common.mjs";

/*
 * Beancount format
 */
const beancountConfig = Object.assign(_.cloneDeep(testConfig), {
  mode: "beancount",
});

test("Beancount #1", async (t) => {
  const res = await costflow("; Hello New Costflow Parser", beancountConfig);
  t.is(res.error, undefined);
  t.is(res.output, "; Hello New Costflow Parser");
});

test("Beancount #2", async (t) => {
  // You can use res.shortcut to detect comment type
  const res = await costflow("// Hello New Costflow Parser", beancountConfig);
  t.is(res.error, undefined);
  t.is(res.output, "; Hello New Costflow Parser");
});

test("Beancount #3", async (t) => {
  const res = await costflow(
    "2017-01-01 open Assets:US:BofA:Checking",
    beancountConfig
  );
  t.is(res.error, undefined);
  t.is(res.output, "2017-01-01 open Assets:US:BofA:Checking");
});

test("Beancount #4", async (t) => {
  const res = await costflow("close Assets:CN:CMB", beancountConfig);
  t.is(res.error, undefined);
  t.is(res.directive, "close");
  t.is(res.output, `${today.format("YYYY-MM-DD")} close Assets:CN:CMB`);
});

test("Beancount #5", async (t) => {
  const res = await costflow("commodity BTC", beancountConfig);
  t.is(res.error, undefined);
  t.is(res.directive, "commodity");
  t.is(res.output, `${today.format("YYYY-MM-DD")} commodity BTC`);
});

test("Beancount #6", async (t) => {
  const res = await costflow(
    "option title HELLO NEW COSTFLOW PARSER",
    beancountConfig
  );
  t.is(res.error, undefined);
  t.is(res.directive, "option");
  t.is(
    res.output,
    `${today.format("YYYY-MM-DD")} option "title" "HELLO NEW COSTFLOW PARSER"`
  );
});

test("Beancount #7", async (t) => {
  const res = await costflow("note bofa Renew", beancountConfig);
  t.is(res.error, undefined);
  t.is(res.directive, "note");
  t.is(res.output, `${today.format("YYYY-MM-DD")} note "Assets:BofA" "Renew"`);
});

test("Beancount #8", async (t) => {
  const res = await costflow(`event "location" "Yokohama"`, beancountConfig);
  t.is(res.error, undefined);
  t.is(res.directive, "event");
  t.is(res.output, `${today.format("YYYY-MM-DD")} event "location" "Yokohama"`);
});

test("Beancount #9", async (t) => {
  const res = await costflow(`pad bofa eob`, beancountConfig);
  t.is(res.error, undefined);
  t.is(res.directive, "pad");
  t.is(
    res.output,
    `${today.format("YYYY-MM-DD")} pad Assets:BofA Equity:Opening-Balances`
  );
});

test("Beancount #10", async (t) => {
  const res = await costflow(`balance bofa -1200 USD`, beancountConfig);
  t.is(res.error, undefined);
  t.is(res.directive, "balance");
  t.is(
    res.output,
    `${today.format("YYYY-MM-DD")} balance Assets:BofA -1200 USD`
  );
});

test("Beancount #11", async (t) => {
  const res = await costflow(`price USD 6.64 CNY`, beancountConfig);
  t.is(res.error, undefined);
  t.is(res.directive, "price");
  t.is(res.output, `${today.format("YYYY-MM-DD")} price USD 6.64 CNY`);
});

test("Beancount #12", async (t) => {
  const res = await costflow(`f spotify`, beancountConfig);
  t.is(res.error, undefined);
  t.is(res.directive, "transaction");
  t.is(
    res.output,
    `${today.format("YYYY-MM-DD")} * "Spotify" "" #costflow #music
  Liabilities:Visa                                -15.98 USD
  Expenses:Music                                  +15.98 USD`
  );
});

test("Beancount #13", async (t) => {
  const res = await costflow(`uber 6.6`, beancountConfig);
  t.is(res.error, undefined);
  t.is(res.directive, "transaction");
  t.is(
    res.output,
    `${today.format("YYYY-MM-DD")} * "Uber" "" #costflow #uber
  Liabilities:Visa                                 -6.60 USD
  Expenses:Transport                               +6.60 USD`
  );
});

test("Beancount #14", async (t) => {
  const res = await costflow(
    `2017-01-05 "RiverBank Properties" "Paying the rent" 2400 Assets:US:BofA:Checking > 2400  Expenses:Home:Rent`,
    beancountConfig
  );
  t.is(res.error, undefined);
  t.is(res.directive, "transaction");
  t.is(
    res.output,
    `2017-01-05 * "RiverBank Properties" "Paying the rent" #costflow
  Assets:US:BofA:Checking                       -2400.00 USD
  Expenses:Home:Rent                            +2400.00 USD`
  );
});

test("Beancount #15", async (t) => {
  const res = await costflow(
    `Rent ^rent 750 bofa + 750 visa > rent`,
    beancountConfig
  );
  t.is(res.error, undefined);
  t.is(res.directive, "transaction");
  t.is(
    res.output,
    `${today.format("YYYY-MM-DD")} * "" "Rent" #costflow ^rent
  Assets:BofA                                    -750.00 USD
  Liabilities:Visa                               -750.00 USD
  Expenses:Rent                                 +1500.00 USD`
  );
});

test("Beancount #16", async (t) => {
  const res = await costflow(
    `! Sushi 7200 JPY bofa > food + alice + bob`,
    beancountConfig
  );
  t.is(res.error, undefined);
  t.is(res.directive, "transaction");
  t.is(
    res.output,
    `${today.format("YYYY-MM-DD")} ! "" "Sushi" #costflow
  Assets:BofA                                   -7200.00 JPY
  Expenses:Food                                 +2400.00 JPY
  Assets:Receivables:Alice                      +2400.00 JPY
  Assets:Receivables:Bob                        +2400.00 JPY`
  );
});

test("Beancount #17", async (t) => {
  const res = await costflow(
    "! Sushi bofa -7200 JPY | food 2400 JPY | alice 2400 JPY | bob 2400 JPY",
    beancountConfig
  );
  t.is(res.error, undefined);
  t.is(res.directive, "transaction");
  t.is(
    res.output,
    `${today.format("YYYY-MM-DD")} ! "" "Sushi" #costflow
  Assets:BofA                                   -7200.00 JPY
  Expenses:Food                                 +2400.00 JPY
  Assets:Receivables:Alice                      +2400.00 JPY
  Assets:Receivables:Bob                        +2400.00 JPY`
  );
});

test("Beancount #18", async (t) => {
  const res = await costflow(
    "@麦当劳 #food #mc visa -180 CNY / food 180 CNY",
    Object.assign(beancountConfig, { pipeSymbol: "/" })
  );
  t.is(res.error, undefined);
  t.is(res.directive, "transaction");
  t.is(
    res.output,
    `${today.format("YYYY-MM-DD")} * "麦当劳" "" #costflow #food #mc
  Liabilities:Visa                               -180.00 CNY
  Expenses:Food                                  +180.00 CNY`
  );
});

test("Beancount #19", async (t) => {
  const res = await costflow(
    "@麦当劳 #food #mc visa -180 CNY to food 180 CNY",
    beancountConfig,
    { flowSymbol: "to" }
  );
  t.is(res.error, undefined);
  t.is(res.directive, "transaction");
  t.is(
    res.output,
    `${today.format("YYYY-MM-DD")} * "麦当劳" "" #costflow #food #mc
  Liabilities:Visa                               -180.00 CNY
  Expenses:Food                                  +180.00 CNY`
  );
});

test("Beancount #20", async (t) => {
  const now = dayjs().tz(beancountConfig.timezone);
  const res = await costflow(
    "@麦当劳 #food #mc visa -180 CNY > food 180 CNY",
    beancountConfig,
    { insertTime: "metadata" },
    { created_at: now.toISOString() }
  );
  t.is(res.error, undefined);
  t.is(res.directive, "transaction");
  t.is(
    res.output,
    `${today.format("YYYY-MM-DD")} * "麦当劳" "" #costflow #food #mc
  time: "${now.format("HH:mm:ss")}"
  Liabilities:Visa                               -180.00 CNY
  Expenses:Food                                  +180.00 CNY`
  );
});

test("Beancount #21", async (t) => {
  const res = await costflow(
    "@麦当劳 #food #mc visa -180 CNY > food 180 CNY",
    beancountConfig,
    {
      lineLength: 20,
    }
  );
  t.is(res.error, undefined);
  t.is(res.directive, "transaction");
  t.is(
    res.output,
    `${today.format("YYYY-MM-DD")} * "麦当劳" "" #costflow #food #mc
  Liabilities:Visa -180.00 CNY
  Expenses:Food +180.00 CNY`
  );
});
