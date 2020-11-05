import costflow from "..";
import { expectToBeNotError, testConfig, today } from "./common";

/*
  Part 13: Formula
*/
test("Formula #1", async () => {
  const res = await costflow.parse("f spotify", testConfig);
  expectToBeNotError(res);

  expect(res.directive).toBe("transaction");
  expect(res.date).toBe(today.format("YYYY-MM-DD"));
  expect(res.completed).toBe(true);
  expect(res.payee).toBe("Spotify");
  expect(res.narration).toBe("");
  expect(res.tags).toEqual(["costflow", "music"]);
  expect(res.data).toEqual([
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
test("Formula #2", async () => {
  const res = await costflow.parse("btv #transfer 12.50", testConfig);
  expectToBeNotError(res);

  expect(res.directive).toBe("transaction");
  expect(res.date).toBe(today.format("YYYY-MM-DD"));
  expect(res.completed).toBe(true);
  expect(res.payee).toBe(null);
  expect(res.narration).toBe("");
  expect(res.tags).toEqual(["costflow", "transfer"]);
  expect(res.data).toEqual([
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

test("Formula #3", async () => {
  const res = await costflow.parse("f uber 8.8", testConfig);
  expectToBeNotError(res);
  expect(res.directive).toBe("transaction");
  expect(res.date).toBe(today.format("YYYY-MM-DD"));
  expect(res.completed).toBe(true);
  expect(res.payee).toBe("Uber");
  expect(res.narration).toBe("");
  expect(res.tags).toEqual(["costflow", "uber"]);
  expect(res.data).toEqual([
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

test("Formula #4", async () => {
  const res = await costflow.parse("☕️ 4.2", testConfig);
  expectToBeNotError(res);

  expect(res.directive).toBe("transaction");
  expect(res.date).toBe(today.format("YYYY-MM-DD"));
  expect(res.completed).toBe(true);
  expect(res.payee).toBe("Leplay's");
  expect(res.narration).toBe("☕️");
  expect(res.tags).toEqual(["costflow"]);
  expect(res.data).toEqual([
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

test("Formula #5", async () => {
  const res = await costflow.parse("tb bofa 1200", testConfig);
  expectToBeNotError(res);

  expect(res.directive).toBe("balance");
  expect(res.date).toBe(today.add(1, "d").format("YYYY-MM-DD"));
  expect(res.data).toEqual([
    {
      account: "Assets:BofA",
      amount: 1200,
      currency: "USD",
    },
  ]);
});
