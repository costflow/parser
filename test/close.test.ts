import costflow from "..";
import { expectToBeNotError, testConfig, today } from "./common";

/*
 * Close
 */
test("Close #1", async () => {
  const res = await costflow.parse(
    "2017-01-01 close Assets:US:BofA:Checking",
    testConfig
  );

  expectToBeNotError(res);
  expect(res.date).toBe("2017-01-01");
  expect(res.directive).toBe("close");
  expect(res.data).toBe("Assets:US:BofA:Checking");
});

test("Open #2", async () => {
  const res = await costflow.parse("close Assets:CN:CMB", testConfig);

  expectToBeNotError(res);
  expect(res.date).toBe(today.format("YYYY-MM-DD"));
  expect(res.directive).toBe("close");
  expect(res.data).toBe("Assets:CN:CMB");
});
