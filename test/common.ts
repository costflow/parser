import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc' // dependent on utc plugin
import timezone from 'dayjs/plugin/timezone'
dayjs.extend(utc)
dayjs.extend(timezone)

import * as costflow from '..'

export const testConfig = {
  mode: 'beancount' as const,
  currency: 'USD' as const,
  timezone: 'America/Whitehorse',
  tag: '#costflow',
  replacement: {
    aapl: 'Assets:ETrade:AAPL',
    boc: 'Assets:CN:BOC',
    bofa: 'Assets:US:BofA:Checking',
    cg: 'Income:Etrade:CapitalGains',
    cloud: 'Expenses:Cloud',
    cmb: 'Liabilities:CreditCard:CMB',
    eob: 'Equity:Opening-Balances',
    food: 'Expenses:Food',
    phone: 'Expenses:Home:Phone',
    rent: 'Expenses:Home:Rent',
    subscription: 'Expenses:Subscriptions',
    rx: 'Assets:Receivables:X',
    ry: 'Assets:Receivables:Y',
    visa: 'Liabilities:CreditCard:Visa'
  },
  formula: {
    '☕️': '@Leplays ☕️ {{ amount }} Liabilities:CreditCard:Visa > Expenses:Coffee',
    c2f: '{{ pre }} cmb > food',
    gcp: '@Google {{ amount }} USD visa > cloud',
    loop: 'loop',
    spotify: '@Spotify 15.98 USD visa > subscription'
  },
  alphavantage: 'YOUR_KEY_HERE', // https://www.alphavantage.co/support/
  indent: 2,
  lineLength: 60
}
export const today = dayjs().tz(testConfig.timezone)

export function expectToBeNotError(data: costflow.IParseResult): asserts data is costflow.IParseResult.Result {
  expect((data as costflow.IParseResult.Error).error).toBe(undefined)
}

/*
  Part 14: Error
*/
// todo: use > and | at same time, etc.

// test('Error #1: Price', async () => {
//   const tmpConfig = Object.assign({}, testConfig)
//   delete tmpConfig.alphavantage
//   const data = await costflow.parse('price AAPL', tmpConfig)
//   expect(data.error).toBe('ALPHA_VANTAGE_KEY_NOT_EXIST')
// })

// test('Error #2: Snap', async () => {
//   const tmpConfig = Object.assign({}, testConfig)
//   delete tmpConfig.alphavantage
//   const data = await costflow.parse('$ 200 AAPL', tmpConfig)
//   expect(data.error).toBe('ALPHA_VANTAGE_KEY_NOT_EXIST')
// })

// test('Error #3: Alpha Vantage rate limit', async () => {
//   try {
//     await alphavantage.exchange(testConfig.alphavantage, 'USD', 'CNY')
//     await alphavantage.exchange(testConfig.alphavantage, 'USD', 'CNY')
//     await alphavantage.exchange(testConfig.alphavantage, 'USD', 'CNY')
//     await alphavantage.exchange(testConfig.alphavantage, 'USD', 'CNY')
//     await alphavantage.exchange(testConfig.alphavantage, 'USD', 'CNY')
//     await alphavantage.exchange(testConfig.alphavantage, 'USD', 'CNY')
//     await alphavantage.exchange(testConfig.alphavantage, 'USD', 'CNY')
//   } catch (err) {}

//   const data = await costflow.parse('$ 200 AAPL', testConfig)
//   expect(data.error).toBe('ALPHA_VANTAGE_KEY_INVALID_OR_EXCEED_RATE_LIMIT')
// }, 30000)
// test('Error #4: Formula not exist', async () => {
//   const data = await costflow.parse('f notExistFormula', testConfig)
//   expect(data.error).toBe('FORMULA_NOT_FOUND')
// })

// test('Error #5: Formula loop', async () => {
//   const data = await costflow.parse('f loop', testConfig)
//   expect(data.error).toBe('FORMULA_LOOP')
// })
