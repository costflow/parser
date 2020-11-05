/*
  Part 14: Error
*/
// todo: use > and | at same time, etc.

// test('Error #1: Price', async () => {
//   const tmpConfig = Object.assign({}, testConfig)
//   delete tmpConfig.alphavantage
//   const data = await costflow.parse('price AAPL', tmpConfig)
//   expect(data.error).toBe('ALPHA_VANTAGE_KEY_NOT_EXIST')
// })

// test('Error #2: Snap', async () => {
//   const tmpConfig = Object.assign({}, testConfig)
//   delete tmpConfig.alphavantage
//   const data = await costflow.parse('$ 200 AAPL', tmpConfig)
//   expect(data.error).toBe('ALPHA_VANTAGE_KEY_NOT_EXIST')
// })

// test('Error #3: Alpha Vantage rate limit', async () => {
//   try {
//     await alphavantage.exchange(testConfig.alphavantage, 'USD', 'CNY')
//     await alphavantage.exchange(testConfig.alphavantage, 'USD', 'CNY')
//     await alphavantage.exchange(testConfig.alphavantage, 'USD', 'CNY')
//     await alphavantage.exchange(testConfig.alphavantage, 'USD', 'CNY')
//     await alphavantage.exchange(testConfig.alphavantage, 'USD', 'CNY')
//     await alphavantage.exchange(testConfig.alphavantage, 'USD', 'CNY')
//     await alphavantage.exchange(testConfig.alphavantage, 'USD', 'CNY')
//   } catch (err) {}

//   const data = await costflow.parse('$ 200 AAPL', testConfig)
//   expect(data.error).toBe('ALPHA_VANTAGE_KEY_INVALID_OR_EXCEED_RATE_LIMIT')
// }, 30000)
// test('Error #4: Formula not exist', async () => {
//   const data = await costflow.parse('f notExistFormula', testConfig)
//   expect(data.error).toBe('FORMULA_NOT_FOUND')
// })

// test('Error #5: Formula loop', async () => {
//   const data = await costflow.parse('f loop', testConfig)
//   expect(data.error).toBe('FORMULA_LOOP')
// })
