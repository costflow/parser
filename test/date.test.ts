import * as costflow from '..'
import { expectToBeNotError, testConfig, today } from './common'


/*
  Part 0: Date
*/
test('Date #0.1', async () => {
  const data = await costflow.parse('2017-01-05 Lorem Ipsum', testConfig)
  expectToBeNotError(data)
  expect(data.date).toBe('2017-01-05')
})
test('Date #0.2', async () => {
  const data = await costflow.parse('Lorem Ipsum', testConfig)
  expectToBeNotError(data)
  expect(data.date).toBe(today.format('YYYY-MM-DD'))
})
test('Date #0.3', async () => {
  const data = await costflow.parse('ytd Lorem Ipsum', testConfig)
  expectToBeNotError(data)
  expect(data.date).toBe(today.add(-1, 'd').format('YYYY-MM-DD'))
})
test('Date #0.4', async () => {
  const data = await costflow.parse('yesterday Lorem Ipsum', testConfig)
  expectToBeNotError(data)
  expect(data.date).toBe(today.add(-1, 'd').format('YYYY-MM-DD'))
})
test('Date #0.5', async () => {
  const data = await costflow.parse('dby Lorem Ipsum', testConfig)
  expectToBeNotError(data)
  expect(data.date).toBe(today.add(-2, 'd').format('YYYY-MM-DD'))
})
test('Date #0.6', async () => {
  const data = await costflow.parse('tmr Lorem Ipsum', testConfig)
  expectToBeNotError(data)
  expect(data.date).toBe(today.add(1, 'd').format('YYYY-MM-DD'))
})
test('Date #0.7', async () => {
  const data = await costflow.parse('tomorrow Lorem Ipsum', testConfig)
  expectToBeNotError(data)
  expect(data.date).toBe(today.add(1, 'd').format('YYYY-MM-DD'))
})
test('Date #0.8', async () => {
  const data = await costflow.parse('dat Lorem Ipsum', testConfig)
  expectToBeNotError(data)
  expect(data.date).toBe(today.add(2, 'd').format('YYYY-MM-DD'))
})

test('Date #0.9', async () => {
  const data = await costflow.parse('Aug 9 Lorem Ipsum', testConfig)
  expectToBeNotError(data)
  expect(data.date).toBe(`${today.year()}-08-09`)
})
test('Date #1.0', async () => {
  const data = await costflow.parse('July 07 Lorem Ipsum', testConfig)
  expectToBeNotError(data)
  expect(data.date).toBe(`${today.year()}-07-07`)
})
