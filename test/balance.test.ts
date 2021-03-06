import costflow from "..";
import { expectToBeNotError, testConfig, today } from "./common";

/*
 * Balance
 */
test("Balance #1", async () => {
  const res = await costflow.parse(
    "2017-01-01 balance Assets:BofA 360 USD",
    testConfig
  );
  expectToBeNotError(res);
  expect(res.date).toBe("2017-01-01");
  expect(res.directive).toBe("balance");
  expect(res.data).toEqual([
    {
      account: "Assets:BofA",
      amount: 360,
      currency: "USD",
    },
  ]);
});
test("Balance #2", async () => {
  const res = await costflow.parse("tmr balance BofA 1024 CNY", testConfig);
  expectToBeNotError(res);
  expect(res.date).toBe(today.add(1, "d").format("YYYY-MM-DD"));
  expect(res.directive).toBe("balance");
  expect(res.data).toEqual([
    {
      account: "Assets:BofA",
      amount: 1024,
      currency: "CNY",
    },
  ]);
});
test("Balance #3: overwriteConfig", async () => {
  const res = await costflow.parse("tmr balance BofA 1024", testConfig, {
    currency: "JPY",
  });
  expectToBeNotError(res);
  expect(res.date).toBe(today.add(1, "d").format("YYYY-MM-DD"));
  expect(res.directive).toBe("balance");
  expect(res.data).toEqual([
    {
      account: "Assets:BofA",
      amount: 1024,
      currency: "JPY",
    },
  ]);
});
test("Balance #3: overwriteResult", async () => {
  const res = await costflow.parse("tmr balance BofA 1024", testConfig, null, {
    date: "2020-11-11",
  });
  expectToBeNotError(res);
  expect(res.date).toBe("2020-11-11");
  expect(res.directive).toBe("balance");
  expect(res.data).toEqual([
    {
      account: "Assets:BofA",
      amount: 1024,
      currency: "USD",
    },
  ]);
});
