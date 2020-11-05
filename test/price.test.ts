import costflow from "../lib";
import * as alphavantage from "../src/alphavantage";
import { expectToBeNotError, testConfig, today } from "./common";

/*
 * Price
 * Note: Tests might fail due to the API rate limit. https://www.alphavantage.co/support/
 */
test("Price #1", async () => {
  const res = await costflow.parse("2017-01-17 price USD 1.08 CAD", testConfig);
  expectToBeNotError(res);
  expect(res.date).toBe("2017-01-17");
  expect(res.directive).toBe("price");
  expect(res.data).toEqual({
    from: "USD",
    to: "CAD",
    rate: 1.08,
  });
});
test("Price #2", async () => {
  const exchange = await alphavantage.exchange(
    testConfig.alphavantage,
    "USD",
    "CNY"
  );
  const res = await costflow.parse("price USD to CNY", testConfig);
  expectToBeNotError(res);

  expect(res.date).toBe(today.format("YYYY-MM-DD"));
  expect(res.directive).toBe("price");
  expect(res.data).toEqual({
    from: "USD",
    to: "CNY",
    rate: exchange.rate,
    api: true,
  });
});
test("Price #3", async () => {
  const quote = await alphavantage.quote(testConfig.alphavantage, "AAPL");
  const res = await costflow.parse("price AAPL", testConfig);
  expectToBeNotError(res);

  expect(res.date).toBe(today.format("YYYY-MM-DD"));
  expect(res.directive).toBe("price");
  expect(res.data).toEqual({
    from: "AAPL",
    to: "USD",
    rate: quote.price,
    percent: quote.percent,
    change: quote.change,
    api: true,
  });
});
