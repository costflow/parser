import * as costflow from '..'
import { expectToBeNotError, testConfig, today } from './common'


/*
  Part 8: Balance
  Syntax: https://github.com/costflow/syntax/tree/master#balance
*/
test('Balance #1', async () => {
  const data = await costflow.parse('2017-01-01 balance Assets:US:BofA:Checking 360 CNY', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe('2017-01-01 balance Assets:US:BofA:Checking 360 CNY')
})
test('Balance #2', async () => {
  const data = await costflow.parse('tmr balance bofa 1024', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe(`${today.add(1, 'd').format('YYYY-MM-DD')} balance Assets:US:BofA:Checking 1024 USD`)
})
