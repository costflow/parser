import * as costflow from '..'
import { expectToBeNotError, testConfig } from './common'


/*
  Part 6: Option
  Syntax: https://github.com/costflow/syntax/tree/master#option
*/
test('Option #1', async () => {
  const data = await costflow.parse('option Example Costflow file', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe('option "title" "Example Costflow file"')
})
test('Option #2', async () => {
  const data = await costflow.parse('option CNY', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe('option "operating_currency" "CNY"')
})
test('Option #3', async () => {
  const data = await costflow.parse('option "conversion_currency" "NOTHING"', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe('option "conversion_currency" "NOTHING"')
})
