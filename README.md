# Costflow Parser

Costflow Parser is a library for parsing plain text to Beancount/Ledger/hledger formats. [Costflow](https://www.costflow.io/) use it for parsing messages from messaging apps, and save the results to your ledger file.

[Costflow Syntax](https://github.com/costflow/syntax) Version: v0.2

## Docs
[https://docs.costflow.io/syntax/](https://docs.costflow.io/syntax/)

## Features
- Date is optional, the default value is ‘today’ in your timezone.
- Currency/Commodity code is optional.
- Account name replacements. E.g. bofa in your message will be replaced with Assets:US:BofA:Checking.
- Get real time price for exchanging rate or stock, even cryptocurrency.
- Simple transaction syntax.
- Custom indent and line length.
- Insert time to every transaction.

Playground: [https://playground.costflow.io](https://playground.costflow.io)

# Roadmap
[https://github.com/orgs/costflow/projects](https://github.com/orgs/costflow/projects)

Check out [Costflow Syntax](https://github.com/costflow/syntax) for more information.

