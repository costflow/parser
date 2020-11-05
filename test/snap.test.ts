import costflow from "../lib";
import * as alphavantage from "../src/alphavantage";
import { expectToBeNotError, testConfig, today } from "./common";

/*
 * $ Snap
 * Note: Tests might fail due to the API rate limit. https://www.alphavantage.co/support/
 */

test("Snap #1", async () => {
  const exchange = await alphavantage.exchange(
    testConfig.alphavantage,
    "CAD",
    "USD"
  );
  const res = await costflow.parse("$ CAD", testConfig);
  expectToBeNotError(res);

  expect(res.date).toBe(today.format("YYYY-MM-DD"));
  expect(res.directive).toBe("snap");
  expect(res.shortcut).toBe("$");
  expect(res.data).toEqual({
    from: "CAD",
    to: "USD",
    rate: exchange.rate,
    api: true,
  });
});

test("Snap #2", async () => {
  const exchange = await alphavantage.exchange(
    testConfig.alphavantage,
    "USD",
    "CNY"
  );
  const res = await costflow.parse("$ 100 USD to CNY", testConfig);
  expectToBeNotError(res);

  expect(res.date).toBe(today.format("YYYY-MM-DD"));
  expect(res.directive).toBe("snap");
  expect(res.shortcut).toBe("$");
  expect(res.data).toEqual({
    from: "USD",
    to: "CNY",
    amount: 100,
    rate: exchange.rate,
    api: true,
  });
});

test("Snap #3", async () => {
  const quote = await alphavantage.quote(testConfig.alphavantage, "AAPL");
  const res = await costflow.parse("$ 200 AAPL", testConfig);
  expectToBeNotError(res);

  expect(res.date).toBe(today.format("YYYY-MM-DD"));
  expect(res.directive).toBe("snap");
  expect(res.shortcut).toBe("$");
  expect(res.data).toEqual({
    from: "AAPL",
    to: "USD",
    amount: 200,
    rate: quote.price,
    percent: quote.percent,
    change: quote.change,
    api: true,
  });
});
