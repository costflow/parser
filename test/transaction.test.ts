import * as costflow from '..'
import { expectToBeNotError, testConfig, today } from './common'


/*
  Part 1: Transaction
  Syntax: https://github.com/costflow/syntax/tree/master#transaction
*/

// Use >
test('Transaction #1.1', async () => {
  const data = await costflow.parse('2017-01-05 "RiverBank Properties" "Paying the rent" 2400 Assets:US:BofA:Checking > 2400  Expenses:Home:Rent', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe(`2017-01-05 * "RiverBank Properties" "Paying the rent" #costflow
  Assets:US:BofA:Checking                       -2400.00 USD
  Expenses:Home:Rent                            +2400.00 USD`)
})
test('Transaction #1.2', async () => {
  const data = await costflow.parse('@Verizon 59.61 Assets:US:BofA:Checking > Expenses:Home:Phone', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe(`${today.format('YYYY-MM-DD')} * "Verizon" "" #costflow
  Assets:US:BofA:Checking                         -59.61 USD
  Expenses:Home:Phone                             +59.61 USD`)
})

test('Transaction #1.3', async () => {
  const data = await costflow.parse('@Verizon 59.61 bofa > phone', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe(`${today.format('YYYY-MM-DD')} * "Verizon" "" #costflow
  Assets:US:BofA:Checking                         -59.61 USD
  Expenses:Home:Phone                             +59.61 USD`)
})

test('Transaction #1.4', async () => {
  const data = await costflow.parse('Rent 750 cmb + 750 boc > rent', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe(`${today.format('YYYY-MM-DD')} * "Rent" #costflow
  Liabilities:CreditCard:CMB                     -750.00 USD
  Assets:CN:BOC                                  -750.00 USD
  Expenses:Home:Rent                            +1500.00 USD`)
})

test('Transaction #1.5', async () => {
  const data = await costflow.parse('Dinner 180 CNY cmb > rx + ry + food', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe(`${today.format('YYYY-MM-DD')} * "Dinner" #costflow
  Liabilities:CreditCard:CMB                     -180.00 CNY
  Assets:Receivables:X                            +60.00 CNY
  Assets:Receivables:Y                            +60.00 CNY
  Expenses:Food                                   +60.00 CNY`)
})

test('Transaction #1.6', async () => {
  const data = await costflow.parse('Transfer to account in US 5000 CNY @ 7.2681 USD boc > 726.81 USD bofa', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe(`${today.format('YYYY-MM-DD')} * "Transfer to account in US" #costflow
  Assets:CN:BOC                                 -5000.00 CNY @ 7.2681 USD
  Assets:US:BofA:Checking                        +726.81 USD`)
})

test('Transaction #1.7', async () => {
  const data = await costflow.parse('Transfer to account in US 5000 CNY @@ 726.81 USD boc > 726.81 USD bofa', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe(`${today.format('YYYY-MM-DD')} * "Transfer to account in US" #costflow
  Assets:CN:BOC                                 -5000.00 CNY @@ 726.81 USD
  Assets:US:BofA:Checking                        +726.81 USD`)
})

test('Transaction #1.8', async () => {
  const data = await costflow.parse('Bought shares of Apple 1915.5 bofa > 10 AAPL {191.55 USD} aapl', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe(`${today.format('YYYY-MM-DD')} * "Bought shares of Apple" #costflow
  Assets:US:BofA:Checking                       -1915.50 USD
  Assets:ETrade:AAPL                             +10.00 AAPL {191.55 USD}`)
})

test('Transaction #1.9', async () => {
  const data = await costflow.parse('Sold shares of Apple 10 AAPL {191.55 USD} @ 201.55 USD aapl + 100 USD cg > 2015.5 bofa', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe(`${today.format('YYYY-MM-DD')} * "Sold shares of Apple" #costflow
  Assets:ETrade:AAPL                             -10.00 AAPL {191.55 USD} @ 201.55 USD
  Income:Etrade:CapitalGains                     -100.00 USD
  Assets:US:BofA:Checking                       +2015.50 USD`)
})

test('Transaction #1.10', async () => {
  const data = await costflow.parse('@麦当劳 #food #mc 180 CNY cmb > food', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe(`${today.format('YYYY-MM-DD')} * "麦当劳" "" #food #mc #costflow
  Liabilities:CreditCard:CMB                     -180.00 CNY
  Expenses:Food                                  +180.00 CNY`)
})

// Use |

test('Transaction #2.1', async () => {
  const data = await costflow.parse('2017-01-05 "RiverBank Properties" "Paying the rent" | Assets:US:BofA:Checking -2400 | Expenses:Home:Rent 2400', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe(`2017-01-05 * "RiverBank Properties" "Paying the rent" #costflow
  Assets:US:BofA:Checking                       -2400.00 USD
  Expenses:Home:Rent                            +2400.00 USD`)
})
test('Transaction #2.2', async () => {
  const data = await costflow.parse('@Verizon | Assets:US:BofA:Checking -59.61 | Expenses:Home:Phone 59.61', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe(`${today.format('YYYY-MM-DD')} * "Verizon" "" #costflow
  Assets:US:BofA:Checking                         -59.61 USD
  Expenses:Home:Phone                             +59.61 USD`)
})

test('Transaction #2.3', async () => {
  const data = await costflow.parse('@Verizon | bofa -59.61 | phone 59.61', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe(`${today.format('YYYY-MM-DD')} * "Verizon" "" #costflow
  Assets:US:BofA:Checking                         -59.61 USD
  Expenses:Home:Phone                             +59.61 USD`)
})

test('Transaction #2.4', async () => {
  const data = await costflow.parse('Rent | cmb -750 | boc -750 | rent 1500', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe(`${today.format('YYYY-MM-DD')} * "Rent" #costflow
  Liabilities:CreditCard:CMB                     -750.00 USD
  Assets:CN:BOC                                  -750.00 USD
  Expenses:Home:Rent                            +1500.00 USD`)
})

test('Transaction #2.5', async () => {
  const data = await costflow.parse('Dinner | cmb -180 CNY | rx 60 CNY | ry 60 CNY | food 60 CNY', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe(`${today.format('YYYY-MM-DD')} * "Dinner" #costflow
  Liabilities:CreditCard:CMB                     -180.00 CNY
  Assets:Receivables:X                            +60.00 CNY
  Assets:Receivables:Y                            +60.00 CNY
  Expenses:Food                                   +60.00 CNY`)
})

test('Transaction #2.6', async () => {
  const data = await costflow.parse('Transfer to account in US | boc -5000 CNY @ 7.2681 USD  | bofa +726.81', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe(`${today.format('YYYY-MM-DD')} * "Transfer to account in US" #costflow
  Assets:CN:BOC                                 -5000.00 CNY @ 7.2681 USD
  Assets:US:BofA:Checking                        +726.81 USD`)
})

test('Transaction #2.7', async () => {
  const data = await costflow.parse('Transfer to account in US | boc -5000 CNY @@ 726.81 USD  | bofa +726.81', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe(`${today.format('YYYY-MM-DD')} * "Transfer to account in US" #costflow
  Assets:CN:BOC                                 -5000.00 CNY @@ 726.81 USD
  Assets:US:BofA:Checking                        +726.81 USD`)
})

test('Transaction #2.8', async () => {
  const data = await costflow.parse('Bought shares of Apple | bofa -1915.5 | aapl 10 AAPL {191.55 USD}', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe(`${today.format('YYYY-MM-DD')} * "Bought shares of Apple" #costflow
  Assets:US:BofA:Checking                       -1915.50 USD
  Assets:ETrade:AAPL                             +10.00 AAPL {191.55 USD}`)
})

test('Transaction #2.9', async () => {
  const data = await costflow.parse('Sold shares of Apple | aapl -10.00 AAPL {191.55 USD} @ 201.55 USD | cg -100.00 USD | bofa +2015.5', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe(`${today.format('YYYY-MM-DD')} * "Sold shares of Apple" #costflow
  Assets:ETrade:AAPL                             -10.00 AAPL {191.55 USD} @ 201.55 USD
  Income:Etrade:CapitalGains                     -100.00 USD
  Assets:US:BofA:Checking                       +2015.50 USD`)
})

test('Transaction #2.10', async () => {
  const data = await costflow.parse('@麦当劳 #food #mc | cmb -180 CNY | food 180 CNY', testConfig)
  expectToBeNotError(data)
  expect(data.output).toBe(`${today.format('YYYY-MM-DD')} * "麦当劳" "" #food #mc #costflow
  Liabilities:CreditCard:CMB                     -180.00 CNY
  Expenses:Food                                  +180.00 CNY`)
})
