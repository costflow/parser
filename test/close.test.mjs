import test from "ava";
import costflow from "../src/main.mjs";
import { testConfig, today } from "./common.mjs";

/*
 * Close
 */
test("Close #1", async (t) => {
  const res = await costflow(
    "2017-01-01 close Assets:US:BofA:Checking",
    testConfig
  );

  t.is(res.error, undefined);
  t.is(res.date, "2017-01-01");
  t.is(res.directive, "close");
  t.is(res.data, "Assets:US:BofA:Checking");
});

test("Open #2", async (t) => {
  const res = await costflow("close Assets:CN:CMB", testConfig);

  t.is(res.error, undefined);
  t.is(res.date, today.format("YYYY-MM-DD"));
  t.is(res.directive, "close");
  t.is(res.data, "Assets:CN:CMB");
});
