# Costflow Parser

Costflow Parser is a double-entry bookkeeping library that parses plain text to JSON or Beancount/Ledger/hledger formats using [Costflow Syntax](https://docs.costflow.io/).

[Costflow Syntax](https://docs.costflow.io/syntax/) Version: v1.0

## Docs

[https://docs.costflow.io/](https://docs.costflow.io/)

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
const costflow = require("costflow").default;

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
  await costflow.parse("spotify", config);
};
fn();
```

## Features

- Date is optional, the default value is "today" in your timezone.
- Currency/Commodity code is optional.
- Account name replacements. E.g. bofa could be replaced with Assets:US:BofA:Checking.
- Formula. Creating patterned transactions such as Netflix/Spotify subscription is easier than ever.
- Get real time price for exchanging rate or stock, even cryptocurrency.
- Simple transaction syntax.
- Custom indent and line length.
- Insert time to every transaction.

Playground: [https://playground.costflow.io](https://playground.costflow.io)

## License

### Commercial license

If you want to use Costflow Parser to develop non open sourced sites, projects, and applications, the Commercial license is the appropriate license. With this option, your source code is kept proprietary. Which means, you won't have to change your whole application source code to an open source license. [[Purchase a Commercial License]](https://www.costflow.io/)

### Open source license

If you are creating an open source application under a license compatible with the [GNU GPL license v3](https://www.gnu.org/licenses/gpl-3.0.html), you may use Costflow Parser under the terms of the GPLv3.

**The credit comments in the JavaScript and CSS files should be kept intact** (even after combination or minification)

# Roadmap

[https://github.com/orgs/costflow/projects](https://github.com/orgs/costflow/projects)

Check out [Costflow Syntax](https://docs.costflow.io/) for more information.
