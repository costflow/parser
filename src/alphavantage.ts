import axios from "axios";
import dayjs from "dayjs";
import {
  AlphaVantageCurrency,
  ExchangeResponse,
  QuoteResponse,
} from "./interface";
export const exchange = function (
  key: string | undefined,
  from: AlphaVantageCurrency,
  to: AlphaVantageCurrency
): Promise<ExchangeResponse> {
  return new Promise(function (resolve) {
    if (!key) {
      resolve({ error: "ALPHAVANTAGE_INVALID_KEY" });
    } else {
      axios
        .get(
          `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${key}`
        )
        .then(function (response) {
          if (!response.data["Realtime Currency Exchange Rate"]) {
            resolve({
              error: "ALPHAVANTAGE_EXCEED_RATE_LIMIT",
            });
          } else {
            const data = response.data["Realtime Currency Exchange Rate"];
            resolve({
              rate: Number(data["5. Exchange Rate"]),
              updatedAt: dayjs
                .tz(
                  data["6. Last Refreshed"].replace(" ", "T"),
                  response.data["7. Time Zone"]
                )
                .valueOf(),
            });
          }
        })
        .catch(function (error) {
          console.log(error);
          resolve({
            error: "ALPHAVANTAGE_ERROR",
          });
        });
    }
  });
};

export const quote = function (
  key: string | undefined,
  symbol: string
): Promise<QuoteResponse> {
  return new Promise(function (resolve) {
    if (!key) {
      resolve({ error: "ALPHAVANTAGE_INVALID_KEY" });
    } else {
      axios
        .get(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${key}`
        )
        .then(function (response) {
          if (!response.data["Global Quote"]) {
            resolve({
              error: "ALPHAVANTAGE_EXCEED_RATE_LIMIT",
            });
          } else {
            resolve({
              price: Number(response.data["Global Quote"]["05. price"]),
              change: Number(response.data["Global Quote"]["09. change"]),
              percent: response.data["Global Quote"]["10. change percent"],
            });
          }
        })
        .catch(function (error) {
          console.log(error);
          resolve({
            error: "ALPHAVANTAGE_ERROR",
          });
        });
    }
  });
};
