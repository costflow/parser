const { DateTime } = require('luxon')
const { parser } = require('../index')
const alphavantage = require('../src/alphavantage')

const testConfig = {
  mode: 'beancount',
  currency: 'USD',
  timezone: 'America/Whitehorse',
  time: 'comment', // comment, narration
  tag: '#costflow',
  replacement: {
    'aapl': 'Assets:ETrade:AAPL',
    'boc': 'Assets:CN:BOC',
    'bofa': 'Assets:US:BofA:Checking',
    'cg': 'Income:Etrade:CapitalGains',
    'cmb': 'Liabilities:CreditCard:CMB',
    'eob': 'Equity:Opening-Balances',
    'food': 'Expenses:Food',
    'phone': 'Expenses:Home:Phone',
    'rent': 'Expenses:Home:Rent',
    'rx': 'Assets:Receivables:X',
    'ry': 'Assets:Receivables:Y'
  },
  alphavantage: 'YOUR_KEY_HERE', // https://www.alphavantage.co/support/
  indent: 2,
  lineLength: 60
}
let today = DateTime.local().setZone(testConfig.timezone).toFormat('y-LL-dd')

/*
  Part 1: Transaction
  Syntax: https://github.com/costflow/syntax/tree/master#transaction
*/

// Use >
test('Transaction #1.1', async () => {
  const data = await parser('2017-01-05 "RiverBank Properties" "Paying the rent" 2400 Assets:US:BofA:Checking > 2400  Expenses:Home:Rent', testConfig)
  expect(data.output).toBe(`2017-01-05 * "RiverBank Properties" "Paying the rent" #costflow
  Assets:US:BofA:Checking                       -2400.00 USD
  Expenses:Home:Rent                            +2400.00 USD`)
})
test('Transaction #1.2', async () => {
  const data = await parser('@Verizon 59.61 Assets:US:BofA:Checking > Expenses:Home:Phone', testConfig)
  expect(data.output).toBe(`${today} * "Verizon" "" #costflow
  Assets:US:BofA:Checking                         -59.61 USD
  Expenses:Home:Phone                             +59.61 USD`)
})

test('Transaction #1.3', async () => {
  const data = await parser('@Verizon 59.61 bofa > phone', testConfig)
  expect(data.output).toBe(`${today} * "Verizon" "" #costflow
  Assets:US:BofA:Checking                         -59.61 USD
  Expenses:Home:Phone                             +59.61 USD`)
})

test('Transaction #1.4', async () => {
  const data = await parser('Rent 750 cmb + 750 boc > rent', testConfig)
  expect(data.output).toBe(`${today} * "Rent" #costflow
  Liabilities:CreditCard:CMB                     -750.00 USD
  Assets:CN:BOC                                  -750.00 USD
  Expenses:Home:Rent                            +1500.00 USD`)
})

test('Transaction #1.5', async () => {
  const data = await parser('Dinner 180 CNY cmb > rx + ry + food', testConfig)
  expect(data.output).toBe(`${today} * "Dinner" #costflow
  Liabilities:CreditCard:CMB                     -180.00 CNY
  Assets:Receivables:X                            +60.00 CNY
  Assets:Receivables:Y                            +60.00 CNY
  Expenses:Food                                   +60.00 CNY`)
})

test('Transaction #1.6', async () => {
  const data = await parser('Transfer to account in US 5000 CNY @ 7.2681 USD boc > 726.81 USD bofa', testConfig)
  expect(data.output).toBe(`${today} * "Transfer to account in US" #costflow
  Assets:CN:BOC                                 -5000.00 CNY @ 7.2681 USD
  Assets:US:BofA:Checking                        +726.81 USD`)
})

test('Transaction #1.7', async () => {
  const data = await parser('Transfer to account in US 5000 CNY @@ 726.81 USD boc > 726.81 USD bofa', testConfig)
  expect(data.output).toBe(`${today} * "Transfer to account in US" #costflow
  Assets:CN:BOC                                 -5000.00 CNY @@ 726.81 USD
  Assets:US:BofA:Checking                        +726.81 USD`)
})

