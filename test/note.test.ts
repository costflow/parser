import costflow from "..";
import { expectToBeNotError, testConfig, today } from "./common";

/*
  Part 7: Note
  Syntax: https://github.com/costflow/syntax/tree/master#note
*/
test("Note #1", async () => {
  const res = await costflow.parse(
    "2017-01-01 note Assets:US:BofA:Checking Called about fraudulent card.",
    testConfig
  );
  expectToBeNotError(res);
  expect(res.date).toBe("2017-01-01");
  expect(res.directive).toBe("note");
  expect(res.data).toEqual({
    "Assets:US:BofA:Checking": "Called about fraudulent card.",
  });
});

test("Note #2", async () => {
  const res = await costflow.parse(
    "note bofa Called about fraudulent card.",
    testConfig
  );
  expectToBeNotError(res);

  expect(res.date).toBe(today.format("YYYY-MM-DD"));
  expect(res.directive).toBe("note");
  expect(res.data).toEqual({
    "Assets:BofA": "Called about fraudulent card.",
  });
});
