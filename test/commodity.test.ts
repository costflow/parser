import costflow from "..";
import { expectToBeNotError, testConfig, today } from "./common";

/*
 * Commodity
 */

test("Commodity #1", async () => {
  const res = await costflow.parse("1867-01-01 commodity CAD", testConfig);
  expectToBeNotError(res);
  expect(res.date).toBe("1867-01-01");
  expect(res.directive).toBe("commodity");
  expect(res.data).toBe("CAD");
});
test("Commodity #2", async () => {
  const res = await costflow.parse("commodity HOOL", testConfig);
  expectToBeNotError(res);
  expect(res.date).toBe(today.format("YYYY-MM-DD"));
  expect(res.directive).toBe("commodity");
  expect(res.data).toBe("HOOL");
});
