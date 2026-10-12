import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function run() {
  console.log('Starting Playwright responsive tests (Desktop 1440px & Mobile 390px)...');
  let browser;
  try {
    browser = await chromium.launch({ channel: 'msedge', headless: true });
  } catch {
    browser = await chromium.launch({ headless: true });
  }

  const results = {
    desktop: {},
    mobile: {},
    pageSwitching: {},
    consoleErrors: []
  };

  // --- DESKTOP 1440x900 ---
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const desktopPage = await desktopContext.newPage();

  desktopPage.on('console', msg => {
    if (msg.type() === 'error') {
      results.consoleErrors.push(`[Desktop Console Error] ${msg.text()}`);
    }
  });

  await desktopPage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(1000);

  // 1. Side by side: map card on the left, list column on the right
  const mapBox = await desktopPage.locator('.map-card').boundingBox();
  const listBox = await desktopPage.locator('.list-detail-column').boundingBox();
  results.desktop.sideBySide = (mapBox && listBox && Math.abs(mapBox.y - listBox.y) < 10 && mapBox.x < listBox.x) ? 'PASS' : 'FAIL';

  // 2. Map visible
  results.desktop.mapVisible = (mapBox && mapBox.height >= 250 && mapBox.width >= 400) ? 'PASS' : 'FAIL';

  // 3. © OpenStreetMap attribution visible
  const attrText = await desktopPage.locator('.leaflet-control-attribution').innerText();
  results.desktop.attributionVisible = attrText.includes('OpenStreetMap') ? 'PASS' : 'FAIL';

  // 4. Units readable
  const pageText = await desktopPage.innerText('body');
  results.desktop.unitsReadable = (pageText.includes('hrs') && !pageText.includes('undefined') && !pageText.includes('NaN')) ? 'PASS' : 'FAIL';

  // 5. Popup usable and marker selection
  const markers = desktopPage.locator('.leaflet-interactive');
  const markerCount = await markers.count();
  let desktopPopupPass = false;
  if (markerCount > 0) {
    await markers.first().click();
    await desktopPage.waitForTimeout(400);
    const popupContent = await desktopPage.locator('.leaflet-popup-content').innerText();
    desktopPopupPass = popupContent.includes('Avg Dwell') && popupContent.includes('hrs');
    
    // Close detail panel to return to list
    if (await desktopPage.locator('.hub-detail-back-btn').isVisible()) {
      await desktopPage.click('.hub-detail-back-btn');
      await desktopPage.waitForTimeout(300);
    }
  }
  results.desktop.popupUsable = desktopPopupPass ? 'PASS' : 'FAIL';

  // 6. Detail open and close via list click
  await desktopPage.click('.hub-list-row:first-child');
  await desktopPage.waitForTimeout(400);
  const detailHeader = await desktopPage.locator('.hub-detail-title').innerText();
  const backBtnVisible = await desktopPage.locator('.hub-detail-back-btn').isVisible();
  await desktopPage.click('.hub-detail-back-btn');
  await desktopPage.waitForTimeout(300);
  const listRestored = await desktopPage.locator('.list-title').isVisible();
  results.desktop.detailOpenClose = (detailHeader.length > 0 && backBtnVisible && listRestored) ? 'PASS' : 'FAIL';

  // 7. Priority filter & search
  await desktopPage.click('button:has-text("Priority Only")');
  await desktopPage.waitForTimeout(300);
  const priorityCountText = await desktopPage.locator('.list-count-badge').innerText();
  
  await desktopPage.fill('input.search-input', 'Medan');
  await desktopPage.waitForTimeout(300);
  const searchFilterCountText = await desktopPage.locator('.list-count-badge').innerText();
  
  await desktopPage.click('button:has-text("All Hubs")');
  await desktopPage.fill('input.search-input', '');
  await desktopPage.waitForTimeout(300);
  const allHubsCountText = await desktopPage.locator('.list-count-badge').innerText();
  
  results.desktop.priorityFilterAndSearch = (
    priorityCountText.includes('9') &&
    searchFilterCountText.includes('1') &&
    allHubsCountText.includes('12')
  ) ? 'PASS' : 'FAIL';

  // Save desktop screenshot
  const screenshotsDir = path.resolve('screenshots');
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });
  await desktopPage.screenshot({ path: path.join(screenshotsDir, 'desktop.png'), fullPage: false });
  console.log('Saved screenshots/desktop.png');

  await desktopContext.close();

  // --- MOBILE 390x844 ---
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
  });
  const mobilePage = await mobileContext.newPage();

  mobilePage.on('console', msg => {
    if (msg.type() === 'error') {
      results.consoleErrors.push(`[Mobile Console Error] ${msg.text()}`);
    }
  });

  await mobilePage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);

  // 1. Stacked layout: map above list
  const mobileMapBox = await mobilePage.locator('.map-card').boundingBox();
  const mobileListBox = await mobilePage.locator('.list-detail-column').boundingBox();
  results.mobile.stacked = (mobileMapBox && mobileListBox && mobileMapBox.y < mobileListBox.y) ? 'PASS' : 'FAIL';

  // 2. Map visible on mobile
  results.mobile.mapVisible = (mobileMapBox && mobileMapBox.height >= 200) ? 'PASS' : 'FAIL';

  // 3. Attribution visible
  const mobileAttrText = await mobilePage.locator('.leaflet-control-attribution').innerText();
  results.mobile.attributionVisible = mobileAttrText.includes('OpenStreetMap') ? 'PASS' : 'FAIL';

  // 4. Units readable
  const mobilePageText = await mobilePage.innerText('body');
  results.mobile.unitsReadable = (mobilePageText.includes('hrs') && !mobilePageText.includes('undefined') && !mobilePageText.includes('NaN')) ? 'PASS' : 'FAIL';

  // 5. Popup usable on mobile
  await mobilePage.locator('.map-card').scrollIntoViewIfNeeded();
  const mobileMarkers = mobilePage.locator('path.leaflet-interactive:not([d="M0 0"])');
  let mobilePopupPass = false;
  if ((await mobileMarkers.count()) > 0) {
    await mobileMarkers.first().click();
    await mobilePage.waitForTimeout(400);
    const popupContent = await mobilePage.locator('.leaflet-popup-content').innerText();
    mobilePopupPass = popupContent.includes('Avg Dwell') && popupContent.includes('hrs');
    
    // Close mobile sheet if opened
    if (await mobilePage.locator('.mobile-sheet-container button[title="Close"]').isVisible()) {
      await mobilePage.click('.mobile-sheet-container button[title="Close"]');
      await mobilePage.waitForTimeout(300);
    }
  }
  results.mobile.popupUsable = mobilePopupPass ? 'PASS' : 'FAIL';

  // 6. Mobile bottom navigation visible
  const bottomNavVisible = await mobilePage.locator('.mobile-bottom-nav').isVisible();
  results.mobile.bottomNav = bottomNavVisible ? 'PASS' : 'FAIL';

  // 7. Mobile bottom sheet detail open/close
  await mobilePage.locator('.hub-list-row:first-child').scrollIntoViewIfNeeded();
  await mobilePage.waitForTimeout(300);
  await mobilePage.click('.hub-list-row:first-child');
  await mobilePage.waitForTimeout(400);
  const sheetVisible = await mobilePage.locator('.mobile-sheet-container').isVisible();
  await mobilePage.click('.mobile-sheet-container button[title="Close"]');
  await mobilePage.waitForTimeout(300);
  const sheetClosed = !(await mobilePage.locator('.mobile-sheet-container').isVisible());
  results.mobile.detailOpenClose = (sheetVisible && sheetClosed) ? 'PASS' : 'FAIL';

  // 8. Mobile priority filter and search
  await mobilePage.click('button:has-text("Priority Only")');
  await mobilePage.waitForTimeout(300);
  const mobilePriorityText = await mobilePage.locator('.list-count-badge').innerText();
  await mobilePage.fill('input.search-input', 'Denpasar');
  await mobilePage.waitForTimeout(300);
  const mobileSearchText = await mobilePage.locator('.list-count-badge').innerText();
  await mobilePage.click('button:has-text("All Hubs")');
  await mobilePage.fill('input.search-input', '');
  await mobilePage.waitForTimeout(300);
  results.mobile.priorityFilterAndSearch = (mobilePriorityText.includes('9') && mobileSearchText.includes('1')) ? 'PASS' : 'FAIL';

  // Save mobile screenshot
  await mobilePage.screenshot({ path: path.join(screenshotsDir, 'mobile.png'), fullPage: false });
  console.log('Saved screenshots/mobile.png');

  // --- PAGE SWITCHING (Verify StrictMode safe & no "map already initialized") ---
  await mobilePage.click('.mobile-bottom-nav button:has-text("AI Insight")');
  await mobilePage.waitForTimeout(400);
  const aiHeader = await mobilePage.locator('h1').innerText();
  await mobilePage.click('.mobile-bottom-nav button:has-text("Data Notes")');
  await mobilePage.waitForTimeout(400);
  const notesHeader = await mobilePage.locator('h1').innerText();
  await mobilePage.click('.mobile-bottom-nav button:has-text("Dashboard")');
  await mobilePage.waitForTimeout(500);
  const dashboardMapBack = await mobilePage.locator('.map-card').isVisible();

  results.pageSwitching = {
    navigationWorks: (aiHeader.includes('AI') && notesHeader.includes('Data Notes') && dashboardMapBack) ? 'PASS' : 'FAIL'
  };

  // Check console errors
  const mapInitErrors = results.consoleErrors.filter(e => e.toLowerCase().includes('map already initialized'));
  results.noMapAlreadyInitialized = mapInitErrors.length === 0 ? 'PASS (0 errors)' : `FAIL (${mapInitErrors.length} errors)`;
  results.zeroConsoleErrors = results.consoleErrors.length === 0 ? 'PASS (0 errors)' : `FAIL (${results.consoleErrors.length} errors)`;

  await mobileContext.close();
  await browser.close();

  console.log('\n--- FINAL PLAYWRIGHT RESPONSIVE TEST RESULTS ---');
  console.log(JSON.stringify(results, null, 2));
}

run().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
