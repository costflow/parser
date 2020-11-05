import costflow from "..";
import { expectToBeNotError, testConfig } from "./common";

/*
 * Option
 */
test("Option #1", async () => {
  const res = await costflow.parse(
    "option title Example Costflow file",
    testConfig
  );
  expectToBeNotError(res);
  expect(res.directive).toBe("option");
  expect(res.data).toEqual({
    title: "Example Costflow file",
  });
});

test("Option #2", async () => {
  const res = await costflow.parse("option operating_currency CNY", testConfig);
  expectToBeNotError(res);
  expect(res.directive).toBe("option");
  expect(res.data).toEqual({ operating_currency: "CNY" });
});

test("Option #3", async () => {
  const res = await costflow.parse(
    'option "conversion_currency" "NOTHING"',
    testConfig
  );
  expectToBeNotError(res);
  expect(res.directive).toBe("option");
  expect(res.data).toEqual({ conversion_currency: "NOTHING" });
});
