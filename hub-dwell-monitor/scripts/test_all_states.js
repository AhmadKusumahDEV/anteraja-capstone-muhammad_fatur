import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const DATA_DIR = path.resolve('public/data');
const METRICS_PATH = path.join(DATA_DIR, 'metrics.json');
const LOCATIONS_PATH = path.join(DATA_DIR, 'locations.json');
const AI_SUMMARY_PATH = path.join(DATA_DIR, 'ai-summary.json');

// Store backup of pristine data
const backups = {
  metrics: fs.readFileSync(METRICS_PATH, 'utf-8'),
  locations: fs.readFileSync(LOCATIONS_PATH, 'utf-8'),
  aiSummary: fs.readFileSync(AI_SUMMARY_PATH, 'utf-8')
};

function restoreAll() {
  fs.writeFileSync(METRICS_PATH, backups.metrics);
  fs.writeFileSync(LOCATIONS_PATH, backups.locations);
  fs.writeFileSync(AI_SUMMARY_PATH, backups.aiSummary);
}

async function runStateTests() {
  console.log('--- STARTING COMPREHENSIVE APPLICATION STATE TESTS ---');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  } catch {
    browser = await chromium.launch({ headless: true });
  }

  const results = {};

  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

    // 1. NORMAL BASELINE
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const normalHubRows = await page.locator('.hub-list-row').count();
    results['Baseline Normal Data'] = {
      status: normalHubRows === 12 ? 'PASS' : 'FAIL',
      detail: `${normalHubRows} hubs loaded and rendered`
    };

    // 2. LOADING STATE (Slow Network / Pending)
    // Intercept and delay data files
    const slowContext = await browser.newContext();
    const slowPage = await slowContext.newPage();
    await slowPage.route('**/data/metrics.json', async route => {
      await new Promise(r => setTimeout(r, 800));
      await route.continue();
    });
    const loadingPromise = slowPage.goto('http://localhost:5173/');
    await slowPage.waitForTimeout(200);
    const skeletonCount = await slowPage.locator('.skeleton-box').count();
    await loadingPromise;
    await slowContext.close();
    results['Loading State (Skeletons)'] = {
      status: skeletonCount > 0 ? 'PASS' : 'FAIL',
      detail: `${skeletonCount} skeleton placeholders displayed during fetch`
    };

    // 3. ERROR: metrics.json missing (404)
    fs.renameSync(METRICS_PATH, METRICS_PATH + '.bak');
    try {
      await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      const errorText = await page.innerText('body');
      const retryBtn = await page.locator('button:has-text("Retry")').isVisible();
      const hasErrorView = errorText.includes('Failed to Load') || errorText.includes('metrics.json');
      results['Error: metrics.json missing'] = {
        status: (hasErrorView && retryBtn) ? 'PASS' : 'FAIL',
        detail: 'Shows ErrorView with specific message and working Retry button'
      };
    } finally {
      if (fs.existsSync(METRICS_PATH + '.bak')) {
        fs.renameSync(METRICS_PATH + '.bak', METRICS_PATH);
      }
    }

    // 4. ERROR: locations.json missing (404)
    // Skill: KPIs, Top 3 and list still work. Hubs rendered without coordinates. Map shows 0 markers.
    fs.renameSync(LOCATIONS_PATH, LOCATIONS_PATH + '.bak');
    try {
      await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      const hubRows = await page.locator('.hub-list-row').count();
      const kpisVisible = await page.locator('.kpi-card').count();
      const markerCount = await page.locator('path.leaflet-interactive:not([d="M0 0"])').count();
      results['Isolation: locations.json missing'] = {
        status: (hubRows === 12 && kpisVisible === 4 && markerCount === 0) ? 'PASS' : 'FAIL',
        detail: `KPIs and list operational (12 hubs), map markers omitted safely (0 markers)`
      };
    } finally {
      if (fs.existsSync(LOCATIONS_PATH + '.bak')) {
        fs.renameSync(LOCATIONS_PATH + '.bak', LOCATIONS_PATH);
      }
    }

    // 5. ERROR: ai-summary.json missing (404)
    // Skill: Dashboard works normally, only AI Insight shows Error view with Retry
    fs.renameSync(AI_SUMMARY_PATH, AI_SUMMARY_PATH + '.bak');
    try {
      await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      const dashHubRows = await page.locator('.hub-list-row').count();
      // Navigate to AI Insight
      await page.click('.nav-item:has-text("AI Insight")');
      await page.waitForTimeout(500);
      const aiErrorText = await page.innerText('body');
      const aiRetryVisible = await page.locator('button:has-text("Retry")').isVisible();
      results['Isolation: ai-summary.json missing'] = {
        status: (dashHubRows === 12 && aiRetryVisible && aiErrorText.includes('ai-summary')) ? 'PASS' : 'FAIL',
        detail: 'Dashboard unaffected (12 hubs); AI Insight page isolates failure with Retry'
      };
    } finally {
      if (fs.existsSync(AI_SUMMARY_PATH + '.bak')) {
        fs.renameSync(AI_SUMMARY_PATH + '.bak', AI_SUMMARY_PATH);
      }
    }

    // 6. INVALID JSON: metrics.json corrupted syntax
    fs.writeFileSync(METRICS_PATH, '{ invalid_json_syntax: true, ');
    try {
      await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      const errText = await page.innerText('body');
      const retryBtn = await page.locator('button:has-text("Retry")').isVisible();
      results['Invalid JSON: metrics.json'] = {
        status: (errText.includes('Invalid JSON') && retryBtn) ? 'PASS' : 'FAIL',
        detail: 'Caught JSON parse error, rendered ErrorView with Retry'
      };
    } finally {
      restoreAll();
    }

    // 7. EMPTY DATA: metrics.json has 0 hubs
    const emptyMetrics = JSON.parse(backups.metrics);
    emptyMetrics.hubs = [];
    emptyMetrics.global.hub_count = 0;
    emptyMetrics.global.completed_visits = 0;
    fs.writeFileSync(METRICS_PATH, JSON.stringify(emptyMetrics, null, 2));
    try {
      await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      const bodyText = await page.innerText('body');
      const hasNaN = bodyText.includes('NaN');
      const hasUndefined = bodyText.includes('undefined');
      const emptyMsg = bodyText.includes('No hub data available') || bodyText.includes('No Hub Data Available');
      results['Empty Data: 0 hubs'] = {
        status: (!hasNaN && !hasUndefined && emptyMsg) ? 'PASS' : 'FAIL',
        detail: 'Shows "No Hub Data Available", zero KPIs, never NaN or undefined'
      };
    } finally {
      restoreAll();
    }

    // 8. NO PRIORITY HUBS: all means below 6 hours
    const noPriorityMetrics = JSON.parse(backups.metrics);
    noPriorityMetrics.hubs = noPriorityMetrics.hubs.map(h => ({
      ...h,
      mean_dwell_hours: 4.50
    }));
    fs.writeFileSync(METRICS_PATH, JSON.stringify(noPriorityMetrics, null, 2));
    try {
      await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      await page.click('button:has-text("Priority Only")');
      await page.waitForTimeout(400);
      const pText = await page.innerText('body');
      const msgMatch = pText.includes('No hubs meet the priority threshold');
      results['No Priority Hubs'] = {
        status: msgMatch ? 'PASS' : 'FAIL',
        detail: 'Shows "No hubs meet the priority threshold" with return to All Hubs'
      };
    } finally {
      restoreAll();
    }

    // 9. FILTER EMPTY: search matches nothing
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.fill('input.search-input', 'nonexistenthubname999');
    await page.waitForTimeout(400);
    const filterEmptyText = await page.innerText('body');
    const resetFilterBtn = await page.locator('button:has-text("Reset Filter")').isVisible();
    const hasMatchMsg = filterEmptyText.includes('No hubs match your filter');
    // Click reset filter button to test recovery
    if (resetFilterBtn) {
      await page.click('button:has-text("Reset Filter")');
      await page.waitForTimeout(300);
    }
    const restoredCount = await page.locator('.hub-list-row').count();
    results['Filter Empty (Search No Matches)'] = {
      status: (hasMatchMsg && resetFilterBtn && restoredCount === 12) ? 'PASS' : 'FAIL',
      detail: 'Shows "No hubs match your filter" with working Reset Filter button'
    };

    // 10. AI WRONG SHAPE: missing summary & non-array priority_hubs
    const wrongAi = { invalid_key: 123 };
    fs.writeFileSync(AI_SUMMARY_PATH, JSON.stringify(wrongAi, null, 2));
    try {
      await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      await page.click('.nav-item:has-text("AI Insight")');
      await page.waitForTimeout(500);
      const aiText = await page.innerText('body');
      const hasDataNotAvailable = aiText.includes('Data not available');
      results['AI Wrong Shape'] = {
        status: hasDataNotAvailable ? 'PASS' : 'FAIL',
        detail: 'Renders "Data not available" card safely without crashing'
      };
    } finally {
      restoreAll();
    }

    await page.close();
  } finally {
    restoreAll();
    await browser.close();
  }

  // Restore and verify git status on public/data
  restoreAll();
  const gitStatus = execSync('git status --porcelain public/data', { encoding: 'utf-8' }).trim();

  console.log('\n--- STATE TEST SUMMARY RESULTS ---');
  console.log(JSON.stringify(results, null, 2));
  console.log('\nGit status on public/data (should be empty):', gitStatus === '' ? 'CLEAN (unmodified)' : gitStatus);
}

runStateTests().catch(err => {
  restoreAll();
  console.error('State test run failed:', err);
  process.exit(1);
});
