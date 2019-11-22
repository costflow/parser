/*
  Costflow Syntax: https://docs.costflow.io/syntax/
*/

const { DateTime } = require('luxon')
const dayjs = require('dayjs')
const engine = require('./template-engine')
const { currencyList, currencyReg } = require('../config/currency-codes')
const { cryptoList } = require('../config/crypto-currency-codes')
const alphavantage = require('./alphavantage')

const parseTransaction = function (transaction, config, defaultSign, calculatedAmount, calculatedCommodity) {
  transaction = transaction.trim()
  if (!transaction) return {}

  const atPriceCost = transaction.match(/@(.*)([A-Z])\b/g)
  if (atPriceCost) {
    transaction = transaction.replace(atPriceCost[0], '')
  }

  const heldAtCost = transaction.match(/{([^}]+)}/g)
  if (heldAtCost) {
    transaction = transaction.replace(heldAtCost[0], '')
  }

  let commodity
  if (calculatedCommodity) {
    commodity = calculatedCommodity
  } else {
    commodity = transaction.match(/\s[A-Z]+(?:\s|$)/g)
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
  account = account.indexOf(':') > 0 ? account : (config.replacement[account] || account)
  let startPart = ''
  startPart += Array(config.indent).fill(' ').join('')
  startPart += `${account}`

  const endPart = `${defaultSign || (Number(amount) > 0 ? '+' : '')}${Number(amount).toFixed(2)} ${commodity.trim()}`
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
  const backup = input
  config = Object.assign({
    mode: 'beancount',
    tag: '#costflow',
    indent: 2,
    lineLength: 80
  }, config)

  let tags = []
  let links = []
  let amount = null
  let error = false

  const allCurrencyReg = new RegExp(`\\b(${currencyList.concat(cryptoList).join('|')})\\b`, 'g')
  const accountReg = new RegExp('(Assets|Liabilities|Equity|Income|Expenses)(?::[a-zA-Z0-9]+)*', 'g')

  // date
  const ymdReg = /^(\d{4})-(\d{2})-(\d{2})\s/g
  const today = config.timezone ? DateTime.local().setZone(config.timezone).toFormat('y-LL-dd') : DateTime.local().toFormat('y-LL-dd')
  let date = input.match(ymdReg) && input.match(ymdReg).length ? input.match(ymdReg)[0].trim() : null
  input = date ? input.slice(date.length).trim() : input.trim()

  const monthNameReg = /^(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})\s/g
  if (input.match(monthNameReg) && input.match(monthNameReg).length) {
    date = dayjs(`${input.match(monthNameReg)[0]} ${today.substring(0, 4)}`).format('YYYY-MM-DD')
    input = input.slice(input.match(monthNameReg)[0].length).trim()
  }

  const shortDateReg = /^(dby|ytd|yesterday|tmr|tomorrow|dat)/g
  if (input.match(shortDateReg) && input.match(shortDateReg).length) {
    const dateStr = input.match(shortDateReg)[0]
    let dateNum = 0
    switch (dateStr) {
      case 'dby':
        dateNum = -2
        break
      case 'ytd':
      case 'yesterday':
        dateNum = -1
        break
      case 'tmr':
      case 'tomorrow':
        dateNum = 1
        break
      case 'dat':
        dateNum = 2
        break
    }
    date = dayjs(today).add(dateNum, 'day').format('YYYY-MM-DD')
    input = input.slice(dateStr.length).trim()
  }

  date = date || today
  input = input.trim()

  // commands
  const commandReg = /^(\*|!|;|\/\/|f|open|close|pad|\$|balance|price|commodity|note|event|option)/g
  let command = input.match(commandReg) && input.match(commandReg).length ? input.match(commandReg)[0] : null
  input = command ? input.slice(command.length).trim() : input.trim()

  const amountReg = /\b[+-]?(\d*\.)?\d+\b/g
  let amounts = input.match(amountReg)
  amounts = amounts ? amounts.map(n => Number(n)) : amounts

  const doubleQuotesReg = /".*?"/g
  const doubleQuotes = input.match(doubleQuotesReg)

  if (command === null && config.formula && config.formula[input.split(' ')[0]]) {
    command = 'f'
  }

  // Formula
  if (command === 'f') {
    const formulaName = input.split(' ')[0]
    if (config.formula[formulaName]) {
      const formulaParseResult = engine.render(config.formula[formulaName], {
        amount: amounts ? amounts[0] : '',
        pre: input.slice(formulaName.length).trim()
      })

      // formulaParseResult should not be a formula command
      const commandInFormulaResult = formulaParseResult.match(commandReg) && formulaParseResult.match(commandReg).length ? formulaParseResult.match(commandReg)[0] : null
      if (commandInFormulaResult === 'f' || (commandInFormulaResult === null && config.formula && config.formula[formulaParseResult.split(' ')[0]])) {
        error = 'FORMULA_LOOP'
        return { error }
      }

      const formulaResult = await parser(formulaParseResult, config)
      return formulaResult
    } else {
      error = 'FORMULA_NOT_FOUND'
      return { error }
    }
  }

  // beancount
  let output = ''
  switch (command) {
    case ';': {
      output = `${backup}`
      break
    }
    case '//': {
      output = `${backup.replace('//', '').trim()}`
      break
    }
    case 'open':
    case 'close':
    case 'commodity': {
      output = `${date} ${command} ${input}`
      break
    }
    case 'option': {
      const currencyInOption = input.match(currencyReg)
      if (doubleQuotes) {
        output = `${command} ${input}`
      } else if (currencyInOption) {
        output = `${command} "operating_currency" "${currencyInOption}"`
      } else {
        output = `${command} "title" "${input}"`
      }
      break
    }
    case 'note': {
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
    }
    case 'balance': {
      const tmpBalanceArr = input.split(' ')
      let accountInBalance = tmpBalanceArr[0]
      const lastWordInBalance = tmpBalanceArr[tmpBalanceArr.length - 1]
      const isLastWordInBalanceNumber = lastWordInBalance.match(/[+-]?(\d*\.)?\d+(?:\s|$)/g)
      if (config.replacement[accountInBalance]) {
        input = input.slice(accountInBalance.length).trim()
        accountInBalance = config.replacement[accountInBalance]
      } else if (input.match(accountReg)) {
        accountInBalance = input.match(accountReg)[0]
        input = input.slice(accountInBalance.length).trim()
      }
      output = `${date} ${command} ${accountInBalance} ${isLastWordInBalanceNumber ? input + ' ' + config.currency : input}`
      break
    }
    case 'pad': {
      const tmpPadArr = input.split(' ')
      output = `${date} ${command} `
      tmpPadArr.forEach(function (str, index) {
        output += (config.replacement[str] || str) + (index === tmpPadArr.length - 1 ? '' : ' ')
      })
      break
    }
    case 'price': {
      const currencyInPrice = input.match(allCurrencyReg) || []
      if (amounts) {
        output = `${date} ${command} ${input}`
      } else if (currencyInPrice.length === 2 || (currencyInPrice.length === 1 && currencyInPrice[0] !== config.currency)) {
        let exchange
        try {
          exchange = await alphavantage.exchange(config.alphavantage, currencyInPrice[0], currencyInPrice[1] || config.currency)
        } catch (err) {
          error = err.message
          break
        }

        if (exchange) {
          output = `${date} ${command} ${currencyInPrice[0]} ${exchange.rate} ${currencyInPrice[1] || config.currency}`
        }
      } else {
        let quote
        try {
          quote = await alphavantage.quote(config.alphavantage, input.trim())
        } catch (err) {
          error = err.message
          break
        }

        if (quote) {
          output = `${date} ${command} ${input.trim()} ${quote.price} ${config.currency}`
        }
      }
      break
    }
    case '$': {
      const currencyInSnap = input.match(allCurrencyReg) || []
      let amountInSnap = 1
      if (amounts) {
        amountInSnap = amounts[0]
      }
      if (currencyInSnap.length === 2 || (currencyInSnap.length === 1 && currencyInSnap[0] !== config.currency)) {
        let exchange
        try {
          exchange = await alphavantage.exchange(config.alphavantage, currencyInSnap[0], currencyInSnap[1] || config.currency)
        } catch (err) {
          error = err.message
          break
        }

        if (exchange) {
          output = `${amountInSnap} ${currencyInSnap[0]} = ${Number(exchange.rate * amountInSnap).toFixed(2)} ${currencyInSnap[1] || config.currency}`
        }
      } else {
        const symbolInSnap = input.replace(amountInSnap, '').trim()
        let quote
        try {
          quote = await alphavantage.quote(config.alphavantage, symbolInSnap)
        } catch (err) {
          error = err.message
          break
        }

        if (quote) {
          output = `${symbolInSnap} ${quote.price} (${quote.percent})`
          if (amountInSnap > 1) {
            output += `\n${amountInSnap} ${symbolInSnap} = ${Number(quote.price * amountInSnap).toFixed(2)}`
          }
        }
      }
      break
    }
    case 'event': {
      if (doubleQuotes) {
        output = `${date} ${command} ${input}`
      } else {
        const eventParts = input.split(' ')
        output = `${date} ${command} "${eventParts.splice(0, 1)}" "${eventParts.join(' ')}"`
      }
      break
    }
    default: {
      // Transactions
      // Save as comment if message has no command and no amount
      if (!amounts) {
        command = '//'
        output = backup
        break
      }
      command = command || '*'

      // Parse the first line of a transaction: flag/payee/narration/tag/link
      const transactionFlag = command
      let payee

      const tmpTransactionArr = input.split(' ')
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
        const configTags = config.tag.split(' ').map(tag => tag.replace('#', ''))
        tags = tags.concat(configTags)
      }

      if (config.link) {
        const configLinks = config.link.split(' ').map(tag => tag.replace('^', ''))
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
        const amoutExec = amountReg.exec(input)
        const pipeExec = /\|/g.exec(input)

        const position = Math.min(amoutExec ? amoutExec.index : input.length, pipeExec ? pipeExec.index : input.length)
        let firstLine = input.slice(0, position)
        input = input.slice(position).trim()
        const tmpFirstLineArr = firstLine.split(' ')
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

      if (config.insertTime === 'metadata') {
        const now = DateTime.local().setZone(config.timezone)
        let timeOrDatetime = now.toFormat('HH:mm:ss')
        if (now.toFormat('y-LL-dd') !== date) {
          timeOrDatetime = now.toFormat('y-LL-dd HH:mm:ss')
        }
        output += '\n'
        output += Array(config.indent).fill(' ').join('')
        output += `time: "${timeOrDatetime}"`
      }

      // Parse accounts and amounts
      // parse transactions has '>'
      const flowReg = /\s>\s/g
      const flowSign = input.match(flowReg)

      if (flowSign) {
        const leftParts = (input.split(' > ')[0]).split(' + ')
        const rightParts = (input.split(' > ')[1] || '').split(' + ')

        let leftAmount = 0
        let leftCommodity
        leftParts.forEach(function (transaction) {
          const result = parseTransaction(transaction, config, '-')
          leftAmount -= result.amount
          leftCommodity = result.commodity
          output += result.line
          if (typeof result.amount === 'number') {
            amount = Math.abs(result.amount) > amount ? Math.abs(result.amount) : amount
          }
        })
        let rightAmount = 0 - leftAmount
        rightParts.forEach(function (transaction, index) {
          transaction = transaction.trim()
          let commodity = transaction.match(/\s[A-Z]+(?:\s|$)/g)
          commodity = commodity ? commodity[0].trim() : leftCommodity

          const amountArr = transaction.match(/^(\d*\.)?\d+/g)
          let amount = amountArr ? amountArr[0] : null
          if (!amount) {
            amount = (rightAmount / (rightParts.length - index)).toFixed(2)
            rightAmount -= amount
          } else {
            rightAmount -= Number(amount)
          }
          const result = parseTransaction(transaction, config, '+', amount, commodity)
          output += result.line
          if (typeof result.amount === 'number') {
            amount = Math.abs(result.amount) > amount ? Math.abs(result.amount) : amount
          }
        })
      }

      // parse transactions has '|'
      const pipeReg = /\s\|\s/g
      const pipeSign = input.match(pipeReg)

      if (pipeSign) {
        const pipeParts = input.split('|')
        pipeParts.forEach(function (transaction) {
          if (!transaction.trim()) return
          const result = parseTransaction(transaction, config, null)
          output += result.line
          if (typeof result.amount === 'number') {
            amount = Math.abs(result.amount) > amount ? Math.abs(result.amount) : amount
          }
        })
      }
      break
    }
  }
  const result = error ? { error } : {
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
