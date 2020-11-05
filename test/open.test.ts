import costflow from "..";
import { expectToBeNotError, testConfig, today } from "./common";

/*
 * Open
 */
test("Open #1", async () => {
  const res = await costflow.parse(
    "2017-01-01 open Assets:US:BofA:Checking",
    testConfig
  );
  expectToBeNotError(res);
  expect(res.date).toBe("2017-01-01");
  expect(res.directive).toBe("open");
  expect(res.data).toBe("Assets:US:BofA:Checking");
});
test("Open #2", async () => {
  const res = await costflow.parse("open Assets:CN:CMB", testConfig);
  expectToBeNotError(res);
  expect(res.date).toBe(today.format("YYYY-MM-DD"));
  expect(res.directive).toBe("open");
  expect(res.data).toBe("Assets:CN:CMB");
});

// open directive with currency is not supported yet https://beancount.github.io/docs/beancount_language_syntax.html#open
// test("Open #3", async () => {
//   const res = await costflow.parse("open Assets:CN:CMB CNY", testConfig);
//   expectToBeNotError(res);
//   expect(res.directive).toBe("open");
//   expect(res.data).toBe("Assets:CN:CMB");
// });
