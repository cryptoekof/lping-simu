// Browser localStorage utility for persisting user data

const STORAGE_KEYS = {
  TREASURY: 'defi-simulator-treasury',
  ALLOCATIONS: 'defi-simulator-allocations',
  INITIAL_PRICES: 'defi-simulator-initial-prices',
  START_DATE: 'defi-simulator-start-date',
};

/**
 * Save data to localStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to store (will be JSON stringified)
 */
export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
}

/**
 * Load data from localStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} - Parsed value or default
 */
export function loadFromStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
}

/**
 * Remove data from localStorage
 * @param {string} key - Storage key
 */
export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
}

/**
 * Clear all simulator data
 */
export function clearAllData() {
  Object.values(STORAGE_KEYS).forEach(key => {
    removeFromStorage(key);
  });
}

// Treasury management
export function saveTreasury(amount) {
  saveToStorage(STORAGE_KEYS.TREASURY, amount);
}

export function loadTreasury() {
  return loadFromStorage(STORAGE_KEYS.TREASURY, 10000); // Default $10,000
}

// Allocations management (how much is allocated to each pool)
export function saveAllocations(allocations) {
  saveToStorage(STORAGE_KEYS.ALLOCATIONS, allocations);
}

export function loadAllocations() {
  return loadFromStorage(STORAGE_KEYS.ALLOCATIONS, {
    'eth-usdc': 0,
    'btc-usdc': 0,
    'sol-usdc': 0,
  });
}

// Initial prices (for impermanent loss calculation)
export function saveInitialPrices(prices) {
  saveToStorage(STORAGE_KEYS.INITIAL_PRICES, prices);
}

export function loadInitialPrices() {
  return loadFromStorage(STORAGE_KEYS.INITIAL_PRICES, {});
}

// Simulation start date
export function saveStartDate(date) {
  saveToStorage(STORAGE_KEYS.START_DATE, date);
}

export function loadStartDate() {
  return loadFromStorage(STORAGE_KEYS.START_DATE, new Date().toISOString());
}

/**
 * Calculate days elapsed since start
 * @returns {number} - Days elapsed
 */
export function getDaysElapsed() {
  const startDate = new Date(loadStartDate());
  const now = new Date();
  const diffTime = Math.abs(now - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Reset simulation - keeps treasury but resets allocations and dates
 */
export function resetSimulation() {
  removeFromStorage(STORAGE_KEYS.ALLOCATIONS);
  removeFromStorage(STORAGE_KEYS.INITIAL_PRICES);
  removeFromStorage(STORAGE_KEYS.START_DATE);
}

export { STORAGE_KEYS };
