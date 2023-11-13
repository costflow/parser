# Costflow Parser

Costflow Parser is a double-entry bookkeeping library that parses plain text to JSON or Beancount/Ledger/hledger formats using [Costflow Syntax](https://www.costflow.io/docs/syntax/).

[Costflow Syntax](https://www.costflow.io/docs/syntax/) Version: v1.0

## Docs

[https://www.costflow.io/docs/](https://www.costflow.io/docs/)

## Installing

Using npm:

```
npm install costflow
```

Using yarn:

```
yarn add costflow
```

## Example

```js
import costflow from "costflow";
// or imports with `require()`
const costflow = require("costflow");

const config = {
  mode: "beancount",
  currency: "USD",
  timezone: "America/Los_Angeles",
  account: {
    visa: "Liabilities:Visa",
    music: "Expenses:Music",
  },
  formula: {
    spotify: "@Spotify #music 15.98 USD visa > music",
  },
};

const fn = async () => {
  const result = await costflow("spotify", config);
  console.log(result);
};
fn();
```

## Features

- Date is optional, the default value is "today" in your timezone.
- Currency/Commodity code is optional.
- Account name replacements. E.g. `bofa` could be replaced with `Assets:US:BofA:Checking`.
- Formula. Creating patterned transactions such as Netflix/Spotify subscription is easier than ever.
- Get real time price for exchanging rate or stock, even cryptocurrency.
- Simple transaction syntax.
- Custom indent and line length.
- Insert time to every transaction.

Playground: [https://playground.costflow.io](https://playground.costflow.io)

## Donate

Thank you for considering donating to Costflow. You can use one of the following methods:

- Buy Me a Coffee: https://www.buymeacoffee.com/leplay
- 支付宝 <br/> <img src="https://www.costflow.io/img/alipay.jpg" alt="Alipay" width="400"/>
- 微信 <br/> <img src="https://www.costflow.io/img/wechat.png" alt="Wechat" width="400"/>

## Author

[leplay](http://leplay.net/)

## License

### Commercial license

If you want to use Costflow Parser to develop non open sourced sites, projects, and applications, the Commercial license is the appropriate license. With this option, your source code is kept proprietary. Which means, you won't have to change your whole application source code to an open source license. [[Purchase a Commercial License]](https://www.costflow.io/)

### Open source license

If you are creating an open source application under a license compatible with the [GNU GPL license v3](https://www.gnu.org/licenses/gpl-3.0.html), you may use Costflow Parser under the terms of the GPLv3.

**The credit comments in the JavaScript and CSS files should be kept intact** (even after combination or minification)
