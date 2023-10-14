import test from "ava";
import costflow from "../src/main.mjs";
import { testConfig, today } from "./common.mjs";

/*
 * Open
 */
test("Open #1", async (t) => {
  const res = await costflow(
    "2017-01-01 open Assets:US:BofA:Checking",
    testConfig
  );
  t.is(res.error, undefined);
  t.is(res.date, "2017-01-01");
  t.is(res.directive, "open");
  t.is(res.data, "Assets:US:BofA:Checking");
});
test("Open #2", async (t) => {
  const res = await costflow("open Assets:CN:CMB", testConfig);
  t.is(res.error, undefined);
  t.is(res.date, today.format("YYYY-MM-DD"));
  t.is(res.directive, "open");
  t.is(res.data, "Assets:CN:CMB");
});

// open directive with currency is not supported yet https://beancount.github.io/docs/beancount_language_syntax.html#open
// test("Open #3", async t => {
//   const res = await costflow("open Assets:CN:CMB CNY", testConfig);
//   t.is(res.error, undefined);
//   t.is(res.directive, "open");
//   t.is(res.data, "Assets:CN:CMB");
// });
