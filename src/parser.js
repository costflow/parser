/*
  Syntax: https://github.com/costflow/syntax
  Version: 0.0.1
*/

const { DateTime } = require('luxon')
const { currencyList, currencyReg } = require('../config/currency-codes')
const { cryptoList } = require('../config/crypto-currency-codes')
const alphavantage = require('./alphavantage')

const parseTransaction = function (transaction, config, defaultSign, calculatedAmount, calculatedCommodity) {
  transaction = transaction.trim()
  if (!transaction) return {}

  let atPriceCost = transaction.match(/@(.*)([A-Z])\b/g)
  if (atPriceCost) {
    transaction = transaction.replace(atPriceCost[0], '')
  }

  let heldAtCost = transaction.match(/{([^}]+)}/g)
  if (heldAtCost) {
    transaction = transaction.replace(heldAtCost[0], '')
  }

  let commodity
  if (calculatedCommodity) {
    commodity = calculatedCommodity
  } else {
    commodity = transaction.match(/[A-Z]+(?:\s|$)/g)
    commodity = commodity ? commodity[0] : config.currency
  }

  let amount
  if (calculatedAmount) {
    amount = calculatedAmount.toString()
  } else {
    amount = transaction.match(/[+-]?(\d*\.)?\d+/g)
    amount = amount ? amount[0] : null
  }

  let account = transaction.replace(commodity, '').replace(amount, '').trim()
  account = config.replacement[account] || account
  let startPart = ''
  startPart += Array(config.indent).fill(' ').join('')
  startPart += `${account}`

  let endPart = `${defaultSign || (Number(amount) > 0 ? '+' : '')}${Number(amount).toFixed(2)} ${commodity.trim()}`
  let line = `\n${startPart} ${Array(Math.max(config.lineLength - startPart.length - endPart.length - 2, 1)).fill(' ').join('')} ${endPart.trim()}`

  if (heldAtCost) {
    line += ' ' + heldAtCost[0]
  }
  if (atPriceCost) {
    line += ' ' + atPriceCost[0]
  }

  return {
    line,
    account,
    amount: Number(amount),
    commodity
  }
}

