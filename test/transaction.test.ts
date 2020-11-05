import costflow from "..";
import { expectToBeNotError, testConfig, today } from "./common";

/*
 * Transaction
 */

// Use >
test("Transaction #1.1", async () => {
  const res = await costflow.parse(
    '2017-01-05 "RiverBank Properties" "Paying the rent" 2400 Assets:US:BofA:Checking > 2400  Expenses:Home:Rent',
    testConfig
  );
  expectToBeNotError(res);
  expect(res.date).toBe("2017-01-05");
  expect(res.completed).toBe(true);
  expect(res.payee).toBe("RiverBank Properties");
  expect(res.narration).toBe("Paying the rent");
  expect(res.tags).toEqual(["costflow"]);
  expect(res.data).toEqual([
    {
      account: "Assets:US:BofA:Checking",
      amount: -2400,
      currency: "USD",
    },
    {
      account: "Expenses:Home:Rent",
      amount: 2400,
      currency: "USD",
    },
  ]);
});
test("Transaction #1.2", async () => {
  const res = await costflow.parse(
    "@Verizon 59.61 Assets:BofA > Expenses:Phone",
    testConfig
  );
  expectToBeNotError(res);
  expect(res.date).toBe(today.format("YYYY-MM-DD"));
  expect(res.completed).toBe(true);
  expect(res.payee).toBe("Verizon");
  expect(res.narration).toBe("");
  expect(res.tags).toEqual(["costflow"]);
  expect(res.data).toEqual([
    {
      account: "Assets:BofA",
      amount: -59.61,
      currency: "USD",
    },
    {
      account: "Expenses:Phone",
      amount: 59.61,
      currency: "USD",
    },
  ]);
});

test("Transaction #1.3", async () => {
  const res = await costflow.parse("@Verizon 59.61 bofa > phone", testConfig);
  expectToBeNotError(res);

  expect(res.date).toBe(today.format("YYYY-MM-DD"));
  expect(res.completed).toBe(true);
  expect(res.payee).toBe("Verizon");
  expect(res.narration).toBe("");
  expect(res.tags).toEqual(["costflow"]);
  expect(res.data).toEqual([
    {
      account: "Assets:BofA",
      amount: -59.61,
      currency: "USD",
    },
    {
      account: "Expenses:Phone",
      amount: 59.61,
      currency: "USD",
    },
  ]);
});

test("Transaction #1.4", async () => {
  const res = await costflow.parse(
    "Rent 750 bofa + 750 visa > rent",
    testConfig
  );
  expectToBeNotError(res);

  expect(res.date).toBe(today.format("YYYY-MM-DD"));
  expect(res.completed).toBe(true);
  expect(res.payee).toBe(null);
  expect(res.narration).toBe("Rent");
  expect(res.tags).toEqual(["costflow"]);
  expect(res.data).toEqual([
    {
      account: "Assets:BofA",
      amount: -750,
      currency: "USD",
    },
    {
      account: "Liabilities:Visa",
      amount: -750,
      currency: "USD",
    },
    {
      account: "Expenses:Rent",
      amount: 1500,
      currency: "USD",
    },
  ]);
});

test("Transaction #1.5", async () => {
  const res = await costflow.parse(
    "! Sushi 7200 JPY bofa > food + alice + bob",
    testConfig
  );
  expectToBeNotError(res);

  expect(res.date).toBe(today.format("YYYY-MM-DD"));
  expect(res.completed).toBe(false);
  expect(res.payee).toBe(null);
  expect(res.narration).toBe("Sushi");
  expect(res.tags).toEqual(["costflow"]);
  expect(res.data).toEqual([
    {
      account: "Assets:BofA",
      amount: -7200,
      currency: "JPY",
    },
    {
      account: "Expenses:Food",
      amount: 2400,
      currency: "JPY",
    },
    {
      account: "Assets:Receivables:Alice",
      amount: 2400,
      currency: "JPY",
    },
    {
      account: "Assets:Receivables:Bob",
      amount: 2400,
      currency: "JPY",
    },
  ]);
});

// todo: support @ / @@ / {}
// test("Transaction #1.6", async () => {
//   const res = await costflow.parse(
//     "Transfer to account in US 5000 CNY @ 7.2681 USD boc > 726.81 USD bofa",
//     testConfig
//   );
//   expectToBeNotError(res);
//   expect(res.output).toBe(`${today.format(
//     "YYYY-MM-DD"
//   )} * "Transfer to account in US" #costflow
//   Assets:CN:BOC                                 -5000.00 CNY @ 7.2681 USD
//   Assets:US:BofA:Checking                        +726.81 USD`);
// });

