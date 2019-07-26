# Costflow Parser

Costflow Parser is a library for parsing plain text to Beancount/Ledger/hledger formats. [Costflow](https://www.costflow.io/) use it for parsing messages from messaging apps, and save the results to your ledger file.

[Costflow Syntax](https://github.com/costflow/syntax) Version: v0.1
Playground: [https://playground.costflow.io](https://playground.costflow.io)

## Features
- Date is optional, the default value is ‘today’ in your timezone;
- Currency/Commodity code is optional;
- Account name replacements. E.g. bofa in your message will be replaced with Assets:US:BofA:Checking;
- Get real time price for exchanging rate or stock, even cryptocurrency;
- Simple transaction syntax;
- Custom indent and line length;

## Installing

```
$ npm install costflow
```

## Example

```javascript
const costflow = require('costflow')

const config = {
  mode: 'beancount',
  currency: 'USD',
  timezone: 'America/Whitehorse',
  tag: '#costflow',
  replacement: {
    'aapl': 'Assets:ETrade:AAPL',
    'bofa': 'Assets:US:BofA:Checking',
    'phone': 'Expenses:Home:Phone',
  },
  alphavantage: 'YOUR_KEY_HERE',
  indent: 2,
  lineLength: 60
}

costflow.parse('@Verizon 59.61 bofa > phone', config).then(function (response) {
  console.log(response)
})

// Want to use async/await? Add the `async` keyword to your outer function/method.
async function test() {
  try {
    const response = await costflow.parse('@Verizon 59.61 bofa > phone', config)
    console.log(response);
  } catch (error) {
    console.error(error);
  }
}
```

## Parser Config
```javascript
{
  // 'mode' is the format that parser will output. Only 'beancount' is available in Costflow Syntax V0.1.
  mode: 'beancount',

  // 'currency' will be applied when currency/commodity not found.
  currency: 'USD',

  // 'timezone' should be one of IANA-specified zones.
  // You can get your timezone by running
  // Intl.DateTimeFormat().resolvedOptions().timeZone
  // in your browser console.
  timezone: 'America/Whitehorse',

  // 'tag' will be inserted to every transaction.
  tag: '#costflow',

  // The keys in 'replacement' will be replaced with values in transactions.
  replacement: {
    'aapl': 'Assets:ETrade:AAPL',
    'bofa': 'Assets:US:BofA:Checking',
    'phone': 'Expenses:Home:Phone',
  },

  // 'alphavantage' is for getting the exchange rates or stock price. Get your key here https://www.alphavantage.co/support/
  alphavantage: 'YOUR_KEY_HERE',

  // 'indent' is the length before account name in transactions.
  indent: 2,

  // 'lineLength' is the length before the commodity (include) in transactions.
  lineLength: 60
}
```


Check out [Costflow Syntax](https://github.com/costflow/syntax) for more information.

