import costflow from "..";
import { expectToBeNotError, testConfig, today } from "./common";

/*
 * Pad
 */
test("Pad #1", async () => {
  const res = await costflow.parse("pad bofa eob", testConfig);
  expectToBeNotError(res);
  expect(res.date).toBe(today.format("YYYY-MM-DD"));
  expect(res.directive).toBe("pad");
  expect(res.data).toEqual({
    "Assets:BofA": "Equity:Opening-Balances",
  });
});
