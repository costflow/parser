import costflow from "..";
import { expectToBeNotError, testConfig, today } from "./common";

/*
 * Beancount format
 */
const beancountConfig = Object.assign(testConfig, {
  mode: "beancount",
});

test("Beancount #1", async () => {
  const res = await costflow.parse(
    "; Hello New Costflow Parser",
    beancountConfig
  );
  expectToBeNotError(res);
  expect(res.output).toBe("; Hello New Costflow Parser");
});

test("Beancount #2", async () => {
  // You can use res.shortcut to detect comment type
  const res = await costflow.parse(
    "// Hello New Costflow Parser",
    beancountConfig
  );
  expectToBeNotError(res);
  expect(res.output).toBe("; Hello New Costflow Parser");
});

test("Beancount #3", async () => {
  const res = await costflow.parse(
    "2017-01-01 open Assets:US:BofA:Checking",
    beancountConfig
  );
  expectToBeNotError(res);
  expect(res.output).toBe("2017-01-01 open Assets:US:BofA:Checking");
});
test("Beancount #4", async () => {
  const res = await costflow.parse("close Assets:CN:CMB", testConfig);
  expectToBeNotError(res);
  expect(res.directive).toBe("close");
  expect(res.output).toBe(`${today.format("YYYY-MM-DD")} close Assets:CN:CMB`);
});
test("Beancount #5", async () => {
  const res = await costflow.parse("commodity BTC", testConfig);
  expectToBeNotError(res);
  expect(res.directive).toBe("commodity");
  expect(res.output).toBe(`${today.format("YYYY-MM-DD")} commodity BTC`);
});
test("Beancount #6", async () => {
  const res = await costflow.parse(
    "option title HELLO NEW COSTFLOW PARSER",
    testConfig
  );
  expectToBeNotError(res);
  expect(res.directive).toBe("option");
  expect(res.output).toBe(
    `${today.format("YYYY-MM-DD")} option "title" "HELLO NEW COSTFLOW PARSER"`
  );
});
test("Beancount #7", async () => {
  const res = await costflow.parse("note bofa Renew", testConfig);
  expectToBeNotError(res);
  expect(res.directive).toBe("note");
  expect(res.output).toBe(
    `${today.format("YYYY-MM-DD")} note "Assets:BofA" "Renew"`
  );
});
test("Beancount #8", async () => {
  const res = await costflow.parse(`event "location" "Yokohama"`, testConfig);
  expectToBeNotError(res);
  expect(res.directive).toBe("event");
  expect(res.output).toBe(
    `${today.format("YYYY-MM-DD")} event "location" "Yokohama"`
  );
});
test("Beancount #9", async () => {
  const res = await costflow.parse(`pad bofa eob`, testConfig);
  expectToBeNotError(res);
  expect(res.directive).toBe("pad");
  expect(res.output).toBe(
    `${today.format("YYYY-MM-DD")} pad Assets:BofA Equity:Opening-Balances`
  );
});
test("Beancount #10", async () => {
  const res = await costflow.parse(`balance bofa -1200 USD`, testConfig);
  expectToBeNotError(res);
  expect(res.directive).toBe("balance");
  expect(res.output).toBe(
    `${today.format("YYYY-MM-DD")} balance Assets:BofA -1200 USD`
  );
});
test("Beancount #11", async () => {
  const res = await costflow.parse(`price USD 6.64 CNY`, testConfig);
  expectToBeNotError(res);
  expect(res.directive).toBe("price");
  expect(res.output).toBe(`${today.format("YYYY-MM-DD")} price USD 6.64 CNY`);
});
test("Beancount #12", async () => {
  const res = await costflow.parse(`f spotify`, testConfig);
  expectToBeNotError(res);
  expect(res.directive).toBe("transaction");
  expect(res.output).toBe(`${today.format(
    "YYYY-MM-DD"
  )} * "Spotify" "" #costflow #music
  Liabilities:Visa                                -15.98 USD
  Expenses:Music                                  +15.98 USD`);
});
test("Beancount #13", async () => {
  const res = await costflow.parse(`uber 6.6`, testConfig);
  expectToBeNotError(res);
  expect(res.directive).toBe("transaction");
  expect(res.output).toBe(`${today.format(
    "YYYY-MM-DD"
  )} * "Uber" "" #costflow #uber
  Liabilities:Visa                                 -6.60 USD
  Expenses:Transport                               +6.60 USD`);
});
test("Beancount #14", async () => {
  const res = await costflow.parse(
    `2017-01-05 "RiverBank Properties" "Paying the rent" 2400 Assets:US:BofA:Checking > 2400  Expenses:Home:Rent`,
    testConfig
  );
  expectToBeNotError(res);
  expect(res.directive).toBe("transaction");
  expect(res.output)
    .toBe(`2017-01-05 * "RiverBank Properties" "Paying the rent" #costflow
  Assets:US:BofA:Checking                       -2400.00 USD
  Expenses:Home:Rent                            +2400.00 USD`);
});
test("Beancount #15", async () => {
  const res = await costflow.parse(
    `Rent ^rent 750 bofa + 750 visa > rent`,
    testConfig
  );
  expectToBeNotError(res);
  expect(res.directive).toBe("transaction");
  expect(res.output).toBe(`${today.format(
    "YYYY-MM-DD"
  )} * "" "Rent" #costflow ^rent
  Assets:BofA                                    -750.00 USD
  Liabilities:Visa                               -750.00 USD
  Expenses:Rent                                 +1500.00 USD`);
});
test("Beancount #16", async () => {
  const res = await costflow.parse(
    `! Sushi 7200 JPY bofa > food + alice + bob`,
    testConfig
  );
  expectToBeNotError(res);
  expect(res.directive).toBe("transaction");
  expect(res.output).toBe(`${today.format("YYYY-MM-DD")} ! "" "Sushi" #costflow
  Assets:BofA                                   -7200.00 JPY
  Expenses:Food                                 +2400.00 JPY
  Assets:Receivables:Alice                      +2400.00 JPY
  Assets:Receivables:Bob                        +2400.00 JPY`);
});
test("Beancount #17", async () => {
  const res = await costflow.parse(
    "! Sushi bofa -7200 JPY | food 2400 JPY | alice 2400 JPY | bob 2400 JPY",
    testConfig
  );
  expectToBeNotError(res);
  expect(res.directive).toBe("transaction");
  expect(res.output).toBe(`${today.format("YYYY-MM-DD")} ! "" "Sushi" #costflow
  Assets:BofA                                   -7200.00 JPY
  Expenses:Food                                 +2400.00 JPY
  Assets:Receivables:Alice                      +2400.00 JPY
  Assets:Receivables:Bob                        +2400.00 JPY`);
});
test("Beancount #18", async () => {
  const res = await costflow.parse(
    "@麦当劳 #food #mc visa -180 CNY / food 180 CNY",
    Object.assign(testConfig, { pipeSymbol: "/" })
  );
  expectToBeNotError(res);
  expect(res.directive).toBe("transaction");
  expect(res.output).toBe(`${today.format(
    "YYYY-MM-DD"
  )} * "麦当劳" "" #costflow #food #mc
  Liabilities:Visa                               -180.00 CNY
  Expenses:Food                                  +180.00 CNY`);
});
