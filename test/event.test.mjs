import test from "ava";
import costflow from "../src/main.mjs";
import { testConfig, today } from "./common.mjs";

/*
 * Event
 */
test("Event #1", async (t) => {
  const res = await costflow(
    '2017-01-02 event "location" "Paris, France"',
    testConfig
  );
  t.is(res.error, undefined);
  t.is(res.date, "2017-01-02");
  t.is(res.directive, "event");
  t.deepEqual(res.data, {
    location: "Paris, France",
  });
});

test("Event #2", async (t) => {
  const res = await costflow("event location Paris, France", testConfig);
  t.is(res.error, undefined);
  t.is(res.date, today.format("YYYY-MM-DD"));
  t.is(res.directive, "event");
  t.deepEqual(res.data, {
    location: "Paris, France",
  });
});
