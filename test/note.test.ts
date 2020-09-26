import * as costflow from '..'
import { expectToBeNotError, testConfig, today } from './common'


/*
  Part 7: Note
  Syntax: https://github.com/costflow/syntax/tree/master#note
*/
test('Note #1', async () => {
  const data = await costflow.parse('2017-01-01 note Assets:US:BofA:Checking Called about fraudulent card.', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe('2017-01-01 note Assets:US:BofA:Checking "Called about fraudulent card."')
})
test('Note #2', async () => {
  const data = await costflow.parse('note bofa Called about fraudulent card.', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe(`${today.format('YYYY-MM-DD')} note Assets:US:BofA:Checking "Called about fraudulent card."`)
})
