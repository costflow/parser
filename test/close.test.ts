import * as costflow from '..'
import { expectToBeNotError, testConfig, today } from './common'


/*
  Part 4: Close
  Syntax: https://github.com/costflow/syntax/tree/master#close
*/
test('Close #1', async () => {
  const data = await costflow.parse('2017-01-01 close Assets:US:BofA:Checking', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe('2017-01-01 close Assets:US:BofA:Checking')
})
test('Open #2', async () => {
  const data = await costflow.parse('close Assets:CN:CMB', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe(`${today.format('YYYY-MM-DD')} close Assets:CN:CMB`)
})