// test("Transaction #1.7", async () => {
//   const res = await costflow.parse(
//     "Transfer to account in US 5000 CNY @@ 726.81 USD boc > 726.81 USD bofa",
//     testConfig
//   );
//   expectToBeNotError(res);
//   expect(res.output).toBe(`${today.format(
//     "YYYY-MM-DD"
//   )} * "Transfer to account in US" #costflow
//   Assets:CN:BOC                                 -5000.00 CNY @@ 726.81 USD
//   Assets:US:BofA:Checking                        +726.81 USD`);
// });

// test("Transaction #1.8", async () => {
//   const res = await costflow.parse(
//     "Bought shares of Apple 1915.5 bofa > 10 AAPL {191.55 USD} aapl",
//     testConfig
//   );
//   expectToBeNotError(res);
//   expect(res.output).toBe(`${today.format(
//     "YYYY-MM-DD"
//   )} * "Bought shares of Apple" #costflow
//   Assets:US:BofA:Checking                       -1915.50 USD
//   Assets:ETrade:AAPL                             +10.00 AAPL {191.55 USD}`);
// });

// test("Transaction #1.9", async () => {
//   const res = await costflow.parse(
//     "Sold shares of Apple 10 AAPL {191.55 USD} @ 201.55 USD aapl + 100 USD cg > 2015.5 bofa",
//     testConfig
//   );
//   expectToBeNotError(res);
//   expect(res.output).toBe(`${today.format(
//     "YYYY-MM-DD"
//   )} * "Sold shares of Apple" #costflow
//   Assets:ETrade:AAPL                             -10.00 AAPL {191.55 USD} @ 201.55 USD
//   Income:Etrade:CapitalGains                     -100.00 USD
//   Assets:US:BofA:Checking                       +2015.50 USD`);
// });

test("Transaction #1.10", async () => {
  const res = await costflow.parse(
    "@麦当劳 #food #mc 180 CNY visa > food",
    testConfig
  );
  expectToBeNotError(res);

  expect(res.date).toBe(today.format("YYYY-MM-DD"));
  expect(res.completed).toBe(true);
  expect(res.payee).toBe("麦当劳");
  expect(res.narration).toBe("");
  expect(res.tags).toEqual(["costflow", "food", "mc"]);
  expect(res.data).toEqual([
    {
      account: "Liabilities:Visa",
      amount: -180,
      currency: "CNY",
    },
    {
      account: "Expenses:Food",
      amount: 180,
      currency: "CNY",
    },
  ]);
});

/*
 * Use |
 */
test("Transaction #2.1", async () => {
  const res = await costflow.parse(
    '2017-01-05 "RiverBank Properties" "Paying the rent" Assets:US:BofA:Checking -2400 | Expenses:Home:Rent 2400',
    testConfig
  );
  expectToBeNotError(res);

  expect(res.date).toBe("2017-01-05");
  expect(res.completed).toBe(true);
  expect(res.payee).toBe("RiverBank Properties");
  expect(res.narration).toBe("Paying the rent");
  expect(res.tags).toEqual(["costflow"]);
  expect(res.data).toEqual([
    {
      account: "Assets:US:BofA:Checking",
      amount: -2400,
      currency: "USD",
    },
    {
      account: "Expenses:Home:Rent",
      amount: 2400,
      currency: "USD",
    },
  ]);
});
test("Transaction #2.2", async () => {
  const res = await costflow.parse(
    "@Verizon Assets:BofA -59.61 | Expenses:Phone 59.61",
    testConfig
  );
  expectToBeNotError(res);
  expect(res.date).toBe(today.format("YYYY-MM-DD"));
  expect(res.completed).toBe(true);
  expect(res.payee).toBe("Verizon");
  expect(res.narration).toBe("");
  expect(res.tags).toEqual(["costflow"]);
  expect(res.data).toEqual([
    {
      account: "Assets:BofA",
      amount: -59.61,
      currency: "USD",
    },
    {
      account: "Expenses:Phone",
      amount: 59.61,
      currency: "USD",
    },
  ]);
});

test("Transaction #2.3", async () => {
  const res = await costflow.parse(
    "@Verizon bofa -59.61 | phone 59.61",
    testConfig
  );
  expectToBeNotError(res);
  expect(res.date).toBe(today.format("YYYY-MM-DD"));
  expect(res.completed).toBe(true);
  expect(res.payee).toBe("Verizon");
  expect(res.narration).toBe("");
  expect(res.tags).toEqual(["costflow"]);
  expect(res.data).toEqual([
    {
      account: "Assets:BofA",
      amount: -59.61,
      currency: "USD",
    },
    {
      account: "Expenses:Phone",
      amount: 59.61,
      currency: "USD",
    },
  ]);
});

