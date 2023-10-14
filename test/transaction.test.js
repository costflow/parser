import test from "ava";
import costflow from "../src/main.mjs";
import { testConfig, today } from "./common.js";

/*
 * Transaction
 */

// Use >
test("Transaction #1.1", async (t) => {
  const res = await costflow(
    '2017-01-05 "RiverBank Properties" "Paying the rent" 2400 Assets:US:BofA:Checking > 2400  Expenses:Home:Rent',
    testConfig
  );
  t.is(res.error, undefined);
  t.is(res.date, "2017-01-05");
  expect(res.completed).toBe(true);
  expect(res.payee).toBe("RiverBank Properties");
  expect(res.narration).toBe("Paying the rent");
  expect(res.tags).toEqual(["costflow"]);
  t.deepEqual(res.data, [
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
test("Transaction #1.2", async (t) => {
  const res = await costflow(
    "@Verizon 59.61 Assets:BofA > Expenses:Phone",
    testConfig
  );
  t.is(res.error, undefined);
  t.is(res.date, today.format("YYYY-MM-DD"));
  expect(res.completed).toBe(true);
  expect(res.payee).toBe("Verizon");
  expect(res.narration).toBe("");
  expect(res.tags).toEqual(["costflow"]);
  t.deepEqual(res.data, [
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

test("Transaction #1.3", async (t) => {
  const res = await costflow("@Verizon 59.61 bofa > phone", testConfig);
  t.is(res.error, undefined);

  t.is(res.date, today.format("YYYY-MM-DD"));
  expect(res.completed).toBe(true);
  expect(res.payee).toBe("Verizon");
  expect(res.narration).toBe("");
  expect(res.tags).toEqual(["costflow"]);
  t.deepEqual(res.data, [
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

test("Transaction #1.4", async (t) => {
  const res = await costflow(
    "Rent ^rent 750 bofa + 750 visa > rent",
    testConfig
  );
  t.is(res.error, undefined);

  t.is(res.date, today.format("YYYY-MM-DD"));
  expect(res.completed).toBe(true);
  expect(res.payee).toBe(null);
  expect(res.narration).toBe("Rent");
  expect(res.tags).toEqual(["costflow"]);
  expect(res.links).toEqual(["rent"]);
  t.deepEqual(res.data, [
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

test("Transaction #1.5", async (t) => {
  const res = await costflow(
    "! Sushi 7200 JPY bofa > food + alice + bob",
    testConfig
  );
  t.is(res.error, undefined);

  t.is(res.date, today.format("YYYY-MM-DD"));
  expect(res.completed).toBe(false);
  expect(res.payee).toBe(null);
  expect(res.narration).toBe("Sushi");
  expect(res.tags).toEqual(["costflow"]);
  t.deepEqual(res.data, [
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

test("Transaction #1.6", async (t) => {
  const res = await costflow(
    "! Sushi 7200 JPY > food + alice + bob",
    testConfig
  );
  t.is(res.error, undefined);

  t.is(res.date, today.format("YYYY-MM-DD"));
  expect(res.completed).toBe(false);
  expect(res.payee).toBe(null);
  expect(res.narration).toBe("Sushi");
  expect(res.tags).toEqual(["costflow"]);
  t.deepEqual(res.data, [
    {
      account: "Assets:BofA", // default account
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

test("Transaction #1.7", async (t) => {
  const res = await costflow(
    "Sushi 7200 JPY bofa > 4200 food + alice",
    testConfig
  );
  t.is(res.error, undefined);

  t.is(res.date, today.format("YYYY-MM-DD"));
  expect(res.completed).toBe(true);
  expect(res.payee).toBe(null);
  expect(res.narration).toBe("Sushi");
  expect(res.tags).toEqual(["costflow"]);
  t.deepEqual(res.data, [
    {
      account: "Assets:BofA",
      amount: -7200,
      currency: "JPY",
    },
    {
      account: "Expenses:Food",
      amount: 4200,
      currency: "JPY",
    },
    {
      account: "Assets:Receivables:Alice",
      amount: 3000,
      currency: "JPY",
    },
  ]);
});

// todo: support @ / @@ / {}
// test("Transaction #1.6", async t => {
//   const res = await costflow(
//     "Transfer to account in US 5000 CNY @ 7.2681 USD boc > 726.81 USD bofa",
//     testConfig
//   );
//   t.is(res.error, undefined);
//   expect(res.output).toBe(`${today.format(
//     "YYYY-MM-DD"
//   )} * "Transfer to account in US" #costflow
//   Assets:CN:BOC                                 -5000.00 CNY @ 7.2681 USD
//   Assets:US:BofA:Checking                        +726.81 USD`);
// });

// test("Transaction #1.7", async t => {
//   const res = await costflow(
//     "Transfer to account in US 5000 CNY @@ 726.81 USD boc > 726.81 USD bofa",
//     testConfig
//   );
//   t.is(res.error, undefined);
//   expect(res.output).toBe(`${today.format(
//     "YYYY-MM-DD"
//   )} * "Transfer to account in US" #costflow
//   Assets:CN:BOC                                 -5000.00 CNY @@ 726.81 USD
//   Assets:US:BofA:Checking                        +726.81 USD`);
// });

// test("Transaction #1.8", async t => {
//   const res = await costflow(
//     "Bought shares of Apple 1915.5 bofa > 10 AAPL {191.55 USD} aapl",
//     testConfig
//   );
//   t.is(res.error, undefined);
//   expect(res.output).toBe(`${today.format(
//     "YYYY-MM-DD"
//   )} * "Bought shares of Apple" #costflow
//   Assets:US:BofA:Checking                       -1915.50 USD
//   Assets:ETrade:AAPL                             +10.00 AAPL {191.55 USD}`);
// });

// test("Transaction #1.9", async t => {
//   const res = await costflow(
//     "Sold shares of Apple 10 AAPL {191.55 USD} @ 201.55 USD aapl + 100 USD cg > 2015.5 bofa",
//     testConfig
//   );
//   t.is(res.error, undefined);
//   expect(res.output).toBe(`${today.format(
//     "YYYY-MM-DD"
//   )} * "Sold shares of Apple" #costflow
//   Assets:ETrade:AAPL                             -10.00 AAPL {191.55 USD} @ 201.55 USD
//   Income:Etrade:CapitalGains                     -100.00 USD
//   Assets:US:BofA:Checking                       +2015.50 USD`);
// });

test("Transaction #1.10", async (t) => {
  const res = await costflow(
    "@麦当劳 #food #mc 180 CNY visa > food",
    testConfig
  );
  t.is(res.error, undefined);

  t.is(res.date, today.format("YYYY-MM-DD"));
  expect(res.completed).toBe(true);
  expect(res.payee).toBe("麦当劳");
  expect(res.narration).toBe("");
  expect(res.tags).toEqual(["costflow", "food", "mc"]);
  t.deepEqual(res.data, [
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

test("Transaction #1.11", async (t) => {
  const res = await costflow(
    "@麦当劳 #food #mc 180 CNY visa to food",
    Object.assign(testConfig, {
      flowSymbol: "to",
    })
  );
  t.is(res.error, undefined);

  t.is(res.date, today.format("YYYY-MM-DD"));
  expect(res.completed).toBe(true);
  expect(res.payee).toBe("麦当劳");
  expect(res.narration).toBe("");
  expect(res.tags).toEqual(["costflow", "food", "mc"]);
  t.deepEqual(res.data, [
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
test("Transaction #2.1", async (t) => {
  const res = await costflow(
    '2017-01-05 "RiverBank Properties" "Paying the rent" Assets:US:BofA:Checking -2400 | Expenses:Home:Rent 2400',
    testConfig
  );
  t.is(res.error, undefined);

  t.is(res.date, "2017-01-05");
  expect(res.completed).toBe(true);
  expect(res.payee).toBe("RiverBank Properties");
  expect(res.narration).toBe("Paying the rent");
  expect(res.tags).toEqual(["costflow"]);
  t.deepEqual(res.data, [
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
test("Transaction #2.2", async (t) => {
  const res = await costflow(
    "@Verizon Assets:BofA -59.61 | Expenses:Phone 59.61",
    testConfig
  );
  t.is(res.error, undefined);
  t.is(res.date, today.format("YYYY-MM-DD"));
  expect(res.completed).toBe(true);
  expect(res.payee).toBe("Verizon");
  expect(res.narration).toBe("");
  expect(res.tags).toEqual(["costflow"]);
  t.deepEqual(res.data, [
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

test("Transaction #2.3", async (t) => {
  const res = await costflow("@Verizon bofa -59.61 | phone 59.61", testConfig);
  t.is(res.error, undefined);
  t.is(res.date, today.format("YYYY-MM-DD"));
  expect(res.completed).toBe(true);
  expect(res.payee).toBe("Verizon");
  expect(res.narration).toBe("");
  expect(res.tags).toEqual(["costflow"]);
  t.deepEqual(res.data, [
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

test("Transaction #2.4", async (t) => {
  const res = await costflow(
    "Rent #costflow bofa -750 | visa -750 | rent 1500",
    testConfig
  );
  t.is(res.error, undefined);
  t.is(res.date, today.format("YYYY-MM-DD"));
  expect(res.completed).toBe(true);
  expect(res.payee).toBe(null);
  expect(res.narration).toBe("Rent");
  expect(res.tags).toEqual(["costflow"]);
  t.deepEqual(res.data, [
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

test("Transaction #2.5", async (t) => {
  const res = await costflow(
    "! Sushi bofa -7200 JPY | food 2400 JPY | alice 2400 JPY | bob 2400 JPY",
    testConfig
  );
  t.is(res.error, undefined);

  t.is(res.date, today.format("YYYY-MM-DD"));
  expect(res.completed).toBe(false);
  expect(res.payee).toBe(null);
  expect(res.narration).toBe("Sushi");
  expect(res.tags).toEqual(["costflow"]);
  t.deepEqual(res.data, [
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

test("Transaction #2.6", async (t) => {
  const res = await costflow(
    "! Sushi -7200 JPY | food 2400 JPY | alice 2400 JPY | bob 2400 JPY",
    testConfig
  );
  t.is(res.error, undefined);

  t.is(res.date, today.format("YYYY-MM-DD"));
  expect(res.completed).toBe(false);
  expect(res.payee).toBe(null);
  expect(res.narration).toBe("Sushi");
  expect(res.tags).toEqual(["costflow"]);
  t.deepEqual(res.data, [
    {
      account: "Assets:BofA", // default account
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

// test("Transaction #2.6", async t => {
//   const res = await costflow(
//     "Transfer to account in US | boc -5000 CNY @ 7.2681 USD  | bofa +726.81",
//     testConfig
//   );
//   t.is(res.error, undefined);
//   expect(res.output).toBe(`${today.format(
//     "YYYY-MM-DD"
//   )} * "Transfer to account in US" #costflow
//   Assets:CN:BOC                                 -5000.00 CNY @ 7.2681 USD
//   Assets:US:BofA:Checking                        +726.81 USD`);
// });

// test("Transaction #2.7", async t => {
//   const res = await costflow(
//     "Transfer to account in US | boc -5000 CNY @@ 726.81 USD  | bofa +726.81",
//     testConfig
//   );
//   t.is(res.error, undefined);
//   expect(res.output).toBe(`${today.format(
//     "YYYY-MM-DD"
//   )} * "Transfer to account in US" #costflow
//   Assets:CN:BOC                                 -5000.00 CNY @@ 726.81 USD
//   Assets:US:BofA:Checking                        +726.81 USD`);
// });

// test("Transaction #2.8", async t => {
//   const res = await costflow(
//     "Bought shares of Apple | bofa -1915.5 | aapl 10 AAPL {191.55 USD}",
//     testConfig
//   );
//   t.is(res.error, undefined);
//   expect(res.output).toBe(`${today.format(
//     "YYYY-MM-DD"
//   )} * "Bought shares of Apple" #costflow
//   Assets:US:BofA:Checking                       -1915.50 USD
//   Assets:ETrade:AAPL                             +10.00 AAPL {191.55 USD}`);
// });

// test("Transaction #2.9", async t => {
//   const res = await costflow(
//     "Sold shares of Apple | aapl -10.00 AAPL {191.55 USD} @ 201.55 USD | cg -100.00 USD | bofa +2015.5",
//     testConfig
//   );
//   t.is(res.error, undefined);
//   expect(res.output).toBe(`${today.format(
//     "YYYY-MM-DD"
//   )} * "Sold shares of Apple" #costflow
//   Assets:ETrade:AAPL                             -10.00 AAPL {191.55 USD} @ 201.55 USD
//   Income:Etrade:CapitalGains                     -100.00 USD
//   Assets:US:BofA:Checking                       +2015.50 USD`);
// });

test("Transaction #2.10", async (t) => {
  const res = await costflow(
    "@麦当劳 #food #mc visa -180 CNY | food 180 CNY",
    testConfig
  );
  t.is(res.error, undefined);
  t.is(res.date, today.format("YYYY-MM-DD"));
  expect(res.completed).toBe(true);
  expect(res.payee).toBe("麦当劳");
  expect(res.narration).toBe("");
  expect(res.tags).toEqual(["costflow", "food", "mc"]);
  t.deepEqual(res.data, [
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

test("Transaction #2.11", async (t) => {
  const res = await costflow(
    "@麦当劳 #food #mc visa -180 CNY / food 180 CNY",
    Object.assign(testConfig, { pipeSymbol: "/" })
  );
  t.is(res.error, undefined);
  t.is(res.date, today.format("YYYY-MM-DD"));
  expect(res.completed).toBe(true);
  expect(res.payee).toBe("麦当劳");
  expect(res.narration).toBe("");
  expect(res.tags).toEqual(["costflow", "food", "mc"]);
  t.deepEqual(res.data, [
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
