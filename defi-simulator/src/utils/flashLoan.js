/**
 * Flash Loan Simulator
 * Educational tool to understand flash loans step-by-step
 *
 * Flash loans are uncollateralized loans that must be repaid within
 * the same transaction. If repayment fails, the entire transaction reverts.
 *
 * Based on Aave Flash Loan protocol
 */

/**
 * Flash loan fee structure
 */
export const FLASH_LOAN_FEE = 0.0009; // 0.09% (9 basis points)

/**
 * Flash loan execution steps
 */
export const FLASH_LOAN_STEPS = {
  INITIATE: {
    id: 'initiate',
    name: 'Initiate Flash Loan',
    description: 'Request loan from flash loan provider',
    icon: '🏦'
  },
  RECEIVE: {
    id: 'receive',
    name: 'Receive Funds',
    description: 'Borrowed funds are transferred to your contract',
    icon: '💰'
  },
  EXECUTE: {
    id: 'execute',
    name: 'Execute Strategy',
    description: 'Use the funds for arbitrage, liquidation, or other operations',
    icon: '⚡'
  },
  REPAY: {
    id: 'repay',
    name: 'Repay Loan + Fee',
    description: 'Return the borrowed amount plus fee',
    icon: '💸'
  },
  COMPLETE: {
    id: 'complete',
    name: 'Transaction Complete',
    description: 'Keep the profit, transaction is finalized',
    icon: '✅'
  },
  FAILED: {
    id: 'failed',
    name: 'Transaction Failed',
    description: 'Insufficient funds to repay - entire transaction reverts',
    icon: '❌'
  }
};

/**
 * Calculate flash loan fee
 *
 * @param {number} loanAmount - Amount borrowed
 * @param {number} feeRate - Fee rate (default 0.09%)
 * @returns {number} - Fee amount
 */
export function calculateFlashLoanFee(loanAmount, feeRate = FLASH_LOAN_FEE) {
  return loanAmount * feeRate;
}

/**
 * Calculate total repayment amount
 *
 * @param {number} loanAmount - Amount borrowed
 * @param {number} feeRate - Fee rate
 * @returns {Object} - {principal, fee, total}
 */
export function calculateRepayment(loanAmount, feeRate = FLASH_LOAN_FEE) {
  const fee = calculateFlashLoanFee(loanAmount, feeRate);
  const total = loanAmount + fee;

  return {
    principal: loanAmount,
    fee,
    total
  };
}

/**
 * Simulate an arbitrage flash loan
 * Buy low on one DEX, sell high on another
 *
 * @param {number} loanAmount - Flash loan amount
 * @param {number} buyPrice - Price on DEX A
 * @param {number} sellPrice - Price on DEX B
 * @param {number} feeRate - Flash loan fee rate
 * @returns {Object} - Arbitrage simulation result
 */
