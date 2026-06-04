import { fetchMenuData, getCachedMenu, setCachedMenu } from './src/menuService.js';
import { MENU_DATA } from './src/MenuData.js';

// Setup Mock LocalStorage
const mockLocalStorageStore = {};
globalThis.localStorage = {
  getItem: (key) => mockLocalStorageStore[key] || null,
  setItem: (key, value) => { mockLocalStorageStore[key] = String(value); },
  removeItem: (key) => { delete mockLocalStorageStore[key]; },
  clear: () => { for (const key in mockLocalStorageStore) delete mockLocalStorageStore[key]; }
};

// Check if Directus is running
const DIRECTUS_URL = (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_DIRECTUS_API_URL : null) || (typeof process !== 'undefined' && process.env ? process.env.VITE_DIRECTUS_API_URL : null) || 'http://localhost:8055';

async function checkDirectusOnline() {
  try {
    const res = await fetch(`${DIRECTUS_URL}/server/info`);
    return res.ok;
  } catch {
    return false;
  }
}

async function runTests() {
  console.log('=== STARTING MENU FALLBACK LOGIC VERIFICATION ===');
  
  const isOnline = await checkDirectusOnline();
  if (!isOnline) {
    console.error('Error: Local Directus is not running on http://localhost:8055. Please start Directus before running this verification script.');
    process.exit(1);
  }
  console.log('✔ Directus is online.');

  // Clean cache first
  localStorage.clear();

  // ==========================================
  // LEVEL 1 TEST: Directus is Available
  // ==========================================
  console.log('\n--- Test Level 1: Fetching from Directus API ---');
  console.log('Expecting console log: "Menu source: Directus API"');
  
  const originalLog = console.log;
  let loggedSource = '';
  console.log = (...args) => {
    if (args[0] && args[0].startsWith('Menu source:')) {
      loggedSource = args[0];
    }
    originalLog(...args);
  };

  const level1Menu = await fetchMenuData();
  console.log = originalLog;

  if (loggedSource !== 'Menu source: Directus API') {
    console.error(`❌ Fail: Logged source was "${loggedSource}" instead of "Menu source: Directus API"`);
    process.exit(1);
  }
  console.log('✔ Level 1 fetch successful.');

  // Verify caching worked
  const cached = getCachedMenu();
  if (!cached) {
    console.error('❌ Fail: Menu was not saved to cache.');
    process.exit(1);
  }
  console.log('✔ Menu successfully saved to cache.');

  // ==========================================
  // LEVEL 2 TEST: Directus is Offline
  // ==========================================
  console.log('\n--- Test Level 2: Fetching from Cache when Directus is Offline ---');
  console.log('Simulating offline by intercepting fetch...');

  // Mock global fetch to throw error for Directus endpoints
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options) => {
    if (url.includes(DIRECTUS_URL)) {
      throw new Error('Connection refused (simulated offline)');
    }
    return originalFetch(url, options);
  };

  loggedSource = '';
  console.log = (...args) => {
    if (args[0] && args[0].startsWith('Menu source:')) {
      loggedSource = args[0];
    }
    originalLog(...args);
  };

  const level2Menu = await fetchMenuData();
  console.log = originalLog;

  if (loggedSource !== 'Menu source: cached last successful response') {
    console.error(`❌ Fail: Logged source was "${loggedSource}" instead of "Menu source: cached last successful response"`);
    process.exit(1);
  }
  console.log('✔ Level 2 fetch successful (loaded from cache).');

  // Verify cache data matches level 1 data
  if (JSON.stringify(level2Menu) !== JSON.stringify(level1Menu)) {
    console.error('❌ Fail: Level 2 menu data does not match Level 1 cached data.');
    process.exit(1);
  }
  console.log('✔ Cached menu data matches perfectly.');

  // ==========================================
  // LEVEL 3 TEST: Emergency Fallback
  // ==========================================
  console.log('\n--- Test Level 3: Emergency Fallback when Directus is Offline & Cache is Empty ---');
  console.log('Clearing local cache...');
  localStorage.clear();

  loggedSource = '';
  console.log = (...args) => {
    if (args[0] && args[0].startsWith('Menu source:')) {
      loggedSource = args[0];
    }
    originalLog(...args);
  };

  const level3Menu = await fetchMenuData();
  console.log = originalLog;

  if (loggedSource !== 'Menu source: emergency local fallback') {
    console.error(`❌ Fail: Logged source was "${loggedSource}" instead of "Menu source: emergency local fallback"`);
    process.exit(1);
  }
  console.log('✔ Level 3 fetch successful (loaded original MENU_DATA).');

  // Restore fetch
  globalThis.fetch = originalFetch;

  // ==========================================
  // VERIFICATION PASSED
  // ==========================================
  console.log('\n==================================================');
  console.log('✔ ALL FALLBACK LOGIC VERIFICATION TESTS PASSED SUCCESSFULLY!');
  console.log('==================================================');
}

runTests().catch(err => {
  console.error('Test execution failed with error:', err);
  process.exit(1);
});