test('Transaction #1.8', async () => {
  const data = await parser('Bought shares of Apple 1915.5 bofa > 10 AAPL {191.55 USD} aapl', testConfig)
  expect(data.output).toBe(`${today} * "Bought shares of Apple" #costflow
  Assets:US:BofA:Checking                       -1915.50 USD
  Assets:ETrade:AAPL                             +10.00 AAPL {191.55 USD}`)
})

test('Transaction #1.9', async () => {
  const data = await parser('Sold shares of Apple 10 AAPL {191.55 USD} @ 201.55 USD aapl + 100 USD cg > 2015.5 bofa', testConfig)
  expect(data.output).toBe(`${today} * "Sold shares of Apple" #costflow
  Assets:ETrade:AAPL                             -10.00 AAPL {191.55 USD} @ 201.55 USD
  Income:Etrade:CapitalGains                     -100.00 USD
  Assets:US:BofA:Checking                       +2015.50 USD`)
})

// Use |

test('Transaction #2.1', async () => {
  const data = await parser('2017-01-05 "RiverBank Properties" "Paying the rent" | Assets:US:BofA:Checking -2400 | Expenses:Home:Rent 2400', testConfig)
  expect(data.output).toBe(`2017-01-05 * "RiverBank Properties" "Paying the rent" #costflow
  Assets:US:BofA:Checking                       -2400.00 USD
  Expenses:Home:Rent                            +2400.00 USD`)
})
test('Transaction #2.2', async () => {
  const data = await parser('@Verizon | Assets:US:BofA:Checking -59.61 | Expenses:Home:Phone 59.61', testConfig)
  expect(data.output).toBe(`${today} * "Verizon" "" #costflow
  Assets:US:BofA:Checking                         -59.61 USD
  Expenses:Home:Phone                             +59.61 USD`)
})

test('Transaction #2.3', async () => {
  const data = await parser('@Verizon | bofa -59.61 | phone 59.61', testConfig)
  expect(data.output).toBe(`${today} * "Verizon" "" #costflow
  Assets:US:BofA:Checking                         -59.61 USD
  Expenses:Home:Phone                             +59.61 USD`)
})

test('Transaction #2.4', async () => {
  const data = await parser('Rent | cmb -750 | boc -750 | rent 1500', testConfig)
  expect(data.output).toBe(`${today} * "Rent" #costflow
  Liabilities:CreditCard:CMB                     -750.00 USD
  Assets:CN:BOC                                  -750.00 USD
  Expenses:Home:Rent                            +1500.00 USD`)
})

test('Transaction #2.5', async () => {
  const data = await parser('Dinner | cmb -180 CNY | rx 60 CNY | ry 60 CNY | food 60 CNY', testConfig)
  expect(data.output).toBe(`${today} * "Dinner" #costflow
  Liabilities:CreditCard:CMB                     -180.00 CNY
  Assets:Receivables:X                            +60.00 CNY
  Assets:Receivables:Y                            +60.00 CNY
  Expenses:Food                                   +60.00 CNY`)
})

test('Transaction #2.6', async () => {
  const data = await parser('Transfer to account in US | boc -5000 CNY @ 7.2681 USD  | bofa +726.81', testConfig)
  expect(data.output).toBe(`${today} * "Transfer to account in US" #costflow
  Assets:CN:BOC                                 -5000.00 CNY @ 7.2681 USD
  Assets:US:BofA:Checking                        +726.81 USD`)
})

test('Transaction #2.7', async () => {
  const data = await parser('Transfer to account in US | boc -5000 CNY @@ 726.81 USD  | bofa +726.81', testConfig)
  expect(data.output).toBe(`${today} * "Transfer to account in US" #costflow
  Assets:CN:BOC                                 -5000.00 CNY @@ 726.81 USD
  Assets:US:BofA:Checking                        +726.81 USD`)
})

