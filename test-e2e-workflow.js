import { fetchMenuData, getCachedMenu, setCachedMenu } from './src/menuService.js';
import { MENU_DATA } from './src/MenuData.js';
import { execSync } from 'child_process';

// Setup Mock LocalStorage
const mockLocalStorageStore = {};
globalThis.localStorage = {
  getItem: (key) => mockLocalStorageStore[key] || null,
  setItem: (key, value) => { mockLocalStorageStore[key] = String(value); },
  removeItem: (key) => { delete mockLocalStorageStore[key]; },
  clear: () => { for (const key in mockLocalStorageStore) delete mockLocalStorageStore[key]; }
};

const DIRECTUS_URL = (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_DIRECTUS_API_URL : null) || (typeof process !== 'undefined' && process.env ? process.env.VITE_DIRECTUS_API_URL : null) || 'http://localhost:8055';
const DISH_NAME = 'Паштет утиный с конфи из подкопченной брусники и бриошью';

function runCmd(cmd) {
  try {
    return execSync(cmd, { cwd: 'c:\\Users\\User\\Desktop\\sisi\\cafe-sisi-directus', encoding: 'utf8' });
  } catch (err) {
    console.error(`Command failed: ${cmd}`, err.message);
    throw err;
  }
}

async function waitDirectus(targetOnline) {
  const maxRetries = 20;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(`${DIRECTUS_URL}/server/info`);
      if (res.ok && targetOnline) return true;
    } catch {
      if (!targetOnline) return true;
    }
    await new Promise(r => setTimeout(r, 1500));
  }
  throw new Error(`Timeout waiting for Directus to be ${targetOnline ? 'online' : 'offline'}`);
}

function findDish(menu, name) {
  for (const cat of menu) {
    const dish = cat.items.find(i => i.name === name);
    if (dish) return dish;
  }
  return null;
}

