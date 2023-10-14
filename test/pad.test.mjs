import test from "ava";
import costflow from "../src/main.mjs";
import { testConfig, today } from "./common.mjs";

/*
 * Pad
 */
test("Pad #1", async (t) => {
  const res = await costflow("pad bofa eob", testConfig);
  t.is(res.error, undefined);
  t.is(res.date, today.format("YYYY-MM-DD"));
  t.is(res.directive, "pad");
  t.deepEqual(res.data, {
    "Assets:BofA": "Equity:Opening-Balances",
  });
});
