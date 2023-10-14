import test from "ava";
import costflow from "../src/main.mjs";
import { testConfig, today } from "./common.mjs";

/*
  Part 7: Note
  Syntax: https://github.com/costflow/syntax/tree/master#note
*/
test("Note #1", async (t) => {
  const res = await costflow(
    "2017-01-01 note Assets:US:BofA:Checking Called about fraudulent card.",
    testConfig
  );
  t.is(res.error, undefined);
  t.is(res.date, "2017-01-01");
  t.is(res.directive, "note");
  t.deepEqual(res.data, {
    "Assets:US:BofA:Checking": "Called about fraudulent card.",
  });
});

test("Note #2", async (t) => {
  const res = await costflow(
    "note bofa Called about fraudulent card.",
    testConfig
  );
  t.is(res.error, undefined);
  t.is(res.date, today.format("YYYY-MM-DD"));
  t.is(res.directive, "note");
  t.deepEqual(res.data, {
    "Assets:BofA": "Called about fraudulent card.",
  });
});
