import test from "ava";
import costflow from "../src/main.mjs";
import { testConfig, today } from "./common.mjs";

/*
 * Date
 */
test("Date #0.1", async (t) => {
  const data = await costflow("2017-01-05 Lorem Ipsum", testConfig);
  t.is(data.error, undefined);
  t.is(data.date, "2017-01-05");
});
test("Date #0.2", async (t) => {
  const data = await costflow("Lorem Ipsum", testConfig);
  t.is(data.error, undefined);
  t.is(data.date, today.format("YYYY-MM-DD"));
});
test("Date #0.3", async (t) => {
  const data = await costflow("ytd Lorem Ipsum", testConfig);
  t.is(data.error, undefined);
  t.is(data.date, today.add(-1, "d").format("YYYY-MM-DD"));
});
test("Date #0.4", async (t) => {
  const data = await costflow("yesterday Lorem Ipsum", testConfig);
  t.is(data.error, undefined);
  t.is(data.date, today.add(-1, "d").format("YYYY-MM-DD"));
});
test("Date #0.5", async (t) => {
  const data = await costflow("dby Lorem Ipsum", testConfig);
  t.is(data.error, undefined);
  t.is(data.date, today.add(-2, "d").format("YYYY-MM-DD"));
});
test("Date #0.6", async (t) => {
  const data = await costflow("tmr Lorem Ipsum", testConfig);
  t.is(data.error, undefined);
  t.is(data.date, today.add(1, "d").format("YYYY-MM-DD"));
});
test("Date #0.7", async (t) => {
  const data = await costflow("tomorrow Lorem Ipsum", testConfig);
  t.is(data.error, undefined);
  t.is(data.date, today.add(1, "d").format("YYYY-MM-DD"));
});
test("Date #0.8", async (t) => {
  const data = await costflow("dat Lorem Ipsum", testConfig);
  t.is(data.error, undefined);
  t.is(data.date, today.add(2, "d").format("YYYY-MM-DD"));
});

test("Date #0.9", async (t) => {
  const data = await costflow("Aug 9 Lorem Ipsum", testConfig);
  t.is(data.error, undefined);
  t.is(data.date, `${today.year()}-08-09`);
});
test("Date #1.0", async (t) => {
  const data = await costflow("July 07 Lorem Ipsum", testConfig);
  t.is(data.error, undefined);
  t.is(data.date, `${today.year()}-07-07`);
});
