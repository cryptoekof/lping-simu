/**
 * Test file for Uniswap V3 Math Utilities
 * Validates calculations against Uniswap V3 whitepaper formulas
 *
 * To run: node src/utils/uniswapV3Math.test.js
 */

import {
  priceToSqrtPrice,
  sqrtPriceToPrice,
  priceToTick,
  tickToPrice,
  getLiquidityForAmount0,
  getLiquidityForAmount1,
  getAmount0ForLiquidity,
  getAmount1ForLiquidity,
  getTokenAmounts,
  calculatePositionFromAmount,
  getPositionStatus,
  validatePriceRange,
} from './uniswapV3Math.js';

// Helper function for approximate equality (for floating point comparisons)
function assertApprox(actual, expected, tolerance = 0.0001, message = '') {
  const diff = Math.abs(actual - expected);
  const relativeError = expected !== 0 ? diff / Math.abs(expected) : diff;

  if (relativeError > tolerance) {
    console.error(`❌ FAIL: ${message}`);
    console.error(`   Expected: ${expected}`);
    console.error(`   Actual: ${actual}`);
    console.error(`   Relative Error: ${(relativeError * 100).toFixed(4)}%`);
    return false;
  } else {
    console.log(`✅ PASS: ${message}`);
    return true;
  }
}

function assertEquals(actual, expected, message = '') {
  if (actual !== expected) {
    console.error(`❌ FAIL: ${message}`);
    console.error(`   Expected: ${expected}`);
    console.error(`   Actual: ${actual}`);
    return false;
  } else {
    console.log(`✅ PASS: ${message}`);
    return true;
  }
}

console.log('\n🧪 Testing Uniswap V3 Math Utilities\n');
console.log('=' .repeat(60));

let passed = 0;
let failed = 0;

// Test 1: Price to Sqrt Price Conversion
console.log('\n📊 Test 1: Price to Sqrt Price Conversion');
console.log('-'.repeat(60));
const price1 = 2000; // ETH price at $2000
const sqrtPrice1 = priceToSqrtPrice(price1);
const backToPrice1 = sqrtPriceToPrice(sqrtPrice1);
if (assertApprox(sqrtPrice1, Math.sqrt(2000), 0.0001, 'sqrtPrice calculation')) passed++; else failed++;
if (assertApprox(backToPrice1, price1, 0.0001, 'Round-trip price conversion')) passed++; else failed++;

// Test 2: Tick Conversion
console.log('\n📊 Test 2: Tick Conversion');
console.log('-'.repeat(60));
const price2 = 2000;
const tick2 = priceToTick(price2);
const backToPrice2 = tickToPrice(tick2);
// Tick conversion has some precision loss due to discrete ticks
if (assertApprox(backToPrice2, price2, 0.01, 'Round-trip tick conversion')) passed++; else failed++;

// Test 3: Liquidity from Token0 Amount
console.log('\n📊 Test 3: Liquidity from Token0 Amount');
console.log('-'.repeat(60));
// Example from whitepaper: Providing 1 ETH to a range
const amount0_test3 = 1.0;
const priceLower_test3 = 1800;
const priceUpper_test3 = 2200;
const sqrtPriceLower_test3 = priceToSqrtPrice(priceLower_test3);
const sqrtPriceUpper_test3 = priceToSqrtPrice(priceUpper_test3);
const liquidity_test3 = getLiquidityForAmount0(amount0_test3, sqrtPriceLower_test3, sqrtPriceUpper_test3);

// Verify: L = amount0 * (sqrtP_upper * sqrtP_lower) / (sqrtP_upper - sqrtP_lower)
const expectedLiquidity_test3 = amount0_test3 * (sqrtPriceUpper_test3 * sqrtPriceLower_test3) / (sqrtPriceUpper_test3 - sqrtPriceLower_test3);
if (assertApprox(liquidity_test3, expectedLiquidity_test3, 0.0001, 'Liquidity from amount0 formula')) passed++; else failed++;

