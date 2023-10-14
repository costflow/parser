import test from "ava";
import costflow from "../src/main.mjs";
import { testConfig } from "./common.mjs";

/*
 * Option
 */
test("Option #1", async (t) => {
  const res = await costflow("option title Example Costflow file", testConfig);
  t.is(res.error, undefined);
  t.is(res.directive, "option");
  t.deepEqual(res.data, {
    title: "Example Costflow file",
  });
});

test("Option #2", async (t) => {
  const res = await costflow("option operating_currency CNY", testConfig);
  t.is(res.error, undefined);
  t.is(res.directive, "option");
  t.deepEqual(res.data, { operating_currency: "CNY" });
});

test("Option #3", async (t) => {
  const res = await costflow(
    'option "conversion_currency" "NOTHING"',
    testConfig
  );
  t.is(res.error, undefined);
  t.is(res.directive, "option");
  t.deepEqual(res.data, { conversion_currency: "NOTHING" });
});
