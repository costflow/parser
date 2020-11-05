import costflow from "..";
import { expectToBeNotError, testConfig, today } from "./common";

/*
 * Event
 */
test("Event #1", async () => {
  const res = await costflow.parse(
    '2017-01-02 event "location" "Paris, France"',
    testConfig
  );
  expectToBeNotError(res);

  expect(res.date).toBe("2017-01-02");
  expect(res.directive).toBe("event");
  expect(res.data).toEqual({
    location: "Paris, France",
  });
});

test("Event #2", async () => {
  const res = await costflow.parse("event location Paris, France", testConfig);
  expectToBeNotError(res);

  expect(res.date).toBe(today.format("YYYY-MM-DD"));
  expect(res.directive).toBe("event");
  expect(res.data).toEqual({
    location: "Paris, France",
  });
});