test('Transaction #2.8', async () => {
  const data = await parser('Bought shares of Apple | bofa -1915.5 | aapl 10 AAPL {191.55 USD}', testConfig)
  expect(data.output).toBe(`${today} * "Bought shares of Apple" #costflow
  Assets:US:BofA:Checking                       -1915.50 USD
  Assets:ETrade:AAPL                             +10.00 AAPL {191.55 USD}`)
})

test('Transaction #2.9', async () => {
  const data = await parser('Sold shares of Apple | aapl -10.00 AAPL {191.55 USD} @ 201.55 USD | cg -100.00 USD | bofa +2015.5', testConfig)
  expect(data.output).toBe(`${today} * "Sold shares of Apple" #costflow
  Assets:ETrade:AAPL                             -10.00 AAPL {191.55 USD} @ 201.55 USD
  Income:Etrade:CapitalGains                     -100.00 USD
  Assets:US:BofA:Checking                       +2015.50 USD`)
})

/*
  Part 2: Comment
  Syntax: https://github.com/costflow/syntax/tree/master#comment
*/
test('Comment #1', async () => {
  const data = await parser('; I paid and left the taxi, forgot to take change, it was cold.', testConfig)
  expect(data.output).toBe('; I paid and left the taxi, forgot to take change, it was cold.')
})
test('Comment #2', async () => {
  const data = await parser('// to do: cancel Netflix subscription.', testConfig)
  expect(data.output).toBe('to do: cancel Netflix subscription.')
})
test('Comment #3', async () => {
  const data = await parser('Hello World', testConfig)
  expect(data.output).toBe('Hello World')
})

/*
  Part 3: Open
  Syntax: https://github.com/costflow/syntax/tree/master#open
*/
test('Open #1', async () => {
  const data = await parser('2017-01-01 open Assets:US:BofA:Checking', testConfig)
  expect(data.output).toBe('2017-01-01 open Assets:US:BofA:Checking')
})
test('Open #2', async () => {
  const data = await parser('open Assets:CN:CMB', testConfig)
  expect(data.output).toBe(`${today} open Assets:CN:CMB`)
})
test('Open #3', async () => {
  const data = await parser('open Assets:CN:CMB CNY', testConfig)
  expect(data.output).toBe(`${today} open Assets:CN:CMB CNY`)
})

/*
  Part 4: Close
  Syntax: https://github.com/costflow/syntax/tree/master#close
*/
test('Close #1', async () => {
  const data = await parser('2017-01-01 close Assets:US:BofA:Checking', testConfig)
  expect(data.output).toBe('2017-01-01 close Assets:US:BofA:Checking')
})
test('Open #2', async () => {
  const data = await parser('close Assets:CN:CMB', testConfig)
  expect(data.output).toBe(`${today} close Assets:CN:CMB`)
})

/*
  Part 5: Commodity
  Syntax: https://github.com/costflow/syntax/tree/master#commodity
*/
test('Commodity #1', async () => {
  const data = await parser('1867-01-01 commodity CAD', testConfig)
  expect(data.output).toBe('1867-01-01 commodity CAD')
})
test('Commodity #2', async () => {
  const data = await parser('commodity HOOL', testConfig)
  expect(data.output).toBe(`${today} commodity HOOL`)
})

/*
  Part 6: Option
  Syntax: https://github.com/costflow/syntax/tree/master#option
*/
test('Option #1', async () => {
  const data = await parser('option Example Costflow file', testConfig)
  expect(data.output).toBe('option "title" "Example Costflow file"')
})
test('Option #2', async () => {
  const data = await parser('option CNY', testConfig)
  expect(data.output).toBe('option "operating_currency" "CNY"')
})
test('Option #3', async () => {
  const data = await parser('option "conversion_currency" "NOTHING"', testConfig)
  expect(data.output).toBe('option "conversion_currency" "NOTHING"')
})

