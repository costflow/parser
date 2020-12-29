import costflow from "..";
import { expectToBeError, testConfig } from "./common";
import * as alphavantage from "../src/alphavantage";
import { NAlphaVantage } from "../src/interface";

test("Error #1: Price", async () => {
  const tmpConfig = Object.assign({}, testConfig);
  delete tmpConfig.alphavantage;
  const res = await costflow.parse("price AAPL", tmpConfig);
  expectToBeError(res);
  expect(res.error).toBe("ALPHAVANTAGE_INVALID_KEY");
});

test("Error #2: Snap", async () => {
  const tmpConfig = Object.assign({}, testConfig);
  delete tmpConfig.alphavantage;
  const res = await costflow.parse("$ AAPL", tmpConfig);
  expectToBeError(res);
  expect(res.error).toBe("ALPHAVANTAGE_INVALID_KEY");
});

test("Error #3: Multiple flowSymbol", async () => {
  const tmpConfig = Object.assign({}, testConfig);
  delete tmpConfig.alphavantage;
  const res = await costflow.parse(
    "@Verizon 59.61 Assets:BofA > Expenses:Phone > Assets:BofA",
    tmpConfig
  );
  expectToBeError(res);
  expect(res.error).toBe("TRANSACTION_FLOW_SYMBOL_TOO_MANY");
});

test("Error #4: flowSymbol and pipeSymbol both exist", async () => {
  const tmpConfig = Object.assign({}, testConfig);
  delete tmpConfig.alphavantage;
  const res = await costflow.parse(
    "@Verizon 59.61 Assets:BofA > 20 Expenses:Phone | 39.61 Assets:BofB",
    tmpConfig
  );
  expectToBeError(res);
  expect(res.error).toBe("TRANSACTION_SYMBOL_MIXED");
});

test("Error #5: Alpha Vantage rate limit", async () => {
  await alphavantage.exchange(testConfig.alphavantage, "USD", "CNY");
  await alphavantage.exchange(testConfig.alphavantage, "USD", "CNY");
  await alphavantage.exchange(testConfig.alphavantage, "USD", "CNY");
  await alphavantage.exchange(testConfig.alphavantage, "USD", "CNY");
  await alphavantage.exchange(testConfig.alphavantage, "USD", "CNY");
  await alphavantage.exchange(testConfig.alphavantage, "USD", "CNY");
  await alphavantage.exchange(testConfig.alphavantage, "USD", "CNY");

  const res = (await costflow.parse(
    "$ 200 AAPL",
    testConfig
  )) as NAlphaVantage.AlphaVantageError;
  expectToBeError(res);
  expect(res.error).toBe("ALPHAVANTAGE_EXCEED_RATE_LIMIT");
}, 30000);

test("Error #6: Formula not exist", async () => {
  const res = await costflow.parse("f notExistFormula", testConfig);
  expectToBeError(res);
  expect(res.error).toBe("FORMULA_NOT_FOUND");
});

test("Error #7: Formula loop", async () => {
  const res = await costflow.parse("f loop", testConfig);
  expectToBeError(res);
  expect(res.error).toBe("FORMULA_LOOP");
});
