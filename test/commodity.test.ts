import * as costflow from '..'
import { expectToBeNotError, testConfig, today } from './common'


/*
  Part 5: Commodity
  Syntax: https://github.com/costflow/syntax/tree/master#commodity
*/
test('Commodity #1', async () => {
  const data = await costflow.parse('1867-01-01 commodity CAD', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe('1867-01-01 commodity CAD')
})
test('Commodity #2', async () => {
  const data = await costflow.parse('commodity HOOL', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe(`${today.format('YYYY-MM-DD')} commodity HOOL`)
})