/*
  Part 7: Note
  Syntax: https://github.com/costflow/syntax/tree/master#note
*/
test('Note #1', async () => {
  const data = await parser('2017-01-01 note Assets:US:BofA:Checking Called about fraudulent card.', testConfig)
  expect(data.output).toBe('2017-01-01 note Assets:US:BofA:Checking "Called about fraudulent card."')
})
test('Note #2', async () => {
  const data = await parser('note bofa Called about fraudulent card.', testConfig)
  expect(data.output).toBe(`${today} note Assets:US:BofA:Checking "Called about fraudulent card."`)
})

/*
  Part 8: Balance
  Syntax: https://github.com/costflow/syntax/tree/master#balance
*/
test('Balance #1', async () => {
  const data = await parser('2017-01-01 balance Assets:US:BofA:Checking 360 CNY', testConfig)
  expect(data.output).toBe('2017-01-01 balance Assets:US:BofA:Checking 360 CNY')
})
test('Balance #2', async () => {
  const data = await parser('balance bofa 1024', testConfig)
  expect(data.output).toBe(`${today} balance Assets:US:BofA:Checking 1024 USD`)
})

/*
  Part 9: Pad
  Syntax: https://github.com/costflow/syntax/tree/master#pad
*/
test('Pad #1', async () => {
  const data = await parser('pad bofa eob', testConfig)
  expect(data.output).toBe(`${today} pad Assets:US:BofA:Checking Equity:Opening-Balances`)
})

/*
  Part 10: Price
  Syntax: https://github.com/costflow/syntax/tree/master#price
  Note: Tests might fail due to the API rate limit. https://www.alphavantage.co/support/
*/
test('Price #1', async () => {
  const data = await parser('2017-01-17 price USD 1.08 CAD', testConfig)
  expect(data.output).toBe(`2017-01-17 price USD 1.08 CAD`)
})
test('Price #2', async () => {
  let exchange = await alphavantage.exchange(testConfig.alphavantage, 'USD', 'CNY')
  const data = await parser('price USD to CNY', testConfig)
  expect(data.output).toBe(`${today} price USD ${exchange.rate} CNY`)
})
test('Price #3', async () => {
  let quote = await alphavantage.quote(testConfig.alphavantage, 'AAPL')
  const data = await parser('price AAPL', testConfig)
  expect(data.output).toBe(`${today} price AAPL ${quote.price} USD`)
})
/*
  Part 11: $ Snap
  Syntax: https://github.com/costflow/syntax/tree/master#snap
  Note: Tests might fail due to the API rate limit. https://www.alphavantage.co/support/
*/

test('Snap #1', async () => {
  let exchange = await alphavantage.exchange(testConfig.alphavantage, 'CAD', 'USD')
  const data = await parser('$ CAD', testConfig)
  expect(data.output).toBe(`1 CAD = ${exchange.rate} USD`)
})

test('Snap #2', async () => {
  let exchange = await alphavantage.exchange(testConfig.alphavantage, 'USD', 'CNY')
  const data = await parser('$ 100 USD to CNY', testConfig)
  expect(data.output).toBe(`100 USD = ${exchange.rate} CNY`)
})

test('Snap #3', async () => {
  let quote = await alphavantage.quote(testConfig.alphavantage, 'AAPL')
  const data = await parser('$ 200 AAPL', testConfig)
  expect(data.output).toBe(`AAPL ${quote.price} (${quote.percent})\n200 AAPL = ${Number(quote.price * 200).toFixed(2)}`)
})

/*
  Part 12: Event
  Syntax: https://github.com/costflow/syntax/tree/master#event
*/
test('Event #1', async () => {
  const data = await parser('2017-01-02 event "location" "Paris, France"', testConfig)
  expect(data.output).toBe('2017-01-02 event "location" "Paris, France"')
})
test('Event #2', async () => {
  const data = await parser('event location Paris, Francce', testConfig)
  expect(data.output).toBe(`${today} event "location" "Paris, Francce"`)
})

/*
  Part 13: Errors
*/
// todo: no config, api error, use > and | at same time, etc.