async function runWorkflow() {
  console.log('=== STARTING 14-STEP E2E WORKFLOW VERIFICATION ===\n');

  // Step 1: Ensure Directus is started
  console.log('Step 1: Starting/ensuring Directus is running...');
  runCmd('docker compose start');
  await waitDirectus(true);
  console.log('✔ Directus is online.\n');

  // Step 2: Change the price of one dish in Directus (ID = 2, to 570)
  console.log(`Step 2: Changing price of "${DISH_NAME}" to 570 in Directus database...`);
  runCmd('docker exec -t cafe-sisi-directus-directus-1 sqlite3 /directus/database/data.db "UPDATE dishes SET price = 570 WHERE id = 2;"');
  console.log('✔ Price updated in DB.\n');

  // Step 3 & 4: Refresh/fetch menu, check that it shows the new price and prints Directus API source
  console.log('Step 3 & 4: Fetching menu from Directus API...');
  let loggedSource = '';
  const originalLog = console.log;
  console.log = (...args) => {
    if (args[0] && args[0].startsWith('Menu source:')) loggedSource = args[0];
    originalLog(...args);
  };

  localStorage.clear();
  const menu1 = await fetchMenuData();
  console.log = originalLog;

  const dish1 = findDish(menu1, DISH_NAME);
  console.log(`Loaded price: ${dish1 ? dish1.price : 'Not found'} (expected 570)`);
  console.log(`Logged source: ${loggedSource} (expected "Menu source: Directus API")`);

  if (!dish1 || dish1.price !== 570 || loggedSource !== 'Menu source: Directus API') {
    throw new Error('Verification failed at Step 4: price is incorrect or source log is wrong.');
  }
  console.log('✔ Level 1 (Directus API) check passed.\n');

  // Step 5: Turn off Directus
  console.log('Step 5: Stopping Directus container...');
  runCmd('docker compose stop');
  await waitDirectus(false);
  console.log('✔ Directus is stopped/offline.\n');

  // Step 6 & 7: Fetch menu while Directus is stopped, check that it keeps showing the new price (570) from cache, not the old price (550)
  console.log('Step 6 & 7: Fetching menu while Directus is offline...');
  loggedSource = '';
  console.log = (...args) => {
    if (args[0] && args[0].startsWith('Menu source:')) loggedSource = args[0];
    originalLog(...args);
  };

  const menu2 = await fetchMenuData();
  console.log = originalLog;

  const dish2 = findDish(menu2, DISH_NAME);
  console.log(`Loaded price: ${dish2 ? dish2.price : 'Not found'} (expected 570)`);
  console.log(`Logged source: ${loggedSource} (expected "Menu source: cached last successful response")`);

  if (!dish2 || dish2.price !== 570 || loggedSource !== 'Menu source: cached last successful response') {
    throw new Error('Verification failed at Step 7: price reverted to old price or source log is wrong.');
  }
  console.log('✔ Level 2 (Cached last successful response) check passed.\n');

  // Step 8 & 9: Clear cache, keep Directus off
  console.log('Step 8 & 9: Clearing local storage cache while Directus remains offline...');
  localStorage.clear();
  console.log('✔ Cache cleared.\n');

  // Step 10 & 11: Fetch menu while Directus is stopped and cache is empty. Verify it falls back to emergency MENU_DATA (reverts to 550)
  console.log('Step 10 & 11: Fetching menu...');
  loggedSource = '';
  console.log = (...args) => {
    if (args[0] && args[0].startsWith('Menu source:')) loggedSource = args[0];
    originalLog(...args);
  };

  const menu3 = await fetchMenuData();
  console.log = originalLog;

  const dish3 = findDish(menu3, DISH_NAME);
  console.log(`Loaded price: ${dish3 ? dish3.price : 'Not found'} (expected 550)`);
  console.log(`Logged source: ${loggedSource} (expected "Menu source: emergency local fallback")`);

  if (!dish3 || dish3.price !== 550 || loggedSource !== 'Menu source: emergency local fallback') {
    throw new Error('Verification failed at Step 11: price is not 550 or source log is wrong.');
  }
  console.log('✔ Level 3 (Emergency local fallback) check passed.\n');

  // Step 12 & 13: Restart Directus, update page
  console.log('Step 12 & 13: Restarting Directus and waiting for online status...');
  runCmd('docker compose start');
  await waitDirectus(true);
  console.log('✔ Directus is back online.\n');

  // Step 14: Refresh/fetch menu, check that it goes back to Directus API (shows 570)
  console.log('Step 14: Fetching menu now that Directus is restarted...');
  loggedSource = '';
  console.log = (...args) => {
    if (args[0] && args[0].startsWith('Menu source:')) loggedSource = args[0];
    originalLog(...args);
  };

  const menu4 = await fetchMenuData();
  console.log = originalLog;

  const dish4 = findDish(menu4, DISH_NAME);
  console.log(`Loaded price: ${dish4 ? dish4.price : 'Not found'} (expected 570)`);
  console.log(`Logged source: ${loggedSource} (expected "Menu source: Directus API")`);

  if (!dish4 || dish4.price !== 570 || loggedSource !== 'Menu source: Directus API') {
    throw new Error('Verification failed at Step 14: price is incorrect or source log is wrong.');
  }
  console.log('✔ Restored to CMS data successfully.\n');

  // Cleanup: Reset the price in SQLite back to 550
  console.log('Cleaning up: Resetting database price back to 550...');
  runCmd('docker exec -t cafe-sisi-directus-directus-1 sqlite3 /directus/database/data.db "UPDATE dishes SET price = 550 WHERE id = 2;"');
  console.log('✔ Database restored.');

  console.log('\n==================================================');
  console.log('✔ ALL 14 E2E TEST WORKFLOW STEPS VERIFIED AND PASSED!');
  console.log('==================================================');
}

runWorkflow().catch(err => {
  console.error('\n❌ E2E Workflow Test Failed:', err);
  // Restore Docker to running if it was stopped during failure
  try {
    runCmd('docker compose start');
  } catch {}
  process.exit(1);
});