export function simulateArbitrage(loanAmount, buyPrice, sellPrice, feeRate = FLASH_LOAN_FEE) {
  const steps = [];

  // Step 1: Initiate flash loan
  steps.push({
    step: FLASH_LOAN_STEPS.INITIATE,
    balance: 0,
    action: `Request flash loan of $${loanAmount.toLocaleString()}`
  });

  // Step 2: Receive funds
  steps.push({
    step: FLASH_LOAN_STEPS.RECEIVE,
    balance: loanAmount,
    action: `Received $${loanAmount.toLocaleString()} in your contract`
  });

  // Step 3: Buy on DEX A
  const tokensReceived = loanAmount / buyPrice;
  steps.push({
    step: FLASH_LOAN_STEPS.EXECUTE,
    phase: 'buy',
    balance: 0,
    tokens: tokensReceived,
    action: `Buy ${tokensReceived.toFixed(2)} tokens at $${buyPrice} on DEX A`,
    dex: 'DEX A'
  });

  // Step 4: Sell on DEX B
  const usdcReceived = tokensReceived * sellPrice;
  const profit = usdcReceived - loanAmount;
  steps.push({
    step: FLASH_LOAN_STEPS.EXECUTE,
    phase: 'sell',
    balance: usdcReceived,
    tokens: 0,
    action: `Sell ${tokensReceived.toFixed(2)} tokens at $${sellPrice} on DEX B`,
    dex: 'DEX B',
    received: usdcReceived
  });

  // Step 5: Repay loan
  const repayment = calculateRepayment(loanAmount, feeRate);
  const finalBalance = usdcReceived - repayment.total;
  const success = finalBalance >= 0;

  if (success) {
    steps.push({
      step: FLASH_LOAN_STEPS.REPAY,
      balance: finalBalance,
      action: `Repay $${loanAmount.toLocaleString()} + $${repayment.fee.toFixed(2)} fee`,
      repayment: repayment.total
    });

    steps.push({
      step: FLASH_LOAN_STEPS.COMPLETE,
      balance: finalBalance,
      action: `Keep profit of $${finalBalance.toFixed(2)}`,
      profit: finalBalance
    });
  } else {
    steps.push({
      step: FLASH_LOAN_STEPS.FAILED,
      balance: usdcReceived,
      shortfall: Math.abs(finalBalance),
      action: `Cannot repay! Short by $${Math.abs(finalBalance).toFixed(2)}`,
      reason: 'Insufficient funds to cover loan + fee'
    });
  }

  return {
    success,
    loanAmount,
    buyPrice,
    sellPrice,
    tokensReceived,
    usdcReceived,
    fee: repayment.fee,
    grossProfit: profit,
    netProfit: success ? finalBalance : 0,
    steps,
    profitPercent: success ? (finalBalance / loanAmount) * 100 : 0
  };
}

/**
 * Simulate a liquidation flash loan
 * Borrow funds to liquidate an undercollateralized position
 *
 * @param {number} loanAmount - Flash loan amount
 * @param {number} debtAmount - Debt to repay
 * @param {number} collateralValue - Value of collateral seized
 * @param {number} liquidationBonus - Bonus percentage (e.g., 0.05 for 5%)
 * @param {number} feeRate - Flash loan fee rate
 * @returns {Object} - Liquidation simulation result
 */
export function simulateLiquidation(
  loanAmount,
  debtAmount,
  collateralValue,
  liquidationBonus = 0.05,
  feeRate = FLASH_LOAN_FEE
) {
  const steps = [];

  // Step 1: Initiate flash loan
  steps.push({
    step: FLASH_LOAN_STEPS.INITIATE,
    balance: 0,
    action: `Request flash loan of $${loanAmount.toLocaleString()} to liquidate position`
  });

  // Step 2: Receive funds
  steps.push({
    step: FLASH_LOAN_STEPS.RECEIVE,
    balance: loanAmount,
    action: `Received $${loanAmount.toLocaleString()}`
  });

  // Step 3: Repay borrower's debt
  const remainingAfterDebt = loanAmount - debtAmount;
  steps.push({
    step: FLASH_LOAN_STEPS.EXECUTE,
    phase: 'liquidate',
    balance: remainingAfterDebt,
    action: `Repay borrower's debt of $${debtAmount.toLocaleString()}`,
    debtRepaid: debtAmount
  });

  // Step 4: Seize collateral with bonus
  const bonusCollateral = collateralValue * (1 + liquidationBonus);
  const totalBalance = remainingAfterDebt + bonusCollateral;
  steps.push({
    step: FLASH_LOAN_STEPS.EXECUTE,
    phase: 'seize',
    balance: totalBalance,
    action: `Seize collateral worth $${collateralValue.toLocaleString()} + ${(liquidationBonus * 100)}% bonus`,
    collateralSeized: bonusCollateral
  });

  // Step 5: Repay flash loan
  const repayment = calculateRepayment(loanAmount, feeRate);
  const finalBalance = totalBalance - repayment.total;
  const success = finalBalance >= 0;

  if (success) {
    steps.push({
      step: FLASH_LOAN_STEPS.REPAY,
      balance: finalBalance,
      action: `Repay $${loanAmount.toLocaleString()} + $${repayment.fee.toFixed(2)} fee`,
      repayment: repayment.total
    });

    steps.push({
      step: FLASH_LOAN_STEPS.COMPLETE,
      balance: finalBalance,
      action: `Liquidation successful! Profit: $${finalBalance.toFixed(2)}`,
      profit: finalBalance
    });
  } else {
    steps.push({
      step: FLASH_LOAN_STEPS.FAILED,
      balance: totalBalance,
      shortfall: Math.abs(finalBalance),
      action: `Liquidation failed! Short by $${Math.abs(finalBalance).toFixed(2)}`,
      reason: 'Collateral + bonus not enough to cover loan + fee'
    });
  }

  return {
    success,
    loanAmount,
    debtAmount,
    collateralValue,
    liquidationBonus: liquidationBonus * 100,
    bonusCollateral,
    fee: repayment.fee,
    netProfit: success ? finalBalance : 0,
    steps,
    profitPercent: success ? (finalBalance / loanAmount) * 100 : 0
  };
}

