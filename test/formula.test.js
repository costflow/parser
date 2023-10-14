import test from "ava";
import costflow from "..";
import { NParseResult } from "../src/interface";
import { testConfig, today } from "./common.mjs";

/*
  Part 13: Formula
*/
test("Formula #1", async (t) => {
  const res = await costflow("f spotify", testConfig);
  t.is(res.error, undefined);

  t.is(res.directive, "transaction");
  t.is(res.date, today.format("YYYY-MM-DD"));
  expect(res.completed).toBe(true);
  expect(res.payee).toBe("Spotify");
  expect(res.narration).toBe("");
  expect(res.tags).toEqual(["costflow", "music"]);
  t.deepEqual(res.data, [
    {
      account: "Liabilities:Visa",
      amount: -15.98,
      currency: "USD",
    },
    {
      account: "Expenses:Music",
      amount: 15.98,
      currency: "USD",
    },
  ]);
});
test("Formula #2", async (t) => {
  const res = await costflow("btv #transfer 12.50", testConfig);
  t.is(res.error, undefined);

  t.is(res.directive, "transaction");
  t.is(res.date, today.format("YYYY-MM-DD"));
  expect(res.completed).toBe(true);
  expect(res.payee).toBe(null);
  expect(res.narration).toBe("");
  expect(res.tags).toEqual(["costflow", "transfer"]);
  t.deepEqual(res.data, [
    {
      account: "Assets:BofA",
      amount: -12.5,
      currency: "USD",
    },
    {
      account: "Liabilities:Visa",
      amount: +12.5,
      currency: "USD",
    },
  ]);
});

test("Formula #3", async (t) => {
  const res = await costflow("f uber 8.8", testConfig);
  t.is(res.error, undefined);
  t.is(res.directive, "transaction");
  t.is(res.date, today.format("YYYY-MM-DD"));
  expect(res.completed).toBe(true);
  expect(res.payee).toBe("Uber");
  expect(res.narration).toBe("");
  expect(res.tags).toEqual(["costflow", "uber"]);
  t.deepEqual(res.data, [
    {
      account: "Liabilities:Visa",
      amount: -8.8,
      currency: "USD",
    },
    {
      account: "Expenses:Transport",
      amount: +8.8,
      currency: "USD",
    },
  ]);
});

test("Formula #4", async (t) => {
  const res = await costflow("☕️ 4.2", testConfig);
  t.is(res.error, undefined);

  t.is(res.directive, "transaction");
  t.is(res.date, today.format("YYYY-MM-DD"));
  expect(res.completed).toBe(true);
  expect(res.payee).toBe("Leplay's");
  expect(res.narration).toBe("☕️");
  expect(res.tags).toEqual(["costflow"]);
  t.deepEqual(res.data, [
    {
      account: "Liabilities:Visa",
      amount: -4.2,
      currency: "USD",
    },
    {
      account: "Expenses:Coffee",
      amount: +4.2,
      currency: "USD",
    },
  ]);
});

test("Formula #5", async (t) => {
  const res = await costflow("tb bofa 1200", testConfig);
  t.is(res.error, undefined);

  t.is(res.directive, "balance");
  t.is(res.date, today.add(1, "d").format("YYYY-MM-DD"));
  t.deepEqual(res.data, [
    {
      account: "Assets:BofA",
      amount: 1200,
      currency: "USD",
    },
  ]);
});
