import costflow from "..";
import { expectToBeNotError, testConfig } from "./common";

/*
 * Comment
 */

test("Comment #1", async () => {
  const res = await costflow.parse(
    "; I paid and left the taxi, forgot to take change, it was cold.",
    testConfig
  );
  expectToBeNotError(res);
  expect(res.directive).toBe("comment");
  expect(res.shortcut).toBe(";");
  expect(res.data).toBe(
    "I paid and left the taxi, forgot to take change, it was cold."
  );
});

test("Comment #2", async () => {
  const res = await costflow.parse(
    "// to do: cancel Netflix subscription.",
    testConfig
  );
  expectToBeNotError(res);
  expect(res.directive).toBe("comment");
  expect(res.shortcut).toBe("//");
  expect(res.data).toBe("to do: cancel Netflix subscription.");
});

test("Comment #3", async () => {
  const res = await costflow.parse("Hello World", testConfig);
  expectToBeNotError(res);
  expect(res.shortcut).toBe(undefined);
  expect(res.directive).toBe("comment");
  expect(res.data).toBe("Hello World");
});
