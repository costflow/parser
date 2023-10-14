import test from "ava";
import costflow from "../src/main.mjs";
import { testConfig, today } from "./common.mjs";

/*
 * Commodity
 */

test("Commodity #1", async (t) => {
  const res = await costflow("1867-01-01 commodity CAD", testConfig);
  t.is(res.error, undefined);
  t.is(res.date, "1867-01-01");
  t.is(res.directive, "commodity");
  t.is(res.data, "CAD");
});
test("Commodity #2", async (t) => {
  const res = await costflow("commodity HOOL", testConfig);
  t.is(res.error, undefined);
  t.is(res.date, today.format("YYYY-MM-DD"));
  t.is(res.directive, "commodity");
  t.is(res.data, "HOOL");
});