// Test 4: Liquidity from Token1 Amount
console.log('\n📊 Test 4: Liquidity from Token1 Amount');
console.log('-'.repeat(60));
const amount1_test4 = 2000; // $2000 USDC
const liquidity_test4 = getLiquidityForAmount1(amount1_test4, sqrtPriceLower_test3, sqrtPriceUpper_test3);

// Verify: L = amount1 / (sqrtP_upper - sqrtP_lower)
const expectedLiquidity_test4 = amount1_test4 / (sqrtPriceUpper_test3 - sqrtPriceLower_test3);
if (assertApprox(liquidity_test4, expectedLiquidity_test4, 0.0001, 'Liquidity from amount1 formula')) passed++; else failed++;

// Test 5: Amount0 from Liquidity
console.log('\n📊 Test 5: Amount0 from Liquidity (Round-trip)');
console.log('-'.repeat(60));
const currentPrice_test5 = 2000;
const sqrtPriceCurrent_test5 = priceToSqrtPrice(currentPrice_test5);
const amount0_recovered = getAmount0ForLiquidity(liquidity_test3, sqrtPriceCurrent_test5, sqrtPriceUpper_test3);
// Since current price is in range, we should get a portion of the original amount0
if (amount0_recovered > 0 && amount0_recovered < amount0_test3) {
  console.log(`✅ PASS: Amount0 from liquidity is reasonable (${amount0_recovered.toFixed(6)} ETH)`);
  passed++;
} else {
  console.error(`❌ FAIL: Amount0 from liquidity out of expected range`);
  failed++;
}

// Test 6: Amount1 from Liquidity
console.log('\n📊 Test 6: Amount1 from Liquidity (Round-trip)');
console.log('-'.repeat(60));
const amount1_recovered = getAmount1ForLiquidity(liquidity_test4, sqrtPriceLower_test3, sqrtPriceCurrent_test5);
// Since current price is in range, we should get a portion of the original amount1
if (amount1_recovered > 0 && amount1_recovered < amount1_test4) {
  console.log(`✅ PASS: Amount1 from liquidity is reasonable (${amount1_recovered.toFixed(2)} USDC)`);
  passed++;
} else {
  console.error(`❌ FAIL: Amount1 from liquidity out of expected range`);
  failed++;
}

// Test 7: Position In Range
console.log('\n📊 Test 7: Position In Range - Both Tokens Required');
console.log('-'.repeat(60));
const currentPrice_test7 = 2000;
const priceLower_test7 = 1800;
const priceUpper_test7 = 2200;
const depositAmount_test7 = 1.0; // 1 ETH
const result_test7 = calculatePositionFromAmount(depositAmount_test7, true, currentPrice_test7, priceLower_test7, priceUpper_test7);
if (result_test7.amount0 > 0 && result_test7.amount1 > 0 && result_test7.inRange) {
  console.log(`✅ PASS: In-range position requires both tokens`);
  console.log(`   Token0 (ETH): ${result_test7.amount0.toFixed(6)}`);
  console.log(`   Token1 (USDC): ${result_test7.amount1.toFixed(2)}`);
  passed++;
} else {
  console.error(`❌ FAIL: In-range position should require both tokens`);
  failed++;
}

// Test 8: Position Below Range - Only Token0
console.log('\n📊 Test 8: Position Below Range - Only Token0 Required');
console.log('-'.repeat(60));
const currentPrice_test8 = 1500; // Below range
const priceLower_test8 = 1800;
const priceUpper_test8 = 2200;
const depositAmount_test8 = 1.0;
const result_test8 = calculatePositionFromAmount(depositAmount_test8, true, currentPrice_test8, priceLower_test8, priceUpper_test8);
if (result_test8.amount0 > 0 && result_test8.amount1 === 0 && !result_test8.inRange) {
  console.log(`✅ PASS: Below-range position only requires token0`);
  console.log(`   Token0 (ETH): ${result_test8.amount0.toFixed(6)}`);
  console.log(`   Token1 (USDC): ${result_test8.amount1.toFixed(2)}`);
  passed++;
} else {
  console.error(`❌ FAIL: Below-range position should only require token0`);
  failed++;
}