/**
 * Simulate a collateral swap flash loan
 * Swap collateral from one type to another without closing position
 *
 * @param {number} loanAmount - Flash loan amount
 * @param {number} debtAmount - Existing debt to repay
 * @param {number} collateralAValue - Value of old collateral
 * @param {number} collateralBValue - Value of new collateral after swap
 * @param {number} swapFee - Swap fee percentage
 * @param {number} feeRate - Flash loan fee rate
 * @returns {Object} - Collateral swap simulation result
 */
export function simulateCollateralSwap(
  loanAmount,
  debtAmount,
  collateralAValue,
  collateralBValue,
  swapFee = 0.003,
  feeRate = FLASH_LOAN_FEE
) {
  const steps = [];

  // Step 1: Initiate flash loan
  steps.push({
    step: FLASH_LOAN_STEPS.INITIATE,
    balance: 0,
    action: `Request flash loan of $${loanAmount.toLocaleString()} for collateral swap`
  });

  // Step 2: Receive funds
  steps.push({
    step: FLASH_LOAN_STEPS.RECEIVE,
    balance: loanAmount,
    action: `Received $${loanAmount.toLocaleString()}`
  });

  // Step 3: Repay existing debt
  const balanceAfterRepay = loanAmount - debtAmount;
  steps.push({
    step: FLASH_LOAN_STEPS.EXECUTE,
    phase: 'repay_debt',
    balance: balanceAfterRepay,
    action: `Repay existing debt of $${debtAmount.toLocaleString()}`,
    debtRepaid: debtAmount
  });

  // Step 4: Withdraw old collateral
  const balanceAfterWithdraw = balanceAfterRepay + collateralAValue;
  steps.push({
    step: FLASH_LOAN_STEPS.EXECUTE,
    phase: 'withdraw',
    balance: balanceAfterWithdraw,
    action: `Withdraw old collateral A worth $${collateralAValue.toLocaleString()}`
  });

  // Step 5: Swap collateral
  const swapFeeAmount = collateralAValue * swapFee;
  const collateralBReceived = collateralBValue - swapFeeAmount;
  steps.push({
    step: FLASH_LOAN_STEPS.EXECUTE,
    phase: 'swap',
    balance: balanceAfterWithdraw - collateralAValue + collateralBReceived,
    action: `Swap to new collateral B (value: $${collateralBValue.toLocaleString()}, fee: $${swapFeeAmount.toFixed(2)})`,
    swapFee: swapFeeAmount
  });

  // Step 6: Deposit new collateral and reborrow
  const newBalance = balanceAfterWithdraw - collateralAValue + collateralBReceived;
  steps.push({
    step: FLASH_LOAN_STEPS.EXECUTE,
    phase: 'deposit',
    balance: newBalance + debtAmount,
    action: `Deposit new collateral B and reborrow $${debtAmount.toLocaleString()}`
  });

  // Step 7: Repay flash loan
  const repayment = calculateRepayment(loanAmount, feeRate);
  const finalBalance = newBalance + debtAmount - repayment.total;
  const success = finalBalance >= 0;

  if (success) {
    steps.push({
      step: FLASH_LOAN_STEPS.REPAY,
      balance: finalBalance,
      action: `Repay flash loan: $${loanAmount.toLocaleString()} + $${repayment.fee.toFixed(2)} fee`,
      repayment: repayment.total
    });

    steps.push({
      step: FLASH_LOAN_STEPS.COMPLETE,
      balance: finalBalance,
      action: `Collateral swap complete! New collateral B worth $${collateralBReceived.toFixed(2)}`,
      success: true
    });
  } else {
    steps.push({
      step: FLASH_LOAN_STEPS.FAILED,
      balance: newBalance + debtAmount,
      shortfall: Math.abs(finalBalance),
      action: `Swap failed! Short by $${Math.abs(finalBalance).toFixed(2)}`,
      reason: 'Insufficient funds after swap fees'
    });
  }

  const totalCost = repayment.fee + swapFeeAmount;

  return {
    success,
    loanAmount,
    debtAmount,
    oldCollateralValue: collateralAValue,
    newCollateralValue: collateralBReceived,
    flashLoanFee: repayment.fee,
    swapFee: swapFeeAmount,
    totalCost,
    steps,
    newCollateralType: 'Collateral B'
  };
}

