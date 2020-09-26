import * as costflow from '..'
import { expectToBeNotError, testConfig, today } from './common'


/*
  Part 3: Open
  Syntax: https://github.com/costflow/syntax/tree/master#open
*/
test('Open #1', async () => {
  const data = await costflow.parse('2017-01-01 open Assets:US:BofA:Checking', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe('2017-01-01 open Assets:US:BofA:Checking')
})
test('Open #2', async () => {
  const data = await costflow.parse('open Assets:CN:CMB', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe(`${today.format('YYYY-MM-DD')} open Assets:CN:CMB`)
})
test('Open #3', async () => {
  const data = await costflow.parse('open Assets:CN:CMB CNY', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe(`${today.format('YYYY-MM-DD')} open Assets:CN:CMB CNY`)
})
