import test from "ava";
import costflow from "../src/main.mjs";
import { testConfig } from "./common.mjs";

/*
 * Comment
 */

test("Comment #1", async (t) => {
  const res = await costflow(
    "; I paid and left the taxi, forgot to take change, it was cold.",
    testConfig
  );
  t.is(res.error, undefined);
  t.is(res.directive, "comment");
  t.is(res.shortcut, ";");
  t.is(
    res.data,
    "I paid and left the taxi, forgot to take change, it was cold."
  );
});

test("Comment #2", async (t) => {
  const res = await costflow(
    "// to do: cancel Netflix subscription.",
    testConfig
  );
  t.is(res.error, undefined);
  t.is(res.directive, "comment");
  t.is(res.shortcut, "//");
  t.is(res.data, "to do: cancel Netflix subscription.");
});

test("Comment #3", async (t) => {
  const res = await costflow("Hello World", testConfig);
  t.is(res.error, undefined);
  t.is(res.shortcut, undefined);
  t.is(res.directive, "comment");
  t.is(res.data, "Hello World");
});
