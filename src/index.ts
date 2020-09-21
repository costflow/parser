/*
  Costflow Syntax: https://docs.costflow.io/syntax/
*/

import dayjs from 'dayjs'
import engine from './template-engine'
import { currencyList, currencyReg } from './config/currency-codes'
import { cryptoList } from './config/crypto-currency-codes'
import {quote, exchange, IExchangeResponse, IQuoteResponse, AlphaVantageCurrency} from './alphavantage'

import utc from 'dayjs/plugin/utc' // dependent on utc plugin
import timezone from 'dayjs/plugin/timezone'
dayjs.extend(utc)
dayjs.extend(timezone)


// TODO: Fix variables being numbers and strings interchangeably. JS is forgiving, but also introduces subtle bugs.

// TODO: Fix expecting variables (especially config) to hold values while they may be undefined instead.
// In TS, operator `!` enforces such expectation, so the goal is to not use it anywhere (currently there are 17 places).


type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType[number];

export interface IParseConfig {
  currency: ArrayElement<typeof currencyList>,

  indent: number,
  lineLength: number,
  mode: 'beancount',
  tag: string | null,

  insertTime?: 'metadata' | null,
  alphavantage?: string,
  formula?: Record<string, string>,
  link?: string | null,
  replacement?: Record<string, string>,
  timezone?: string,  // TODO: Exact list of timezones.
}

export type IParseResult =
 | IParseResult.Result
 | IParseResult.Error

export namespace IParseResult {
  export interface Result {
    date: string;
    command: string;
    sync: boolean | "";
    amount: number | null;
    tags: string[];
    links: string[];
    output: string;
  }
  export interface Error {
    error: string
  }
}

const REGEX = {
  CURRENCY: currencyReg,
  ALL_CURRENCIES: new RegExp(`\\b(${[...currencyList, ...cryptoList].join('|')})\\b`, 'g'),
  ACCOUNT: new RegExp('(Assets|Liabilities|Equity|Income|Expenses)(?::[a-zA-Z0-9]+)*', 'g'),
  YMD: /^(\d{4})-(\d{2})-(\d{2})\s/g,
  MONTH_NAME: /^(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})\s/g,
  SHORT_DATE: /^(dby|ytd|yesterday|tmr|tomorrow|dat)/g,
  COMMAND: /^(\*|!|;|\/\/|f|open|close|pad|\$|balance|price|commodity|note|event|option)/g,
  AMOUNT: /\b[+-]?(\d*\.)?\d+\b/g,
  AMOUNT_IN_PART: /^(\d*\.)?\d+/g,
  AMOUNT_IN_POSTING: /[+-]?(\d*\.)?\d+/g,  // TODO: are these three amount's different for a reason?
  DOUBLE_QUOTES: /".*?"/g,
  LAST_WORD_IN_BALANCE: /[+-]?(\d*\.)?\d+(?:\s|$)/g,
  FLOW: /\s>\s/g,
  COMMODITY: /\s[A-Z]+(?:\s|$)/g,
  PIPE: /\|/g,
  AT_PRICE_COST: /@(.*)([A-Z])\b/g,
  HELD_AT_COST: /{([^}]+)}/g,
}

