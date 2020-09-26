import * as costflow from '..'
import { expectToBeNotError, testConfig, today } from './common'


/*
  Part 9: Pad
  Syntax: https://github.com/costflow/syntax/tree/master#pad
*/
test('Pad #1', async () => {
  const data = await costflow.parse('pad bofa eob', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe(`${today.format('YYYY-MM-DD')} pad Assets:US:BofA:Checking Equity:Opening-Balances`)
})
