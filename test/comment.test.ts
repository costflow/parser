import * as costflow from '..'
import { expectToBeNotError, testConfig } from './common'


/*
  Part 2: Comment
  Syntax: https://github.com/costflow/syntax/tree/master#comment
*/
test('Comment #1', async () => {
  const data = await costflow.parse('; I paid and left the taxi, forgot to take change, it was cold.', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe('; I paid and left the taxi, forgot to take change, it was cold.')
})
test('Comment #2', async () => {
  const data = await costflow.parse('// to do: cancel Netflix subscription.', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe('to do: cancel Netflix subscription.')
})
test('Comment #3', async () => {
  const data = await costflow.parse('Hello World', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe('Hello World')
})
