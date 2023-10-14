import test from "ava";
import costflow from "../src/main.mjs";
import * as alphavantage from "../src/alphavantage.mjs";
import { testConfig, today } from "./common.mjs";

/*
 * $ Snap
 * Note: Tests might fail due to the API rate limit. https://www.alphavantage.co/support/
 */

test.serial("Snap #1", async (t) => {
  const exchange = await alphavantage.exchange(
    testConfig.alphavantage,
    "CAD",
    "USD"
  );
  if ("error" in exchange) {
    t.is(exchange.error, "ALPHAVANTAGE_EXCEED_RATE_LIMIT");
  } else {
    const res = await costflow("$ CAD", testConfig);
    t.is(res.error, undefined);

    t.is(res.date, today.format("YYYY-MM-DD"));
    t.is(res.directive, "snap");
    t.is(res.shortcut, "$");
    t.deepEqual(res.data, {
      from: "CAD",
      to: "USD",
      rate: exchange.rate,
      api: true,
    });
  }
});

test.serial("Snap #2", async (t) => {
  const exchange = await alphavantage.exchange(
    testConfig.alphavantage,
    "USD",
    "CNY"
  );
  if ("error" in exchange) {
    t.is(exchange.error, "ALPHAVANTAGE_EXCEED_RATE_LIMIT");
  } else {
    const res = await costflow("$ 100 USD to CNY", testConfig);
    t.is(res.error, undefined);

    t.is(res.date, today.format("YYYY-MM-DD"));
    t.is(res.directive, "snap");
    t.is(res.shortcut, "$");
    t.deepEqual(res.data, {
      from: "USD",
      to: "CNY",
      amount: 100,
      rate: exchange.rate,
      api: true,
    });
  }
});

test.serial("Snap #3", async (t) => {
  const quote = await alphavantage.quote(testConfig.alphavantage, "AAPL");
  if ("error" in quote) {
    t.is(quote.error, "ALPHAVANTAGE_EXCEED_RATE_LIMIT");
  } else {
    const res = await costflow("$ 200 AAPL", testConfig);
    t.is(res.error, undefined);
    t.is(res.date, today.format("YYYY-MM-DD"));
    t.is(res.directive, "snap");
    t.is(res.shortcut, "$");
    t.deepEqual(res.data, {
      from: "AAPL",
      to: "USD",
      amount: 200,
      rate: quote.price,
      percent: quote.percent,
      change: quote.change,
      api: true,
    });
  }
});