// Test 9: Position Above Range - Only Token1
console.log('\n📊 Test 9: Position Above Range - Only Token1 Required');
console.log('-'.repeat(60));
const currentPrice_test9 = 2500; // Above range
const priceLower_test9 = 1800;
const priceUpper_test9 = 2200;
const depositAmount_test9 = 2000; // $2000 USDC
const result_test9 = calculatePositionFromAmount(depositAmount_test9, false, currentPrice_test9, priceLower_test9, priceUpper_test9);
if (result_test9.amount0 === 0 && result_test9.amount1 > 0 && !result_test9.inRange) {
  console.log(`✅ PASS: Above-range position only requires token1`);
  console.log(`   Token0 (ETH): ${result_test9.amount0.toFixed(6)}`);
  console.log(`   Token1 (USDC): ${result_test9.amount1.toFixed(2)}`);
  passed++;
} else {
  console.error(`❌ FAIL: Above-range position should only require token1`);
  failed++;
}

// Test 10: Position Status Calculation
console.log('\n📊 Test 10: Position Status and Proportions');
console.log('-'.repeat(60));
const status_test10 = getPositionStatus(2000, 1800, 2200, 0.5, 1000);
if (status_test10.inRange && status_test10.status === 'in_range' && status_test10.totalValue > 0) {
  console.log(`✅ PASS: Position status correctly identified as in_range`);
  console.log(`   Total Value: $${status_test10.totalValue.toFixed(2)}`);
  console.log(`   Token0 Proportion: ${status_test10.proportion0.toFixed(1)}%`);
  console.log(`   Token1 Proportion: ${status_test10.proportion1.toFixed(1)}%`);
  passed++;
} else {
  console.error(`❌ FAIL: Position status calculation incorrect`);
  failed++;
}

// Test 11: Price Range Validation
console.log('\n📊 Test 11: Price Range Validation');
console.log('-'.repeat(60));
const validation1 = validatePriceRange(1800, 2200, 2000);
const validation2 = validatePriceRange(2200, 1800, 2000); // Invalid: lower > upper
const validation3 = validatePriceRange(-100, 2200, 2000); // Invalid: negative price
if (validation1.valid && !validation2.valid && !validation3.valid) {
  console.log(`✅ PASS: Price range validation works correctly`);
  passed++;
} else {
  console.error(`❌ FAIL: Price range validation incorrect`);
  failed++;
}

// Test 12: Conservation of Value
console.log('\n📊 Test 12: Value Conservation (Position value calculation)');
console.log('-'.repeat(60));
const amount0_test12 = 1.0;
const amount1_test12 = 1000;
const price_test12 = 2000;
const status_test12 = getPositionStatus(price_test12, 1800, 2200, amount0_test12, amount1_test12);
const expectedValue = (amount0_test12 * price_test12) + amount1_test12;
if (assertApprox(status_test12.totalValue, expectedValue, 0.0001, 'Total position value calculation')) passed++; else failed++;

// Test 13: Proportion Sum
console.log('\n📊 Test 13: Token Proportions Sum to 100%');
console.log('-'.repeat(60));
const proportionSum = status_test12.proportion0 + status_test12.proportion1;
if (assertApprox(proportionSum, 100, 0.01, 'Token proportions sum to 100%')) passed++; else failed++;

// Test 14: Edge Case - Full Range Position at Current Price
console.log('\n📊 Test 14: Edge Case - Wide Range Position');
console.log('-'.repeat(60));
const wideRange = calculatePositionFromAmount(1.0, true, 2000, 1000, 3000);
if (wideRange.amount0 > 0 && wideRange.amount1 > 0 && wideRange.inRange) {
  console.log(`✅ PASS: Wide range position calculation works`);
  passed++;
} else {
  console.error(`❌ FAIL: Wide range position calculation failed`);
  failed++;
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 TEST SUMMARY');
console.log('='.repeat(60));
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

if (failed === 0) {
  console.log('\n🎉 All tests passed! Calculations are correct according to Uniswap V3 whitepaper.\n');
} else {
  console.log('\n⚠️  Some tests failed. Please review the calculations.\n');
  process.exit(1);
}
