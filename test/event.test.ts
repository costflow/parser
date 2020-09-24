import * as costflow from '..'
import { expectToBeNotError, testConfig, today } from './common'


/*
  Part 12: Event
  Syntax: https://github.com/costflow/syntax/tree/master#event
*/
test('Event #1', async () => {
  const data = await costflow.parse('2017-01-02 event "location" "Paris, France"', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe('2017-01-02 event "location" "Paris, France"')
})
test('Event #2', async () => {
  const data = await costflow.parse('event location Paris, Francce', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe(`${today.format('YYYY-MM-DD')} event "location" "Paris, Francce"`)
})