test("Transaction #2.4", async () => {
  const res = await costflow.parse(
    "Rent #costflow bofa -750 | visa -750 | rent 1500",
    testConfig
  );
  expectToBeNotError(res);
  expect(res.date).toBe(today.format("YYYY-MM-DD"));
  expect(res.completed).toBe(true);
  expect(res.payee).toBe(null);
  expect(res.narration).toBe("Rent");
  expect(res.tags).toEqual(["costflow"]);
  expect(res.data).toEqual([
    {
      account: "Assets:BofA",
      amount: -750,
      currency: "USD",
    },
    {
      account: "Liabilities:Visa",
      amount: -750,
      currency: "USD",
    },
    {
      account: "Expenses:Rent",
      amount: 1500,
      currency: "USD",
    },
  ]);
});

test("Transaction #2.5", async () => {
  const res = await costflow.parse(
    "! Sushi bofa -7200 JPY | food 2400 JPY | alice 2400 JPY | bob 2400 JPY",
    testConfig
  );
  expectToBeNotError(res);

  expect(res.date).toBe(today.format("YYYY-MM-DD"));
  expect(res.completed).toBe(false);
  expect(res.payee).toBe(null);
  expect(res.narration).toBe("Sushi");
  expect(res.tags).toEqual(["costflow"]);
  expect(res.data).toEqual([
    {
      account: "Assets:BofA",
      amount: -7200,
      currency: "JPY",
    },
    {
      account: "Expenses:Food",
      amount: 2400,
      currency: "JPY",
    },
    {
      account: "Assets:Receivables:Alice",
      amount: 2400,
      currency: "JPY",
    },
    {
      account: "Assets:Receivables:Bob",
      amount: 2400,
      currency: "JPY",
    },
  ]);
});

// test("Transaction #2.6", async () => {
//   const res = await costflow.parse(
//     "Transfer to account in US | boc -5000 CNY @ 7.2681 USD  | bofa +726.81",
//     testConfig
//   );
//   expectToBeNotError(res);
//   expect(res.output).toBe(`${today.format(
//     "YYYY-MM-DD"
//   )} * "Transfer to account in US" #costflow
//   Assets:CN:BOC                                 -5000.00 CNY @ 7.2681 USD
//   Assets:US:BofA:Checking                        +726.81 USD`);
// });

// test("Transaction #2.7", async () => {
//   const res = await costflow.parse(
//     "Transfer to account in US | boc -5000 CNY @@ 726.81 USD  | bofa +726.81",
//     testConfig
//   );
//   expectToBeNotError(res);
//   expect(res.output).toBe(`${today.format(
//     "YYYY-MM-DD"
//   )} * "Transfer to account in US" #costflow
//   Assets:CN:BOC                                 -5000.00 CNY @@ 726.81 USD
//   Assets:US:BofA:Checking                        +726.81 USD`);
// });

// test("Transaction #2.8", async () => {
//   const res = await costflow.parse(
//     "Bought shares of Apple | bofa -1915.5 | aapl 10 AAPL {191.55 USD}",
//     testConfig
//   );
//   expectToBeNotError(res);
//   expect(res.output).toBe(`${today.format(
//     "YYYY-MM-DD"
//   )} * "Bought shares of Apple" #costflow
//   Assets:US:BofA:Checking                       -1915.50 USD
//   Assets:ETrade:AAPL                             +10.00 AAPL {191.55 USD}`);
// });

// test("Transaction #2.9", async () => {
//   const res = await costflow.parse(
//     "Sold shares of Apple | aapl -10.00 AAPL {191.55 USD} @ 201.55 USD | cg -100.00 USD | bofa +2015.5",
//     testConfig
//   );
//   expectToBeNotError(res);
//   expect(res.output).toBe(`${today.format(
//     "YYYY-MM-DD"
//   )} * "Sold shares of Apple" #costflow
//   Assets:ETrade:AAPL                             -10.00 AAPL {191.55 USD} @ 201.55 USD
//   Income:Etrade:CapitalGains                     -100.00 USD
//   Assets:US:BofA:Checking                       +2015.50 USD`);
// });

test("Transaction #2.10", async () => {
  const res = await costflow.parse(
    "@麦当劳 #food #mc visa -180 CNY | food 180 CNY",
    testConfig
  );
  expectToBeNotError(res);
  expect(res.date).toBe(today.format("YYYY-MM-DD"));
  expect(res.completed).toBe(true);
  expect(res.payee).toBe("麦当劳");
  expect(res.narration).toBe("");
  expect(res.tags).toEqual(["costflow", "food", "mc"]);
  expect(res.data).toEqual([
    {
      account: "Liabilities:Visa",
      amount: -180,
      currency: "CNY",
    },
    {
      account: "Expenses:Food",
      amount: 180,
      currency: "CNY",
    },
  ]);
});
