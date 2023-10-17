import dayjs from "dayjs";

export const exchange = function (key, from, to) {
  return new Promise(function (resolve) {
    if (!key) {
      resolve({ error: "ALPHAVANTAGE_INVALID_KEY" });
    } else {
      fetch(
        `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${key}`
      )
        .then(function (response) {
          if (response.ok) {
            return response.json();
          }
          resolve({
            error: "ALPHAVANTAGE_ERROR",
          });
        })
        .then(function (jsonData) {
          if (!jsonData["Realtime Currency Exchange Rate"]) {
            resolve({
              error: "ALPHAVANTAGE_EXCEED_RATE_LIMIT",
            });
          } else {
            const data = jsonData["Realtime Currency Exchange Rate"];
            resolve({
              rate: Number(data["5. Exchange Rate"]),
              updatedAt: dayjs
                .tz(
                  data["6. Last Refreshed"].replace(" ", "T"),
                  jsonData["7. Time Zone"]
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

export const quote = function (key, symbol) {
  return new Promise(function (resolve) {
    if (!key) {
      resolve({ error: "ALPHAVANTAGE_INVALID_KEY" });
    } else {
      fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${key}`
      )
        .then(function (response) {
          if (response.ok) {
            return response.json();
          }
          resolve({
            error: "ALPHAVANTAGE_ERROR",
          });
        })
        .then((data) => {
          if (!data["Global Quote"]) {
            return {
              error: "ALPHAVANTAGE_EXCEED_RATE_LIMIT",
            };
          } else {
            return {
              price: Number(data["Global Quote"]["05. price"]),
              change: Number(data["Global Quote"]["09. change"]),
              percent: data["Global Quote"]["10. change percent"],
            };
          }
        })
        .catch((error) => {
          console.log(error);
          return {
            error: "ALPHAVANTAGE_ERROR",
          };
        });
    }
  });
};
