import test from "ava";
import costflow from "../src/main.mjs";
import { expectToBeError, testConfig } from "./common.mjs";
import * as alphavantage from "../src/alphavantage";

test("Error #1: Price", async (t) => {
  const tmpConfig = Object.assign({}, testConfig);
  delete tmpConfig.alphavantage;
  const res = await costflow("price AAPL", tmpConfig);
  expectToBeError(res);
  expect(res.error).toBe("ALPHAVANTAGE_INVALID_KEY");
});

test("Error #2: Snap", async (t) => {
  const tmpConfig = Object.assign({}, testConfig);
  delete tmpConfig.alphavantage;
  const res = await costflow("$ AAPL", tmpConfig);
  expectToBeError(res);
  expect(res.error).toBe("ALPHAVANTAGE_INVALID_KEY");
});

test("Error #3: Multiple flowSymbol", async (t) => {
  const tmpConfig = Object.assign({}, testConfig);
  delete tmpConfig.alphavantage;
  const res = await costflow(
    "@Verizon 59.61 Assets:BofA > Expenses:Phone > Assets:BofA",
    tmpConfig
  );
  expectToBeError(res);
  expect(res.error).toBe("TRANSACTION_FLOW_SYMBOL_TOO_MANY");
});

test("Error #4: flowSymbol and pipeSymbol both exist", async (t) => {
  const tmpConfig = Object.assign({}, testConfig);
  delete tmpConfig.alphavantage;
  const res = await costflow(
    "@Verizon 59.61 Assets:BofA > 20 Expenses:Phone | 39.61 Assets:BofB",
    tmpConfig
  );
  expectToBeError(res);
  expect(res.error).toBe("TRANSACTION_SYMBOL_MIXED");
});

test("Error #5: Alpha Vantage rate limit", async (t) => {
  await alphavantage.exchange(testConfig.alphavantage, "USD", "CNY");
  await alphavantage.exchange(testConfig.alphavantage, "USD", "CNY");
  await alphavantage.exchange(testConfig.alphavantage, "USD", "CNY");
  await alphavantage.exchange(testConfig.alphavantage, "USD", "CNY");
  await alphavantage.exchange(testConfig.alphavantage, "USD", "CNY");
  await alphavantage.exchange(testConfig.alphavantage, "USD", "CNY");
  await alphavantage.exchange(testConfig.alphavantage, "USD", "CNY");

  const res = await costflow("$ 200 AAPL", testConfig);
  expectToBeError(res);
  expect(res.error).toBe("ALPHAVANTAGE_EXCEED_RATE_LIMIT");
}, 30000);

test("Error #6: Formula not exist", async (t) => {
  const res = await costflow("f notExistFormula", testConfig);
  expectToBeError(res);
  expect(res.error).toBe("FORMULA_NOT_FOUND");
});

test("Error #7: Formula loop", async (t) => {
  const res = await costflow("f loop", testConfig);
  expectToBeError(res);
  expect(res.error).toBe("FORMULA_LOOP");
});
