import axios from 'axios'
import dayjs from 'dayjs'
import type { cryptoList } from './config/crypto-currency-codes'
import type { exchangeList } from './config/currency-codes'

type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType[number]

export type AlphaVantageCryptoCurrency = ArrayElement<typeof cryptoList>
export type AlphaVantageFiatCurrency = ArrayElement<typeof exchangeList>
export type AlphaVantageCurrency = AlphaVantageCryptoCurrency | AlphaVantageFiatCurrency

export interface IExchangeResponse {
  rate: number,
  updatedAt: number,
}

export const exchange = function (key: string, from: AlphaVantageCurrency, to: AlphaVantageCurrency) {
  return new Promise<IExchangeResponse>(function (resolve, reject) {
    if (!key) {
      reject(Error('ALPHA_VANTAGE_KEY_NOT_EXIST'))
    } else {
      axios.get(`https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${key}`)
        .then(function (response) {
          if (!response.data['Realtime Currency Exchange Rate']) {
            reject(Error('ALPHA_VANTAGE_KEY_INVALID_OR_EXCEED_RATE_LIMIT'))
          } else {
            const data = response.data['Realtime Currency Exchange Rate']
            resolve({
              rate: Number(data['5. Exchange Rate']),
              updatedAt: dayjs.tz(data['6. Last Refreshed'].replace(' ', 'T'), response.data['7. Time Zone']).valueOf()
            })
          }
        }).catch(function (error) {
          reject(error)
        })
    }
  })
}

export interface IQuoteResponse {
  price: number,
  change: number,
  percent: number,
}

export const quote = function (key: string, symbol: string) {
  return new Promise<IQuoteResponse>(function (resolve, reject) {
    if (!key) {
      reject(Error('ALPHA_VANTAGE_KEY_NOT_EXIST'))
    } else {
      axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${key}`)
        .then(function (response) {
          if (!response.data['Global Quote']) {
            reject(Error('ALPHA_VANTAGE_KEY_INVALID_OR_EXCEED_RATE_LIMIT'))
          } else {
            resolve({
              price: Number(response.data['Global Quote']['05. price']),
              change: response.data['Global Quote']['09. change'],
              percent: response.data['Global Quote']['10. change percent']
            })
          }
        }).catch(function (error) {
          reject(error)
        })
    }
  })
}
