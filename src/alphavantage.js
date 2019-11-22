const axios = require('axios')
var { DateTime } = require('luxon')

const exchange = function (key, from, to) {
  return new Promise(function (resolve, reject) {
    if (!key) {
      reject(Error('NO_ALPHA_VANTAGE_KEY'))
    } else {
      axios.get(`https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${key}`)
        .then(function (response) {
          if (!response.data['Realtime Currency Exchange Rate']) {
            reject(Error('ALPHA_VANTAGE_KEY_INVALID_OR_EXCEED_RATE_LIMIT'))
          } else {
            const data = response.data['Realtime Currency Exchange Rate']
            const result = {
              rate: Number(data['5. Exchange Rate']),
              updatedAt: DateTime.fromISO(data['6. Last Refreshed'].replace(' ', 'T'), { zone: response.data['7. Time Zone'] }).ts
            }
            resolve(result)
          }
        }).catch(function (error) {
          reject(error)
        })
    }
  })
}

const quote = function (key, symbol) {
  return new Promise(function (resolve, reject) {
    if (!key) {
      reject(Error('NO_ALPHA_VANTAGE_KEY'))
    } else {
      axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${key}`)
        .then(function (response) {
          if (!response.data['Global Quote']) {
            reject(Error('ALPHA_VANTAGE_KEY_INVALID_OR_EXCEED_RATE_LIMIT'))
          } else {
            const result = {
              price: Number(response.data['Global Quote']['05. price']),
              change: response.data['Global Quote']['09. change'],
              percent: response.data['Global Quote']['10. change percent']
            }
            resolve(result)
          }
        }).catch(function (error) {
          reject(error)
        })
    }
  })
}

module.exports = {
  exchange,
  quote
}