/**
 * Check if flash loan will be profitable
 *
 * @param {number} loanAmount - Loan amount
 * @param {number} expectedReturn - Expected return from strategy
 * @param {number} feeRate - Flash loan fee rate
 * @returns {Object} - Profitability analysis
 */
export function checkProfitability(loanAmount, expectedReturn, feeRate = FLASH_LOAN_FEE) {
  const fee = calculateFlashLoanFee(loanAmount, feeRate);
  const netProfit = expectedReturn - loanAmount - fee;
  const profitable = netProfit > 0;
  const minReturnNeeded = loanAmount + fee;

  return {
    profitable,
    loanAmount,
    expectedReturn,
    fee,
    netProfit,
    netProfitPercent: (netProfit / loanAmount) * 100,
    minReturnNeeded,
    breakEvenReturn: minReturnNeeded
  };
}

/**
 * Calculate required price difference for profitable arbitrage
 *
 * @param {number} loanAmount - Flash loan amount
 * @param {number} buyPrice - Price on DEX A
 * @param {number} feeRate - Flash loan fee rate
 * @returns {number} - Minimum sell price for profit
 */
export function calculateMinSellPrice(loanAmount, buyPrice, feeRate = FLASH_LOAN_FEE) {
  const tokens = loanAmount / buyPrice;
  const repaymentNeeded = calculateRepayment(loanAmount, feeRate).total;
  const minSellPrice = repaymentNeeded / tokens;

  return minSellPrice;
}

/**
 * Get educational explanation for each step
 *
 * @param {string} stepId - Step ID
 * @returns {Object} - Educational content
 */
export function getStepEducation(stepId) {
  const education = {
    initiate: {
      title: 'Flash Loan Request',
      explanation: 'Your smart contract calls the flash loan provider (like Aave) requesting a specific amount. The provider checks if they have sufficient liquidity.',
      keyPoint: 'No collateral required! The loan and repayment happen atomically in one transaction.'
    },
    receive: {
      title: 'Funds Transfer',
      explanation: 'The flash loan provider transfers the requested amount to your contract. Your contract now has full access to these funds.',
      keyPoint: 'You must repay within the same transaction or everything reverts.'
    },
    execute: {
      title: 'Strategy Execution',
      explanation: 'Use the borrowed funds for your strategy: arbitrage, liquidation, collateral swap, etc. This is where you make your profit.',
      keyPoint: 'Common strategies: buy low/sell high, liquidate positions, swap collateral.'
    },
    repay: {
      title: 'Loan Repayment',
      explanation: 'Return the borrowed amount plus the flash loan fee (typically 0.09%). The provider verifies you have sufficient funds.',
      keyPoint: 'If you cannot repay, the ENTIRE transaction reverts - like it never happened!'
    },
    complete: {
      title: 'Success!',
      explanation: 'Transaction is finalized on the blockchain. You keep your profit, the provider gets their funds back plus fee.',
      keyPoint: 'No liquidation risk because there was never any debt - it all happened instantly.'
    },
    failed: {
      title: 'Transaction Reverted',
      explanation: 'The smart contract detected insufficient funds for repayment and reverted the entire transaction. All state changes are undone.',
      keyPoint: 'You only lose gas fees. The borrowed funds are returned as if you never borrowed them.'
    }
  };

  return education[stepId] || {};
}
