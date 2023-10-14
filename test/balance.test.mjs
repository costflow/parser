import test from "ava";
import costflow from "../src/main.mjs";
import { testConfig, today } from "./common.mjs";

/*
 * Balance
 */
test("Balance #1", async (t) => {
  const res = await costflow(
    "2017-01-01 balance Assets:BofA 360 USD",
    testConfig
  );
  t.is(res.error, undefined);
  t.is(res.date, "2017-01-01");
  t.is(res.directive, "balance");
  t.deepEqual(res.data, [
    {
      account: "Assets:BofA",
      amount: 360,
      currency: "USD",
    },
  ]);
});
test("Balance #2", async (t) => {
  const res = await costflow("tmr balance BofA 1024 CNY", testConfig);
  t.is(res.error, undefined);
  t.is(res.date, today.add(1, "d").format("YYYY-MM-DD"));
  t.is(res.directive, "balance");
  t.deepEqual(res.data, [
    {
      account: "Assets:BofA",
      amount: 1024,
      currency: "CNY",
    },
  ]);
});
test("Balance #3: overwriteConfig", async (t) => {
  const res = await costflow("tmr balance BofA 1024", testConfig, {
    currency: "JPY",
  });
  t.is(res.error, undefined);
  t.is(res.date, today.add(1, "d").format("YYYY-MM-DD"));
  t.is(res.directive, "balance");
  t.deepEqual(res.data, [
    {
      account: "Assets:BofA",
      amount: 1024,
      currency: "JPY",
    },
  ]);
});
test("Balance #3: overwriteResult", async (t) => {
  const res = await costflow("tmr balance BofA 1024", testConfig, null, {
    date: "2020-11-11",
  });
  t.is(res.error, undefined);
  t.is(res.date, "2020-11-11");
  t.is(res.directive, "balance");
  t.deepEqual(res.data, [
    {
      account: "Assets:BofA",
      amount: 1024,
      currency: "USD",
    },
  ]);
});
