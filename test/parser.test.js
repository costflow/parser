const { DateTime } = require('luxon')
const costflow = require('../index')
const alphavantage = require('../src/alphavantage')

const testConfig = {
  mode: 'beancount',
  currency: 'USD',
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
const today = DateTime.local().setZone(testConfig.timezone)

// /*
//   Part 0: Date
// */
// test('Date #0.1', async () => {
//   const data = await costflow.parse('2017-01-05 Lorem Ipsum', testConfig)
//   expect(data.date).toBe('2017-01-05')
// })
// test('Date #0.2', async () => {
//   const data = await costflow.parse('Lorem Ipsum', testConfig)
//   expect(data.date).toBe(today.toFormat('y-LL-dd'))
// })
// test('Date #0.3', async () => {
//   const data = await costflow.parse('ytd Lorem Ipsum', testConfig)
//   expect(data.date).toBe(today.minus({ days: 1 }).toFormat('y-LL-dd'))
// })
// test('Date #0.4', async () => {
//   const data = await costflow.parse('yesterday Lorem Ipsum', testConfig)
//   expect(data.date).toBe(today.minus({ days: 1 }).toFormat('y-LL-dd'))
// })
// test('Date #0.5', async () => {
//   const data = await costflow.parse('dby Lorem Ipsum', testConfig)
//   expect(data.date).toBe(today.minus({ days: 2 }).toFormat('y-LL-dd'))
// })
// test('Date #0.6', async () => {
//   const data = await costflow.parse('tmr Lorem Ipsum', testConfig)
//   expect(data.date).toBe(today.plus({ days: 1 }).toFormat('y-LL-dd'))
// })
// test('Date #0.7', async () => {
//   const data = await costflow.parse('tomorrow Lorem Ipsum', testConfig)
//   expect(data.date).toBe(today.plus({ days: 1 }).toFormat('y-LL-dd'))
// })
// test('Date #0.8', async () => {
//   const data = await costflow.parse('dat Lorem Ipsum', testConfig)
//   expect(data.date).toBe(today.plus({ days: 2 }).toFormat('y-LL-dd'))
// })

// test('Date #0.9', async () => {
//   const data = await costflow.parse('Aug 9 Lorem Ipsum', testConfig)
//   expect(data.date).toBe(`${today.year}-08-09`)
// })
// test('Date #1.0', async () => {
//   const data = await costflow.parse('July 07 Lorem Ipsum', testConfig)
//   expect(data.date).toBe(`${today.year}-07-07`)
// })

// /*
//   Part 1: Transaction
//   Syntax: https://github.com/costflow/syntax/tree/master#transaction
// */

// // Use >
// test('Transaction #1.1', async () => {
//   const data = await costflow.parse('2017-01-05 "RiverBank Properties" "Paying the rent" 2400 Assets:US:BofA:Checking > 2400  Expenses:Home:Rent', testConfig)
//   expect(data.output).toBe(`2017-01-05 * "RiverBank Properties" "Paying the rent" #costflow
//   Assets:US:BofA:Checking                       -2400.00 USD
//   Expenses:Home:Rent                            +2400.00 USD`)
// })
// test('Transaction #1.2', async () => {
//   const data = await costflow.parse('@Verizon 59.61 Assets:US:BofA:Checking > Expenses:Home:Phone', testConfig)
//   expect(data.output).toBe(`${today.toFormat('y-LL-dd')} * "Verizon" "" #costflow
//   Assets:US:BofA:Checking                         -59.61 USD
//   Expenses:Home:Phone                             +59.61 USD`)
// })

// test('Transaction #1.3', async () => {
//   const data = await costflow.parse('@Verizon 59.61 bofa > phone', testConfig)
//   expect(data.output).toBe(`${today.toFormat('y-LL-dd')} * "Verizon" "" #costflow
//   Assets:US:BofA:Checking                         -59.61 USD
//   Expenses:Home:Phone                             +59.61 USD`)
// })

// test('Transaction #1.4', async () => {
//   const data = await costflow.parse('Rent 750 cmb + 750 boc > rent', testConfig)
//   expect(data.output).toBe(`${today.toFormat('y-LL-dd')} * "Rent" #costflow
//   Liabilities:CreditCard:CMB                     -750.00 USD
//   Assets:CN:BOC                                  -750.00 USD
//   Expenses:Home:Rent                            +1500.00 USD`)
// })

// test('Transaction #1.5', async () => {
//   const data = await costflow.parse('Dinner 180 CNY cmb > rx + ry + food', testConfig)
//   expect(data.output).toBe(`${today.toFormat('y-LL-dd')} * "Dinner" #costflow
//   Liabilities:CreditCard:CMB                     -180.00 CNY
//   Assets:Receivables:X                            +60.00 CNY
//   Assets:Receivables:Y                            +60.00 CNY
//   Expenses:Food                                   +60.00 CNY`)
// })

// test('Transaction #1.6', async () => {
//   const data = await costflow.parse('Transfer to account in US 5000 CNY @ 7.2681 USD boc > 726.81 USD bofa', testConfig)
//   expect(data.output).toBe(`${today.toFormat('y-LL-dd')} * "Transfer to account in US" #costflow
//   Assets:CN:BOC                                 -5000.00 CNY @ 7.2681 USD
//   Assets:US:BofA:Checking                        +726.81 USD`)
// })

// test('Transaction #1.7', async () => {
//   const data = await costflow.parse('Transfer to account in US 5000 CNY @@ 726.81 USD boc > 726.81 USD bofa', testConfig)
//   expect(data.output).toBe(`${today.toFormat('y-LL-dd')} * "Transfer to account in US" #costflow
//   Assets:CN:BOC                                 -5000.00 CNY @@ 726.81 USD
//   Assets:US:BofA:Checking                        +726.81 USD`)
// })

// test('Transaction #1.8', async () => {
//   const data = await costflow.parse('Bought shares of Apple 1915.5 bofa > 10 AAPL {191.55 USD} aapl', testConfig)
//   expect(data.output).toBe(`${today.toFormat('y-LL-dd')} * "Bought shares of Apple" #costflow
//   Assets:US:BofA:Checking                       -1915.50 USD
//   Assets:ETrade:AAPL                             +10.00 AAPL {191.55 USD}`)
// })

// test('Transaction #1.9', async () => {
//   const data = await costflow.parse('Sold shares of Apple 10 AAPL {191.55 USD} @ 201.55 USD aapl + 100 USD cg > 2015.5 bofa', testConfig)
//   expect(data.output).toBe(`${today.toFormat('y-LL-dd')} * "Sold shares of Apple" #costflow
//   Assets:ETrade:AAPL                             -10.00 AAPL {191.55 USD} @ 201.55 USD
//   Income:Etrade:CapitalGains                     -100.00 USD
//   Assets:US:BofA:Checking                       +2015.50 USD`)
// })

// test('Transaction #1.10', async () => {
//   const data = await costflow.parse('@麦当劳 #food #mc 180 CNY cmb > food', testConfig)
//   expect(data.output).toBe(`${today.toFormat('y-LL-dd')} * "麦当劳" "" #food #mc #costflow
//   Liabilities:CreditCard:CMB                     -180.00 CNY
//   Expenses:Food                                  +180.00 CNY`)
// })

// // Use |

// test('Transaction #2.1', async () => {
//   const data = await costflow.parse('2017-01-05 "RiverBank Properties" "Paying the rent" | Assets:US:BofA:Checking -2400 | Expenses:Home:Rent 2400', testConfig)
//   expect(data.output).toBe(`2017-01-05 * "RiverBank Properties" "Paying the rent" #costflow
//   Assets:US:BofA:Checking                       -2400.00 USD
//   Expenses:Home:Rent                            +2400.00 USD`)
// })
// test('Transaction #2.2', async () => {
//   const data = await costflow.parse('@Verizon | Assets:US:BofA:Checking -59.61 | Expenses:Home:Phone 59.61', testConfig)
//   expect(data.output).toBe(`${today.toFormat('y-LL-dd')} * "Verizon" "" #costflow
//   Assets:US:BofA:Checking                         -59.61 USD
//   Expenses:Home:Phone                             +59.61 USD`)
// })

// test('Transaction #2.3', async () => {
//   const data = await costflow.parse('@Verizon | bofa -59.61 | phone 59.61', testConfig)
//   expect(data.output).toBe(`${today.toFormat('y-LL-dd')} * "Verizon" "" #costflow
//   Assets:US:BofA:Checking                         -59.61 USD
//   Expenses:Home:Phone                             +59.61 USD`)
// })

// test('Transaction #2.4', async () => {
//   const data = await costflow.parse('Rent | cmb -750 | boc -750 | rent 1500', testConfig)
//   expect(data.output).toBe(`${today.toFormat('y-LL-dd')} * "Rent" #costflow
//   Liabilities:CreditCard:CMB                     -750.00 USD
//   Assets:CN:BOC                                  -750.00 USD
//   Expenses:Home:Rent                            +1500.00 USD`)
// })

// test('Transaction #2.5', async () => {
//   const data = await costflow.parse('Dinner | cmb -180 CNY | rx 60 CNY | ry 60 CNY | food 60 CNY', testConfig)
//   expect(data.output).toBe(`${today.toFormat('y-LL-dd')} * "Dinner" #costflow
//   Liabilities:CreditCard:CMB                     -180.00 CNY
//   Assets:Receivables:X                            +60.00 CNY
//   Assets:Receivables:Y                            +60.00 CNY
//   Expenses:Food                                   +60.00 CNY`)
// })

// test('Transaction #2.6', async () => {
//   const data = await costflow.parse('Transfer to account in US | boc -5000 CNY @ 7.2681 USD  | bofa +726.81', testConfig)
//   expect(data.output).toBe(`${today.toFormat('y-LL-dd')} * "Transfer to account in US" #costflow
//   Assets:CN:BOC                                 -5000.00 CNY @ 7.2681 USD
//   Assets:US:BofA:Checking                        +726.81 USD`)
// })

// test('Transaction #2.7', async () => {
//   const data = await costflow.parse('Transfer to account in US | boc -5000 CNY @@ 726.81 USD  | bofa +726.81', testConfig)
//   expect(data.output).toBe(`${today.toFormat('y-LL-dd')} * "Transfer to account in US" #costflow
//   Assets:CN:BOC                                 -5000.00 CNY @@ 726.81 USD
//   Assets:US:BofA:Checking                        +726.81 USD`)
// })

// test('Transaction #2.8', async () => {
//   const data = await costflow.parse('Bought shares of Apple | bofa -1915.5 | aapl 10 AAPL {191.55 USD}', testConfig)
//   expect(data.output).toBe(`${today.toFormat('y-LL-dd')} * "Bought shares of Apple" #costflow
//   Assets:US:BofA:Checking                       -1915.50 USD
//   Assets:ETrade:AAPL                             +10.00 AAPL {191.55 USD}`)
// })

// test('Transaction #2.9', async () => {
//   const data = await costflow.parse('Sold shares of Apple | aapl -10.00 AAPL {191.55 USD} @ 201.55 USD | cg -100.00 USD | bofa +2015.5', testConfig)
//   expect(data.output).toBe(`${today.toFormat('y-LL-dd')} * "Sold shares of Apple" #costflow
//   Assets:ETrade:AAPL                             -10.00 AAPL {191.55 USD} @ 201.55 USD
//   Income:Etrade:CapitalGains                     -100.00 USD
//   Assets:US:BofA:Checking                       +2015.50 USD`)
// })

// test('Transaction #2.10', async () => {
//   const data = await costflow.parse('@麦当劳 #food #mc | cmb -180 CNY | food 180 CNY', testConfig)
//   expect(data.output).toBe(`${today.toFormat('y-LL-dd')} * "麦当劳" "" #food #mc #costflow
//   Liabilities:CreditCard:CMB                     -180.00 CNY
//   Expenses:Food                                  +180.00 CNY`)
// })

// /*
//   Part 2: Comment
//   Syntax: https://github.com/costflow/syntax/tree/master#comment
// */
// test('Comment #1', async () => {
//   const data = await costflow.parse('; I paid and left the taxi, forgot to take change, it was cold.', testConfig)
//   expect(data.output).toBe('; I paid and left the taxi, forgot to take change, it was cold.')
// })
// test('Comment #2', async () => {
//   const data = await costflow.parse('// to do: cancel Netflix subscription.', testConfig)
//   expect(data.output).toBe('to do: cancel Netflix subscription.')
// })
// test('Comment #3', async () => {
//   const data = await costflow.parse('Hello World', testConfig)
//   expect(data.output).toBe('Hello World')
// })

// /*
//   Part 3: Open
//   Syntax: https://github.com/costflow/syntax/tree/master#open
// */
// test('Open #1', async () => {
//   const data = await costflow.parse('2017-01-01 open Assets:US:BofA:Checking', testConfig)
//   expect(data.output).toBe('2017-01-01 open Assets:US:BofA:Checking')
// })
// test('Open #2', async () => {
//   const data = await costflow.parse('open Assets:CN:CMB', testConfig)
//   expect(data.output).toBe(`${today.toFormat('y-LL-dd')} open Assets:CN:CMB`)
// })
// test('Open #3', async () => {
//   const data = await costflow.parse('open Assets:CN:CMB CNY', testConfig)
//   expect(data.output).toBe(`${today.toFormat('y-LL-dd')} open Assets:CN:CMB CNY`)
// })

// /*
//   Part 4: Close
//   Syntax: https://github.com/costflow/syntax/tree/master#close
// */
// test('Close #1', async () => {
//   const data = await costflow.parse('2017-01-01 close Assets:US:BofA:Checking', testConfig)
//   expect(data.output).toBe('2017-01-01 close Assets:US:BofA:Checking')
// })
// test('Open #2', async () => {
//   const data = await costflow.parse('close Assets:CN:CMB', testConfig)
//   expect(data.output).toBe(`${today.toFormat('y-LL-dd')} close Assets:CN:CMB`)
// })

// /*
//   Part 5: Commodity
//   Syntax: https://github.com/costflow/syntax/tree/master#commodity
// */
// test('Commodity #1', async () => {
//   const data = await costflow.parse('1867-01-01 commodity CAD', testConfig)
//   expect(data.output).toBe('1867-01-01 commodity CAD')
// })
// test('Commodity #2', async () => {
//   const data = await costflow.parse('commodity HOOL', testConfig)
//   expect(data.output).toBe(`${today.toFormat('y-LL-dd')} commodity HOOL`)
// })

// /*
//   Part 6: Option
//   Syntax: https://github.com/costflow/syntax/tree/master#option
// */
// test('Option #1', async () => {
//   const data = await costflow.parse('option Example Costflow file', testConfig)
//   expect(data.output).toBe('option "title" "Example Costflow file"')
// })
// test('Option #2', async () => {
//   const data = await costflow.parse('option CNY', testConfig)
//   expect(data.output).toBe('option "operating_currency" "CNY"')
// })
// test('Option #3', async () => {
//   const data = await costflow.parse('option "conversion_currency" "NOTHING"', testConfig)
//   expect(data.output).toBe('option "conversion_currency" "NOTHING"')
// })

// /*
//   Part 7: Note
//   Syntax: https://github.com/costflow/syntax/tree/master#note
// */
// test('Note #1', async () => {
//   const data = await costflow.parse('2017-01-01 note Assets:US:BofA:Checking Called about fraudulent card.', testConfig)
//   expect(data.output).toBe('2017-01-01 note Assets:US:BofA:Checking "Called about fraudulent card."')
// })
// test('Note #2', async () => {
//   const data = await costflow.parse('note bofa Called about fraudulent card.', testConfig)
//   expect(data.output).toBe(`${today.toFormat('y-LL-dd')} note Assets:US:BofA:Checking "Called about fraudulent card."`)
// })

// /*
//   Part 8: Balance
//   Syntax: https://github.com/costflow/syntax/tree/master#balance
// */
// test('Balance #1', async () => {
//   const data = await costflow.parse('2017-01-01 balance Assets:US:BofA:Checking 360 CNY', testConfig)
//   expect(data.output).toBe('2017-01-01 balance Assets:US:BofA:Checking 360 CNY')
// })
// test('Balance #2', async () => {
//   const data = await costflow.parse('tmr balance bofa 1024', testConfig)
//   expect(data.output).toBe(`${today.plus({ days: 1 }).toFormat('y-LL-dd')} balance Assets:US:BofA:Checking 1024 USD`)
// })

// /*
//   Part 9: Pad
//   Syntax: https://github.com/costflow/syntax/tree/master#pad
// */
// test('Pad #1', async () => {
//   const data = await costflow.parse('pad bofa eob', testConfig)
//   expect(data.output).toBe(`${today.toFormat('y-LL-dd')} pad Assets:US:BofA:Checking Equity:Opening-Balances`)
// })

// /*
//   Part 10: Price
//   Syntax: https://github.com/costflow/syntax/tree/master#price
//   Note: Tests might fail due to the API rate limit. https://www.alphavantage.co/support/
// */
// test('Price #1', async () => {
//   const data = await costflow.parse('2017-01-17 price USD 1.08 CAD', testConfig)
//   expect(data.output).toBe('2017-01-17 price USD 1.08 CAD')
// })
// test('Price #2', async () => {
//   const exchange = await alphavantage.exchange(testConfig.alphavantage, 'USD', 'CNY')
//   const data = await costflow.parse('price USD to CNY', testConfig)
//   expect(data.output).toBe(`${today.toFormat('y-LL-dd')} price USD ${exchange.rate} CNY`)
// })
// test('Price #3', async () => {
//   const quote = await alphavantage.quote(testConfig.alphavantage, 'AAPL')
//   const data = await costflow.parse('price AAPL', testConfig)
//   expect(data.output).toBe(`${today.toFormat('y-LL-dd')} price AAPL ${quote.price} USD`)
// })

// /*
//   Part 11: $ Snap
//   Syntax: https://github.com/costflow/syntax/tree/master#snap
//   Note: Tests might fail due to the API rate limit. https://www.alphavantage.co/support/
// */

// test('Snap #1', async () => {
//   const exchange = await alphavantage.exchange(testConfig.alphavantage, 'CAD', 'USD')
//   const data = await costflow.parse('$ CAD', testConfig)
//   expect(data.output).toBe(`1 CAD = ${exchange.rate} USD`)
// })

// test('Snap #2', async () => {
//   const exchange = await alphavantage.exchange(testConfig.alphavantage, 'USD', 'CNY')
//   const data = await costflow.parse('$ 100 USD to CNY', testConfig)
//   expect(data.output).toBe(`100 USD = ${exchange.rate} CNY`)
// })

// test('Snap #3', async () => {
//   const quote = await alphavantage.quote(testConfig.alphavantage, 'AAPL')
//   const data = await costflow.parse('$ 200 AAPL', testConfig)
//   expect(data.output).toBe(`AAPL ${quote.price} (${quote.percent})\n200 AAPL = ${Number(quote.price * 200).toFixed(2)}`)
// })
//
// /*
//   Part 12: Event
//   Syntax: https://github.com/costflow/syntax/tree/master#event
// */
// test('Event #1', async () => {
//   const data = await costflow.parse('2017-01-02 event "location" "Paris, France"', testConfig)
//   expect(data.output).toBe('2017-01-02 event "location" "Paris, France"')
// })
// test('Event #2', async () => {
//   const data = await costflow.parse('event location Paris, Francce', testConfig)
//   expect(data.output).toBe(`${today.toFormat('y-LL-dd')} event "location" "Paris, Francce"`)
// })

/*
  Part 13: Formula
*/
test('Formula #1', async () => {
  const data = await costflow.parse('f spotify', testConfig)
  expect(data.output).toBe(`${today.toFormat('y-LL-dd')} * "Spotify" "" #costflow
  Liabilities:CreditCard:Visa                     -15.98 USD
  Expenses:Subscriptions                          +15.98 USD`)
})
test('Formula #2', async () => {
  const data = await costflow.parse('gcp 12.50', testConfig)
  expect(data.output).toBe(`${today.toFormat('y-LL-dd')} * "Google" "" #costflow
  Liabilities:CreditCard:Visa                     -12.50 USD
  Expenses:Cloud                                  +12.50 USD`)
})

test('Formula #3', async () => {
  const data = await costflow.parse('f c2f @KFC 36', testConfig)
  expect(data.output).toBe(`${today.toFormat('y-LL-dd')} * "KFC" "" #costflow
  Liabilities:CreditCard:CMB                      -36.00 USD
  Expenses:Food                                   +36.00 USD`)
})

test('Formula #4', async () => {
  const data = await costflow.parse('☕️ 4.2', testConfig)
  expect(data.output).toBe(`${today.toFormat('y-LL-dd')} * "Leplays" "☕️" #costflow
  Liabilities:CreditCard:Visa                      -4.20 USD
  Expenses:Coffee                                  +4.20 USD`)
})

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
