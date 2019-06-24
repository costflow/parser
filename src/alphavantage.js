const axios = require('axios')
var { DateTime } = require('luxon')

const exchange = function (key, from, to) {
  if (!key) {
    return new Error('Need Alpha Vantage key.')
  }

  return new Promise(function (resolve, reject) {
    axios.get(`https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${key}`)
      .then(function (response) {
        let data = response.data['Realtime Currency Exchange Rate']
        let result = {
          rate: Number(data['5. Exchange Rate']),
          updatedAt: DateTime.fromISO(data['6. Last Refreshed'].replace(' ', 'T'), { zone: response.data['7. Time Zone'] }).ts
        }
        resolve(result)
      }).catch(function (error) {
        reject(error)
      })
  })
}

const quote = function (key, symbol) {
  if (!key) {
    return new Error('Need Alpha Vantage key.')
  }

  return new Promise(function (resolve, reject) {
    axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${key}`)
      .then(function (response) {
        let result = {
          price: Number(response.data['Global Quote']['05. price']),
          change: response.data['Global Quote']['09. change'],
          percent: response.data['Global Quote']['10. change percent']
        }
        resolve(result)
      }).catch(function (error) {
        reject(error)
      })
  })
}

module.exports = {
  exchange,
  quote
}
