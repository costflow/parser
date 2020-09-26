import * as costflow from '..'
import * as alphavantage from '../src/alphavantage'
import { expectToBeNotError, testConfig, today } from './common'


/*
  Part 10: Price
  Syntax: https://github.com/costflow/syntax/tree/master#price
  Note: Tests might fail due to the API rate limit. https://www.alphavantage.co/support/
*/
test('Price #1', async () => {
  const data = await costflow.parse('2017-01-17 price USD 1.08 CAD', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe('2017-01-17 price USD 1.08 CAD')
})
test('Price #2', async () => {
  const exchange = await alphavantage.exchange(testConfig.alphavantage, 'USD', 'CNY')
  const data = await costflow.parse('price USD to CNY', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe(`${today.format('YYYY-MM-DD')} price USD ${exchange.rate} CNY`)
})
test('Price #3', async () => {
  const quote = await alphavantage.quote(testConfig.alphavantage, 'AAPL')
  const data = await costflow.parse('price AAPL', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe(`${today.format('YYYY-MM-DD')} price AAPL ${quote.price} USD`)
})

/*
  Part 11: $ Snap
  Syntax: https://github.com/costflow/syntax/tree/master#snap
  Note: Tests might fail due to the API rate limit. https://www.alphavantage.co/support/
*/

test('Snap #1', async () => {
  const exchange = await alphavantage.exchange(testConfig.alphavantage, 'CAD', 'USD')
  const data = await costflow.parse('$ CAD', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe(`1 CAD = ${exchange.rate} USD`)
})

test('Snap #2', async () => {
  const exchange = await alphavantage.exchange(testConfig.alphavantage, 'USD', 'CNY')
  const data = await costflow.parse('$ 100 USD to CNY', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe(`100 USD = ${exchange.rate} CNY`)
})

test('Snap #3', async () => {
  const quote = await alphavantage.quote(testConfig.alphavantage, 'AAPL')
  const data = await costflow.parse('$ 200 AAPL', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe(`AAPL ${quote.price} (${quote.percent})\n200 AAPL = ${Number(quote.price * 200).toFixed(2)}`)
})