export const parsePosting = function (postingString: string, config: IParseConfig, defaultSign: '+' | '-' | null, calculatedAmount?: string, calculatedCommodity?: string) {
  postingString = postingString.trim()
  if (!postingString) return {}

  const atPriceCost = postingString.match(REGEX.AT_PRICE_COST)
  if (atPriceCost) {
    postingString = postingString.replace(atPriceCost[0], '')
  }

  const heldAtCost = postingString.match(REGEX.HELD_AT_COST)
  if (heldAtCost) {
    postingString = postingString.replace(heldAtCost[0], '')
  }

  let commodity: string | undefined
  if (calculatedCommodity) {
    commodity = calculatedCommodity
  } else {
    commodity = postingString.match(REGEX.COMMODITY)?.[0] ?? config.currency
  }

  let amount
  if (calculatedAmount) {
    amount = calculatedAmount.toString()
  } else {
    amount = postingString.match(REGEX.AMOUNT_IN_POSTING)
    amount = amount ? amount[0] : null
  }

  let account = postingString.replace(commodity, '').replace(amount!, '').trim()
  account = account.indexOf(':') > 0 ? account : (config.replacement![account] || account)
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

export const parse = async function (input: string, configRaw: Pick<IParseConfig, 'currency'> & Partial<IParseConfig>): Promise<IParseResult> {
  const backup = input
  const config: IParseConfig = Object.assign({
    mode: 'beancount',
    tag: '#costflow',
    indent: 2,
    lineLength: 80
  }, configRaw)

  let tags: string[] = []
  let links: string[] = []
  let amount: number | null = null
  let error: string | false = false


  // date
  const now = config.timezone ? dayjs().tz(config.timezone) : dayjs()
  const today = now.format('YYYY-MM-DD')
  const ymdReg = input.match(REGEX.YMD)
  let date = ymdReg?.[0]?.trim() ?? null
  input = date ? input.slice(date.length).trim() : input.trim()

  const monthNameReg = input.match(REGEX.MONTH_NAME)
  if (monthNameReg?.[0]) {
    date = dayjs(`${monthNameReg[0]} ${today.substring(0, 4)}`).format('YYYY-MM-DD')
    input = input.slice(monthNameReg[0].length).trim()
  }

  const shortDateReg = input.match(REGEX.SHORT_DATE)
  if (shortDateReg?.[0]) {
    const dateStr = shortDateReg[0]
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
  const commandReg = input.match(REGEX.COMMAND)
  let command = commandReg?.[0] ?? null
  input = command ? input.slice(command.length).trim() : input.trim()

  let amounts = input.match(REGEX.AMOUNT)?.map(n => Number(n))

  const doubleQuotes = input.match(REGEX.DOUBLE_QUOTES)

  if (command === null && config.formula && config.formula[input.split(' ')[0]]) {
    command = 'f'
  }

  // Formula
  if (command === 'f') {
    const formulaName = input.split(' ')[0]
    if (config.formula![formulaName]) {
      const formulaParseResult = engine.Render(config.formula![formulaName], {
        amount: amounts ? amounts[0] : '',
        pre: input.slice(formulaName.length).trim()
      })

      // formulaParseResult should not be a formula command
      const commandInFormulaResult = formulaParseResult.match(REGEX.COMMAND)?.[0] ?? null
      if (commandInFormulaResult === 'f' || (commandInFormulaResult === null && config.formula && config.formula[formulaParseResult.split(' ')[0]])) {
        error = 'FORMULA_LOOP'
        return { error }
      }

      const formulaResult = await parse(formulaParseResult, config)
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
      if (config.replacement![accountInNote]) {
        input = input.slice(accountInNote.length).trim()
        accountInNote = config.replacement![accountInNote]
      } else if (input.match(REGEX.ACCOUNT)) {
        accountInNote = input.match(REGEX.ACCOUNT)![0]
        input = input.slice(accountInNote.length).trim()
      }
      output = `${date} ${command} ${accountInNote} ${doubleQuotes ? input : '"' + input + '"'}`
      break
    }
    case 'balance': {
      const tmpBalanceArr = input.split(' ')
      let accountInBalance = tmpBalanceArr[0]
      const lastWordInBalance = tmpBalanceArr[tmpBalanceArr.length - 1]
      const isLastWordInBalanceNumber = lastWordInBalance.match(REGEX.LAST_WORD_IN_BALANCE)
      if (config.replacement![accountInBalance]) {
        input = input.slice(accountInBalance.length).trim()
        accountInBalance = config.replacement![accountInBalance]
      } else if (input.match(REGEX.ACCOUNT)) {
        accountInBalance = input.match(REGEX.ACCOUNT)![0]
        input = input.slice(accountInBalance.length).trim()
      }
      output = `${date} ${command} ${accountInBalance} ${isLastWordInBalanceNumber ? input + ' ' + config.currency : input}`
      break
    }
    case 'pad': {
      const tmpPadArr = input.split(' ')
      output = `${date} ${command} `
      tmpPadArr.forEach(function (str, index) {
        output += (config.replacement![str] || str) + (index === tmpPadArr.length - 1 ? '' : ' ')
      })
      break
    }
    case 'price': {
      const currencyInPrice = input.match(REGEX.ALL_CURRENCIES) || []
      if (amounts) {
        output = `${date} ${command} ${input}`
      } else if (currencyInPrice.length === 2 || (currencyInPrice.length === 1 && currencyInPrice[0] !== config.currency)) {
        let exchangeResult: IExchangeResponse
        try {
          exchangeResult = await exchange(config.alphavantage!, currencyInPrice[0] as AlphaVantageCurrency, (currencyInPrice[1] || config.currency) as AlphaVantageCurrency)
        } catch (err) {
          error = err.message
          break
        }

        if (exchangeResult) {
          output = `${date} ${command} ${currencyInPrice[0]} ${exchangeResult.rate} ${currencyInPrice[1] || config.currency}`
        }
      } else {
        let quoteResult: IQuoteResponse
        try {
          quoteResult = await quote(config.alphavantage!, input.trim())
        } catch (err) {
          error = err.message
          break
        }

        if (quoteResult) {
          output = `${date} ${command} ${input.trim()} ${quoteResult.price} ${config.currency}`
        }
      }
      break
    }
    case '$': {
      const currencyInSnap = input.match(REGEX.ALL_CURRENCIES) || []
      let amountInSnap = 1
      if (amounts) {
        amountInSnap = Number(amounts[0])
      }
      if (currencyInSnap.length === 2 || (currencyInSnap.length === 1 && currencyInSnap[0] !== config.currency)) {
        let exchangeResult: IExchangeResponse
        try {
          exchangeResult = await exchange(config.alphavantage!, currencyInSnap[0] as AlphaVantageCurrency, (currencyInSnap[1] || config.currency) as AlphaVantageCurrency)
        } catch (err) {
          error = err.message
          break
        }

        if (exchangeResult) {
          output = `${amountInSnap} ${currencyInSnap[0]} = ${Number(exchangeResult.rate * amountInSnap).toFixed(2)} ${currencyInSnap[1] || config.currency}`
        }
      } else {
        const symbolInSnap = input.replace(String(amountInSnap), '').trim()
        let quoteResult: IQuoteResponse
        try {
          quoteResult = await quote(config.alphavantage!, symbolInSnap)
        } catch (err) {
          error = err.message
          break
        }

        if (quoteResult) {
          output = `${symbolInSnap} ${quoteResult.price} (${quoteResult.percent})`
          if (amountInSnap > 1) {
            output += `\n${amountInSnap} ${symbolInSnap} = ${Number(quoteResult.price * amountInSnap).toFixed(2)}`
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
        const amoutExec = REGEX.AMOUNT.exec(input)
        const pipeExec = REGEX.PIPE.exec(input)

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
        let timeOrDatetime = now.format('HH:mm:ss')
        if (dayjs().format('YYYY-MM-DD') !== date) {
          timeOrDatetime = now.format('YYYY-MM-DD HH:mm:ss')
        }
        output += '\n'
        output += Array(config.indent).fill(' ').join('')
        output += `time: "${timeOrDatetime}"`
      }

      // Parse accounts and amounts
      // parse transactions has '>'
      const flowSign = input.match(REGEX.FLOW)

      if (flowSign) {
        const leftParts = (input.split(REGEX.FLOW)[0]).split(' + ')
        const rightParts = (input.split(REGEX.FLOW)[1] || '').split(' + ')

        let leftAmount = 0
        let leftCommodity: string
        leftParts.forEach(function (postingString) {
          const posting = parsePosting(postingString, config, '-')
          leftAmount -= posting.amount!
          leftCommodity = posting.commodity!
          output += posting.line
          if (typeof posting.amount === 'number') {
            amount = (Math.abs(posting.amount) > (amount ?? 0)) ? Math.abs(posting.amount) : amount
          }
        })
        let rightAmount = 0 - leftAmount
        rightParts.forEach(function (postingString, index) {
          postingString = postingString.trim()
          let commodity = postingString.match(REGEX.COMMODITY)?.[0].trim() ?? leftCommodity

          let amount = postingString.match(REGEX.AMOUNT_IN_PART)?.[0] ?? null
          if (!amount) {
            amount = (rightAmount / (rightParts.length - index)).toFixed(2)
            rightAmount -= Number(amount)
          } else {
            rightAmount -= Number(amount)
          }
          const posting = parsePosting(postingString, config, '+', amount, commodity)
          output += posting.line
          if (typeof posting.amount === 'number') {
            amount = Math.abs(posting.amount) > Number(amount) ? String(Math.abs(posting.amount)) : amount
          }
        })
      }

      // parse transactions has '|'
      const pipeSign = input.match(REGEX.PIPE)

      if (pipeSign) {
        const pipeParts = input.split(REGEX.PIPE)
        pipeParts.forEach(function (postingString) {
          if (!postingString.trim()) return
          const posting = parsePosting(postingString, config, null)
          output += posting.line
          if (typeof posting.amount === 'number') {
            amount = (Math.abs(posting.amount) > (amount ?? 0)) ? Math.abs(posting.amount) : amount
          }
        })
      }
      break
    }
  }
  const result: IParseResult = error ? { error } : {
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
