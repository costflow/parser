import * as costflow from '..'
import { expectToBeNotError, testConfig, today } from './common'


/*
  Part 13: Formula
*/
test('Formula #1', async () => {
  const data = await costflow.parse('f spotify', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe(`${today.format('YYYY-MM-DD')} * "Spotify" "" #costflow
  Liabilities:CreditCard:Visa                     -15.98 USD
  Expenses:Subscriptions                          +15.98 USD`)
})
test('Formula #2', async () => {
  const data = await costflow.parse('gcp 12.50', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe(`${today.format('YYYY-MM-DD')} * "Google" "" #costflow
  Liabilities:CreditCard:Visa                     -12.50 USD
  Expenses:Cloud                                  +12.50 USD`)
})

test('Formula #3', async () => {
  const data = await costflow.parse('f c2f @KFC 36', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe(`${today.format('YYYY-MM-DD')} * "KFC" "" #costflow
  Liabilities:CreditCard:CMB                      -36.00 USD
  Expenses:Food                                   +36.00 USD`)
})

test('Formula #4', async () => {
  const data = await costflow.parse('☕️ 4.2', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe(`${today.format('YYYY-MM-DD')} * "Leplays" "☕️" #costflow
  Liabilities:CreditCard:Visa                      -4.20 USD
  Expenses:Coffee                                  +4.20 USD`)
})