const parser = async function (input, config) {
  let backup = input
  config = Object.assign({
    mode: 'beancount',
    tag: '#costflow',
    indent: 2,
    lineLength: 80
  }, config)

  let tags = []
  let links = []
  let amount = null

  let allCurrencyReg = new RegExp(`\\b(${currencyList.concat(cryptoList).join('|')})\\b`, 'g')
  let accountReg = new RegExp('(Assets|Liabilities|Equity|Income|Expenses)(?::[a-zA-Z0-9]+)*', 'g')

  // date
  let dateReg = /^(\d{4})-(\d{2})-(\d{2})/g
  let today = config.timezone ? DateTime.local().setZone(config.timezone).toFormat('y-LL-dd') : DateTime.local().toFormat('y-LL-dd')
  let date = input.match(dateReg) && input.match(dateReg).length ? input.match(dateReg)[0] : null
  input = date ? input.slice(date.length).trim() : input.trim()
  date = date || today

  // commands
  let commandReg = /^(\*|!|;|\/\/|open|close|pad|\$|balance|price|commodity|note|event|option)/g
  let command = input.match(commandReg) && input.match(commandReg).length ? input.match(commandReg)[0] : null
  input = command ? input.slice(command.length).trim() : input.trim()

  let amountReg = /\b[+-]?(\d*\.)?\d+\b/g
  let amounts = input.match(amountReg)
  amounts = amounts ? amounts.map(n => Number(n)) : amounts

  let doubleQuotesReg = /".*?"/g
  let doubleQuotes = input.match(doubleQuotesReg)

  // beancount
  let output = ''
  switch (command) {
    case ';':
      output = `${backup}`
      break
    case '//':
      output = `${backup.replace('//', '').trim()}`
      break
    case 'open':
    case 'close':
    case 'commodity':
      output = `${date} ${command} ${input}`
      break
    case 'option':
      let currencyInOption = input.match(currencyReg)
      if (doubleQuotes) {
        output = `${command} ${input}`
      } else if (currencyInOption) {
        output = `${command} "operating_currency" "${currencyInOption}"`
      } else {
        output = `${command} "title" "${input}"`
      }
      break
    case 'note':
      let accountInNote = input.split(' ')[0]
      if (config.replacement[accountInNote]) {
        input = input.slice(accountInNote.length).trim()
        accountInNote = config.replacement[accountInNote]
      } else if (input.match(accountReg)) {
        accountInNote = input.match(accountReg)[0]
        input = input.slice(accountInNote.length).trim()
      }
      output = `${date} ${command} ${accountInNote} ${doubleQuotes ? input : '"' + input + '"'}`
      break
    case 'balance':
      let tmpBalanceArr = input.split(' ')
      let accountInBalance = tmpBalanceArr[0]
      let lastWordInBalance = tmpBalanceArr[tmpBalanceArr.length - 1]
      let isLastWordInBalanceNumber = lastWordInBalance.match(/[+-]?(\d*\.)?\d+(?:\s|$)/g)
      if (config.replacement[accountInBalance]) {
        input = input.slice(accountInBalance.length).trim()
        accountInBalance = config.replacement[accountInBalance]
      } else if (input.match(accountReg)) {
        accountInBalance = input.match(accountReg)[0]
        input = input.slice(accountInBalance.length).trim()
      }
      output = `${date} ${command} ${accountInBalance} ${isLastWordInBalanceNumber ? input + ' ' + config.currency : input}`
      break
    case 'pad':
      let tmpPadArr = input.split(' ')
      output = `${date} ${command} `
      tmpPadArr.forEach(function (str, index) {
        output += (config.replacement[str] || str) + (index === tmpPadArr.length - 1 ? '' : ' ')
      })
      break
    case 'price':
      let currencyInPrice = input.match(allCurrencyReg) || []
      if (amounts) {
        output = `${date} ${command} ${input}`
      } else if (currencyInPrice.length === 2 || (currencyInPrice.length === 1 && currencyInPrice[0] !== config.currency)) {
        let exchange = await alphavantage.exchange(config.alphavantage, currencyInPrice[0], currencyInPrice[1] || config.currency)
        if (exchange) {
          output = `${date} ${command} ${currencyInPrice[0]} ${exchange.rate} ${currencyInPrice[1] || config.currency}`
        }
      } else {
        let quote = await alphavantage.quote(config.alphavantage, input.trim())
        if (quote) {
          output = `${date} ${command} ${input.trim()} ${quote.price} ${config.currency}`
        }
      }
      break
    case '$':
      let currencyInSnap = input.match(allCurrencyReg) || []
      let amountInSnap = 1
      if (amounts) {
        amountInSnap = amounts[0]
      }
      if (currencyInSnap.length === 2 || (currencyInSnap.length === 1 && currencyInSnap[0] !== config.currency)) {
        let exchange = await alphavantage.exchange(config.alphavantage, currencyInSnap[0], currencyInSnap[1] || config.currency)
        if (exchange) {
          output = `${amountInSnap} ${currencyInSnap[0]} = ${Number(exchange.rate * amountInSnap).toFixed(2)} ${currencyInSnap[1] || config.currency}`
        }
      } else {
        let symbolInSnap = input.replace(amountInSnap, '').trim()
        let quote = await alphavantage.quote(config.alphavantage, symbolInSnap)
        if (quote) {
          output = `${symbolInSnap} ${quote.price} (${quote.percent})`
          if (amountInSnap > 1) {
            output += `\n${amountInSnap} ${symbolInSnap} = ${Number(quote.price * amountInSnap).toFixed(2)}`
          }
        }
      }
      break
    case 'event':
      if (doubleQuotes) {
        output = `${date} ${command} ${input}`
      } else {
        let eventParts = input.split(' ')
        output = `${date} ${command} "${eventParts.splice(0, 1)}" "${eventParts.join(' ')}"`
      }
      break
    default:
      // Transactions
      // Save as comment if message has no command and no amount
      if (!amounts) {
        command = '//'
        output = backup
        break
      }
      command = command || '*'

      // Parse the first line of a transaction: flag/payee/narration/tag/link
      let transactionFlag = command
      let payee

      let tmpTransactionArr = input.split(' ')
      tmpTransactionArr.forEach(function (word) {
        if (word[0] === '#') {
          tags.push(word.replace('#', ''))
          input = input.replace(word, '')
        } else if (word[0] === '^') {
          links.push(word.replace('^', ''))
          input = input.replace(word, '')
        }
      })
      if (config.tag) {
        let configTags = config.tag.split(' ').map(tag => tag.replace('#', ''))
        tags = tags.concat(configTags)
      }

      if (config.link) {
        let configLinks = config.link.map(tag => tag.replace('^', ''))
        links = links.concat(configLinks)
      }

      output = `${date} ${transactionFlag}`
      if (doubleQuotes) {
        output += ` ${doubleQuotes.join(' ')}`
        doubleQuotes.forEach(function (quote) {
          input = input.replace(quote, '')
        })
      } else {
        // find text before amount or |
        let amoutExec = amountReg.exec(input)
        let pipeExec = /\|/g.exec(input)

        let position = Math.min(amoutExec ? amoutExec.index : input.length, pipeExec ? pipeExec.index : input.length)
        let firstLine = input.slice(0, position)
        input = input.slice(position).trim()
        let tmpFirstLineArr = firstLine.split(' ')
        tmpFirstLineArr.forEach(function (word) {
          if (word[0] === '@') {
            payee = word.replace('@', '')
            firstLine = firstLine.replace(word, '')
          }
        })

        output += ` ${payee ? '"' + payee + '" ' : ''}"${firstLine.trim()}"`
      }

      if (tags.length) {
        output += ` #${tags.join(' #')}`
      }
      if (links.length) {
        output += ` ^${links.join(' ^')}`
      }

      // Parse accounts and amounts
      // parse transactions has '>'
      let flowReg = /\s>\s/g
      let flowSign = input.match(flowReg)

      if (flowSign) {
        let leftParts = (input.split(' > ')[0]).split(' + ')
        let rightParts = (input.split(' > ')[1] || '').split(' + ')

        let leftAmount = 0
        let leftCommodity
        leftParts.forEach(function (transaction) {
          let result = parseTransaction(transaction, config, '-')
          leftAmount -= result.amount
          leftCommodity = result.commodity
          output += result.line
          if (typeof result.amount === 'number') {
            amount = Math.abs(result.amount) > amount ? Math.abs(result.amount) : amount
          }
        })
        rightParts.forEach(function (transaction) {
          transaction = transaction.trim()
          let commodity = transaction.match(/\b[A-Z]+\b/g)
          commodity = commodity ? commodity[0] : leftCommodity

          let amount = transaction.match(/^(\d*\.)?\d+/g)
          if (!amount) {
            amount = ((0 - leftAmount) / rightParts.length).toFixed(2)
          }

          let result = parseTransaction(transaction, config, '+', amount, commodity)
          output += result.line
          if (typeof result.amount === 'number') {
            amount = Math.abs(result.amount) > amount ? Math.abs(result.amount) : amount
          }
        })
      }

      // parse transactions has '|'

      let pipeReg = /\s\|\s/g
      let pipeSign = input.match(pipeReg)

      if (pipeSign) {
        let pipeParts = input.split('|')
        pipeParts.forEach(function (transaction) {
          if (!transaction.trim()) return
          let result = parseTransaction(transaction, config, null)
          output += result.line
          if (typeof result.amount === 'number') {
            amount = Math.abs(result.amount) > amount ? Math.abs(result.amount) : amount
          }
        })
      }

      break
  }
  let result = {
    date,
    command,
    sync: command && command !== '//' && command !== '$',
    amount,
    tags,
    links,
    output
  }
  return result
}

module.exports = parser
