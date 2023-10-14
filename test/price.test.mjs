import test from "ava";
import costflow from "../src/main.mjs";
import * as alphavantage from "../src/alphavantage.mjs";
import { testConfig, today } from "./common.mjs";

/*
 * Price
 * Note: Tests might fail due to the API rate limit. https://www.alphavantage.co/support/
 */
test.serial("Price #1", async (t) => {
  const res = await costflow("2017-01-17 price USD 1.08 CAD", testConfig);
  t.is(res.error, undefined);
  t.is(res.date, "2017-01-17");
  t.is(res.directive, "price");
  t.deepEqual(res.data, {
    from: "USD",
    to: "CAD",
    rate: 1.08,
  });
});

test.serial("Price #2", async (t) => {
  const exchange = await alphavantage.exchange(
    testConfig.alphavantage,
    "USD",
    "CNY"
  );

  const res = await costflow("price USD to CNY", testConfig);
  t.is(res.date, today.format("YYYY-MM-DD"));
  t.is(res.directive, "price");
  t.deepEqual(res.data, {
    from: "USD",
    to: "CNY",
    rate: exchange.rate,
    api: true,
  });
});

test.serial("Price #3", async (t) => {
  const quote = await alphavantage.quote(testConfig.alphavantage, "AAPL");
  const res = await costflow("price AAPL", testConfig);
  t.is(res.error, undefined);
  t.is(res.date, today.format("YYYY-MM-DD"));
  t.is(res.directive, "price");
  t.deepEqual(res.data, {
    from: "AAPL",
    to: "USD",
    rate: quote.price,
    percent: quote.percent,
    change: quote.change,
    api: true,
  });
});
