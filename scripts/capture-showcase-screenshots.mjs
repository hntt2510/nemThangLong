import { spawn, execSync } from "child_process";
import fs from "fs";
import path from "path";
import http from "http";

// Determine paths dynamically
const ROOT_DIR = process.cwd();
const QA_DIR = path.join(ROOT_DIR, "QA", "showcase");
const BRAIN_ARTIFACT_DIR = "C:\\Users\\LEGION\\.gemini\\antigravity\\brain\\a03cd9b1-9a7c-4dbb-9934-e9b20d6cf5c0\\screenshots";

// Ensure directories exist
if (!fs.existsSync(QA_DIR)) fs.mkdirSync(QA_DIR, { recursive: true });
if (fs.existsSync(path.dirname(BRAIN_ARTIFACT_DIR))) {
  if (!fs.existsSync(BRAIN_ARTIFACT_DIR)) fs.mkdirSync(BRAIN_ARTIFACT_DIR, { recursive: true });
}

function findChromePath() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) {
    return process.env.CHROME_PATH;
  }
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    path.join(process.env.LOCALAPPDATA || "", "Google", "Chrome", "Application", "chrome.exe"),
    path.join(process.env.PROGRAMFILES || "", "Google", "Chrome", "Application", "chrome.exe"),
    path.join(process.env["PROGRAMFILES(X86)"] || "", "Google", "Chrome", "Application", "chrome.exe"),
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  ];
  for (const p of candidates) {
    if (p && fs.existsSync(p)) return p;
  }
  throw new Error("Could not find Google Chrome binary. Please set CHROME_PATH environment variable.");
}

function isPortOpen(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/`, (res) => {
      resolve(true);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on("error", reject);
  });
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    return new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data.toString());
        if (data.id && this.callbacks.has(data.id)) {
          const { resolve, reject } = this.callbacks.get(data.id);
          this.callbacks.delete(data.id);
          if (data.error) reject(new Error(data.error.message));
          else resolve(data.result);
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res.exceptionDetails) {
      throw new Error("Evaluation error: " + (res.exceptionDetails.exception?.description || JSON.stringify(res.exceptionDetails)));
    }
    return res.result?.value;
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForFunction(page, fnExpr, maxWaitMs = 15000, intervalMs = 250) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    try {
      const result = await page.evaluate(`(${fnExpr})`);
      if (result) return true;
    } catch {
      // ignore
    }
    await sleep(intervalMs);
  }
  const bodyDump = await page.evaluate(`document.body.innerText.slice(0, 300)`);
  throw new Error(`Timeout waiting for condition: (${fnExpr}). Body preview:\n${bodyDump}`);
}

async function preparePageForCapture(page) {
  // 1. Force load and decode all images
  await page.evaluate(`(async () => {
    const imgs = Array.from(document.querySelectorAll("img"));
    await Promise.all(imgs.map(img => {
      if (img.loading === "lazy") img.loading = "eager";
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return img.decode().catch(() => {});
    }));
  })()`);

  // 2. Clear GSAP animations and force visible opacity for deterministic QA
  await page.evaluate(`(() => {
    // Clear transforms and force full opacity on any potential animated container
    const animated = document.querySelectorAll('.homepage, .home-hero, .home-hero-media, .home-hero-copy, .home-range, .home-find, .home-luxury-editorial, .home-latex, .home-needs, .home-compare, .home-project, .home-trust, .catalog-grid, .finder-wizard, .finder-results, .compare-matrix, .cart-layout, .checkout-page');
    animated.forEach(el => {
      el.style.opacity = '1';
      el.style.visibility = 'visible';
    });
  })()`);

  await sleep(400);
}

async function assertGlobalPageHealth(page, contextName, viewportWidth) {
  await preparePageForCapture(page);

  // 1. Runtime Marker Assertion
  const isShowcase = await page.evaluate(`document.body.dataset.uiShowcase === "true"`);
  if (!isShowcase) {
    throw new Error(`SHOWCASE RUNTIME MARKER FAILED on [${contextName}]: document.body.dataset.uiShowcase is NOT 'true'`);
  }

  // 2. Broken Image Assertion
  const imageHealth = await page.evaluate(`(() => {
    const imgs = Array.from(document.querySelectorAll("img"));
    const broken = imgs.filter(img => {
      const src = img.src || img.getAttribute("src");
      if (!src) return false;
      return !img.complete || img.naturalWidth === 0 || img.naturalHeight === 0;
    }).map(img => img.src || img.getAttribute("src"));
    return { total: imgs.length, broken };
  })()`);

  if (imageHealth.broken.length > 0) {
    throw new Error(`IMAGE LOAD FAILURE on [${contextName}]: Broken images: ${imageHealth.broken.join(", ")}`);
  }

  // 3. Document-wide overflow check
  const overflow = await page.evaluate(`(() => {
    const docEl = document.documentElement;
    return {
      scrollWidth: docEl.scrollWidth,
      clientWidth: docEl.clientWidth,
      hasOverflow: docEl.scrollWidth > docEl.clientWidth + 1
    };
  })()`);

  if (overflow.hasOverflow) {
    throw new Error(`PAGE OVERFLOW FAILURE on [${contextName}]: scrollWidth=${overflow.scrollWidth} > clientWidth=${overflow.clientWidth}`);
  }

  // 4. Geometry Offender Check (for mobile / narrow viewports)
  if (viewportWidth <= 480) {
    const offenders = await page.evaluate(`(() => {
      const vw = window.innerWidth;
      const all = Array.from(document.querySelectorAll("body *"));
      const bad = [];
      for (const el of all) {
        if (el.closest('.compare-matrix-wrap') || el.closest('.compare-table-section') || el.closest('.finder-steps-progress')) {
          continue;
        }
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          if (rect.left < -2 || rect.right > vw + 2) {
            bad.push({
              tag: el.tagName.toLowerCase(),
              className: el.className,
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              width: Math.round(rect.width)
            });
            if (bad.length >= 5) break;
          }
        }
      }
      return bad;
    })()`);

    if (offenders.length > 0) {
      console.warn(`  [Warning] Bounding rect overflow candidates on ${contextName}:`, offenders);
    }
  }

  // 5. Sticky header top assertion
  const headerTop = await page.evaluate(`(() => {
    const h = document.querySelector('.site-header');
    if (!h) return 0;
    return Math.round(h.getBoundingClientRect().top);
  })()`);

  if (Math.abs(headerTop) > 2) {
    throw new Error(`STICKY HEADER MISALIGNED on [${contextName}]: header top is ${headerTop}px (expected 0px)`);
  }

  // 6. Showcase Badge & Layout Architecture Assertions
  const badgeHealth = await page.evaluate(`(() => {
    const isDesktop = window.innerWidth > 860;
    const allBadges = Array.from(document.querySelectorAll('.header-showcase-badge, .header-mobile-showcase-strip'));
    const visibleBadges = allBadges.filter(b => {
      const style = window.getComputedStyle(b);
      return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    });

    // Assertion 1: exactly 1 visible badge in showcase mode
    const countOk = visibleBadges.length === 1;

    // Assertion 2 & 3: desktop/mobile badge position is NOT fixed or absolute
    let positionOk = true;
    let positionDetail = "";
    if (visibleBadges.length > 0) {
      const pos = window.getComputedStyle(visibleBadges[0]).position;
      if (pos === 'fixed' || pos === 'absolute') {
        positionOk = false;
        positionDetail = pos;
      }
    }

    // Assertion 4: Badge does not overlap nav, breadcrumb, h1
    const activeBadge = visibleBadges[0];
    const rectBadge = activeBadge?.getBoundingClientRect();

    let overlapsNav = false;
    let overlapsContent = false;

    if (isDesktop) {
      const accountLink = document.querySelector('.header-actions .account-link');
      const cartLink = document.querySelector('.header-actions .cart-link');
      const cartSup = document.querySelector('.header-actions sup');
      const rectAccount = accountLink?.getBoundingClientRect();
      const rectCart = cartLink?.getBoundingClientRect();

      if (rectBadge && rectAccount) {
        if (rectBadge.right > rectAccount.left && rectBadge.left < rectAccount.right) overlapsNav = true;
      }
      if (rectBadge && rectCart) {
        if (rectBadge.right > rectCart.left && rectBadge.left < rectCart.right) overlapsNav = true;
      }

      const accountVisible = Boolean(rectAccount && rectAccount.width > 0 && rectAccount.height > 0);
      const cartVisible = Boolean(rectCart && rectCart.width > 0 && rectCart.height > 0);
      const cartCountVisible = Boolean(cartSup && cartSup.innerText.trim().length > 0);

      return {
        isDesktop,
        countOk,
        visibleCount: visibleBadges.length,
        positionOk,
        positionDetail,
        accountVisible,
        cartVisible,
        cartCountVisible,
        overlapsNav,
        overlapsContent,
      };
    } else {
      const strip = document.querySelector('.header-mobile-showcase-strip');
      const cartLink = document.querySelector('.header-actions .cart-link');
      const menuBtn = document.querySelector('.menu-toggle');
      const rectStrip = strip?.getBoundingClientRect();
      const rectCart = cartLink?.getBoundingClientRect();
      const rectMenu = menuBtn?.getBoundingClientRect();

      // Check breadcrumbs text and h1
      const breadcrumbs = document.querySelector('.breadcrumbs a, .breadcrumbs span, nav[aria-label="Breadcrumb"] a, nav[aria-label="Breadcrumb"] span');
      const h1 = document.querySelector('h1');
      const rectBread = breadcrumbs?.getBoundingClientRect();
      const rectH1 = h1?.getBoundingClientRect();

      if (rectStrip && rectBread && rectBread.height > 0) {
        if (rectStrip.bottom > rectBread.top + 2) overlapsContent = true;
      }
      if (rectStrip && rectH1 && rectH1.height > 0) {
        if (rectStrip.bottom > rectH1.top + 2) overlapsContent = true;
      }

      return {
        isDesktop,
        countOk,
        visibleCount: visibleBadges.length,
        positionOk,
        positionDetail,
        stripVisible: Boolean(strip && rectStrip && rectStrip.height > 0),
        cartVisible: Boolean(cartLink && rectCart && rectCart.width > 0),
        menuVisible: Boolean(menuBtn && rectMenu && rectMenu.width > 0),
        overlapsNav: false,
        overlapsContent,
      };
    }
  })()`);

  if (!badgeHealth.countOk) {
    throw new Error(`SHOWCASE BADGE COUNT ERROR on [${contextName}]: expected 1 visible badge, found ${badgeHealth.visibleCount}`);
  }
  if (!badgeHealth.positionOk) {
    throw new Error(`SHOWCASE BADGE POSITION ERROR on [${contextName}]: badge position is '${badgeHealth.positionDetail}' (expected normal flow static/relative)`);
  }
  if (badgeHealth.isDesktop) {
    if (!badgeHealth.accountVisible || !badgeHealth.cartVisible || !badgeHealth.cartCountVisible) {
      throw new Error(`NAV HEADER HEALTH FAILED on [${contextName}]: account=${badgeHealth.accountVisible}, cart=${badgeHealth.cartVisible}, count=${badgeHealth.cartCountVisible}`);
    }
    if (badgeHealth.overlapsNav) {
      throw new Error(`NAV HEADER BADGE OVERLAP DETECTED on [${contextName}]!`);
    }
  } else {
    if (!badgeHealth.stripVisible || !badgeHealth.cartVisible || !badgeHealth.menuVisible) {
      throw new Error(`MOBILE HEADER HEALTH FAILED on [${contextName}]: strip=${badgeHealth.stripVisible}, cart=${badgeHealth.cartVisible}, menu=${badgeHealth.menuVisible}`);
    }
    if (badgeHealth.overlapsContent) {
      throw new Error(`MOBILE BADGE STRIP CONTENT OVERLAP DETECTED on [${contextName}]!`);
    }
  }
}

function saveScreenshot(shotData, filename) {
  const buffer = Buffer.from(shotData, "base64");
  const qaPath = path.join(QA_DIR, filename);
  fs.writeFileSync(qaPath, buffer);
  const stat = fs.statSync(qaPath);

  // Copy to BRAIN_ARTIFACT_DIR if exists
  if (fs.existsSync(BRAIN_ARTIFACT_DIR)) {
    const brainPath = path.join(BRAIN_ARTIFACT_DIR, filename);
    fs.writeFileSync(brainPath, buffer);
  }

  console.log(`  -> Saved ${filename} (${stat.size} bytes)`);
}

async function run() {
  const chromePath = findChromePath();
  console.log("\n=======================================================");
  console.log("FINAL SHOWCASE RUNTIME & VISUAL QA SUITE V2");
  console.log("=======================================================");
  console.log(`Working Directory: ${ROOT_DIR}`);
  console.log(`QA Output Dir:     ${QA_DIR}`);
  console.log(`Chrome Binary:     ${chromePath}`);
  console.log(`NODE_ENV:          ${process.env.NODE_ENV || "production"}`);
  console.log(`APP_ENV:           ${process.env.APP_ENV || "staging"}`);
  console.log(`UI_SHOWCASE_MODE:  ${Boolean(process.env.UI_SHOWCASE_MODE === "true" || true)}`);
  console.log(`Build Mode:        Production next start (Port 3388)`);
  console.log("=======================================================\n");

  // Step 1: Production Build
  console.log("1. Building Next.js production bundle with UI_SHOWCASE_MODE=true APP_ENV=staging...");
  execSync("npm run build", {
    cwd: ROOT_DIR,
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: "production",
      APP_ENV: "staging",
      UI_SHOWCASE_MODE: "true",
      NEXT_PUBLIC_UI_SHOWCASE_MODE: "true",
    },
  });

  // Step 2: Start Next.js Production Server
  const PORT = 3388;
  const baseUrl = `http://127.0.0.1:${PORT}`;

  let serverProc = null;
  const serverAlreadyRunning = await isPortOpen(PORT);

  if (!serverAlreadyRunning) {
    console.log(`\n2. Starting Next.js production server on port ${PORT}...`);
    serverProc = spawn("npx", ["next", "start", "-p", String(PORT)], {
      cwd: ROOT_DIR,
      stdio: "pipe",
      shell: true,
      env: {
        ...process.env,
        PORT: String(PORT),
        NODE_ENV: "production",
        APP_ENV: "staging",
        UI_SHOWCASE_MODE: "true",
        NEXT_PUBLIC_UI_SHOWCASE_MODE: "true",
      },
    });

    serverProc.stdout?.on("data", (data) => {
      const msg = data.toString();
      if (msg.includes("Ready in") || msg.includes("started server")) {
        console.log(`[Next.js Server] ${msg.trim()}`);
      }
    });

    serverProc.stderr?.on("data", (data) => {
      console.error(`[Next.js Server Err] ${data.toString().trim()}`);
    });

    let ready = false;
    for (let i = 0; i < 40; i++) {
      await sleep(500);
      if (await isPortOpen(PORT)) {
        ready = true;
        break;
      }
    }

    if (!ready) {
      throw new Error(`Production server failed to start on port ${PORT}`);
    }
    console.log(`✓ Next.js production server listening on ${baseUrl}`);
  } else {
    console.log(`✓ Production server already listening on ${baseUrl}`);
  }

  // Step 3: Launch Headless Chrome
  const remoteDebuggingPort = 9333;
  console.log(`\n3. Launching headless Chrome (debugging port ${remoteDebuggingPort})...`);
  const chromeProc = spawn(chromePath, [
    "--headless=new",
    `--remote-debugging-port=${remoteDebuggingPort}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-background-networking",
    "--disable-features=Translate,BackForwardCache",
    "--disable-gpu",
    "--window-size=1440,900",
    "--hide-scrollbars",
  ]);

  await sleep(1500);
  const targets = await fetchJson(`http://127.0.0.1:${remoteDebuggingPort}/json/list`);
  const pageTarget = targets.find((t) => t.type === "page") || targets[0];
  if (!pageTarget || !pageTarget.webSocketDebuggerUrl) {
    throw new Error("Could not find a valid page target in Chrome");
  }
  const page = new CdpClient(pageTarget.webSocketDebuggerUrl);
  await page.connect();
  await page.send("Page.enable");
  await page.send("Runtime.enable");
  await page.send("DOM.enable");
  await page.send("CSS.enable");

  // Emulate reduced motion for deterministic visual QA
  await page.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }],
  });

  try {
    console.log("\n=======================================================");
    console.log("RUNNING STRICT SHOWCASE VALIDATION & ASSERTIONS");
    console.log("=======================================================\n");

    // 1. Homepage & Hero Assertion
    await page.send("Page.navigate", { url: `${baseUrl}/` });
    await sleep(1500);
    await waitForFunction(page, `Boolean(document.body.dataset.uiShowcase === "true")`);
    await assertGlobalPageHealth(page, "Homepage", 1440);

    const heroImgValid = await page.evaluate(`(() => {
      const img = document.querySelector('.home-hero-media img');
      if (!img) return false;
      const rect = img.getBoundingClientRect();
      const style = window.getComputedStyle(img);
      return img.complete && img.naturalWidth > 0 && img.naturalHeight > 0 && parseFloat(style.opacity || '1') > 0 && rect.height > 0;
    })()`);
    if (!heroImgValid) throw new Error("ASSERTION FAILED on Homepage Hero: hero image is missing or has naturalWidth === 0");
    console.log("✓ Homepage Hero verified: image complete, naturalWidth > 0, opacity > 0.");

    // 2. Catalog Assertion (/nem)
    await page.send("Page.navigate", { url: `${baseUrl}/nem` });
    await sleep(1500);
    await assertGlobalPageHealth(page, "Catalog (/nem)", 1440);
    const catalogCheck = await page.evaluate(`(() => {
      const cards = document.querySelectorAll('.product-card');
      const text = document.body.innerText;
      const hasCmsFallback = text.includes("Thông tin giá bán và tình trạng tồn kho đang được cập nhật") || text.includes("Thông tin đang cập nhật");
      const hasFormattedPrice = text.includes("Từ 4.900.000") || text.includes("Từ 6.900.000");
      return { cardCount: cards.length, hasCmsFallback, hasFormattedPrice };
    })()`);
    if (catalogCheck.cardCount !== 6 || catalogCheck.hasCmsFallback || !catalogCheck.hasFormattedPrice) {
      throw new Error(`ASSERTION FAILED on /nem: count=${catalogCheck.cardCount} (expected 6), fallback=${catalogCheck.hasCmsFallback}, price=${catalogCheck.hasFormattedPrice}`);
    }
    console.log("✓ Catalog (/nem) verified: exactly 6 cards, prices visible, 0 CMS fallbacks.");

    // 3. America PDP (/nem/america)
    await page.send("Page.navigate", { url: `${baseUrl}/nem/america` });
    await sleep(1500);
    await assertGlobalPageHealth(page, "PDP America (/nem/america)", 1440);
    const americaCheck = await page.evaluate(`(() => {
      const text = document.body.innerText.toLowerCase();
      const pills = document.querySelectorAll('.pdp-pill');
      const hasBuyBtn = text.includes("mua ngay");
      const hasAddToCart = text.includes("thêm vào giỏ");
      const hasStock = text.includes("còn hàng");
      const hasPrice = text.includes("4.900.000") || text.includes("6.700.000");
      return { pillCount: pills.length, hasBuyBtn, hasAddToCart, hasStock, hasPrice };
    })()`);
    if (americaCheck.pillCount < 5 || !americaCheck.hasBuyBtn || !americaCheck.hasAddToCart || !americaCheck.hasPrice) {
      throw new Error(`ASSERTION FAILED on /nem/america: pills=${americaCheck.pillCount}, buy=${americaCheck.hasBuyBtn}, cart=${americaCheck.hasAddToCart}, price=${americaCheck.hasPrice}`);
    }
    console.log(`✓ PDP America verified: ${americaCheck.pillCount} pills, populated price, Buy & Add-to-Cart CTAs active.`);

    // 4. Luxury PDP (/nem/luxury)
    await page.send("Page.navigate", { url: `${baseUrl}/nem/luxury` });
    await sleep(1500);
    await assertGlobalPageHealth(page, "PDP Luxury (/nem/luxury)", 1440);
    const luxuryCheck = await page.evaluate(`(() => {
      const text = document.body.innerText.toLowerCase();
      const pills = document.querySelectorAll('.pdp-pill');
      const hasPrice = text.includes("20.900.000") || text.includes("18.900.000");
      const hasBuy = text.includes("mua ngay");
      return { pillCount: pills.length, hasPrice, hasBuy };
    })()`);
    if (luxuryCheck.pillCount < 4 || !luxuryCheck.hasPrice || !luxuryCheck.hasBuy) {
      throw new Error(`ASSERTION FAILED on /nem/luxury: pills=${luxuryCheck.pillCount}, price=${luxuryCheck.hasPrice}, buy=${luxuryCheck.hasBuy}`);
    }
    console.log(`✓ PDP Luxury verified: ${luxuryCheck.pillCount} pills, luxury price, purchase state active.`);

    // 5. Finder (/tim-nem)
    await page.send("Page.navigate", { url: `${baseUrl}/tim-nem` });
    await sleep(1500);
    await assertGlobalPageHealth(page, "Finder (/tim-nem)", 1440);
    const finderPillsCheck = await page.evaluate(`(() => {
      const text = document.body.innerText;
      const has100 = text.includes("100 cm");
      const has120 = text.includes("120 cm");
      const has140 = text.includes("140 cm");
      const has160 = text.includes("160 cm");
      const has180 = text.includes("180 cm");
      const has200 = text.includes("200 cm");
      return has100 && has120 && has140 && has160 && has180 && has200;
    })()`);
    if (!finderPillsCheck) {
      throw new Error("ASSERTION FAILED on /tim-nem: Dimension pills (100, 120, 140, 160, 180, 200 cm) are missing!");
    }
    console.log("✓ Finder Step 1 verified: full width range (100, 120, 140, 160, 180, 200 cm) active.");

    // 6. Finder Results (/tim-nem?width=160&feel=balanced&priority=support#results)
    await page.send("Page.navigate", { url: `${baseUrl}/tim-nem?width=160&feel=balanced&priority=support#results` });
    await sleep(1500);
    await assertGlobalPageHealth(page, "Finder Results", 1440);
    const finderResultsCheck = await page.evaluate(`(() => {
      const resultsSection = document.querySelector('#results');
      const cards = document.querySelectorAll('.finder-result');
      const text = document.body.innerText;
      const hasPrimary = text.includes("GỢI Ý CHÍNH") || text.includes("Một lựa chọn đáng xem xét");
      const hasAlternatives = text.includes("LỰA CHỌN THAM KHẢO") || cards.length >= 2;
      return { hasSection: Boolean(resultsSection), count: cards.length, hasPrimary, hasAlternatives };
    })()`);
    if (!finderResultsCheck.hasSection || finderResultsCheck.count < 2 || !finderResultsCheck.hasPrimary) {
      throw new Error(`ASSERTION FAILED on Finder Results: count=${finderResultsCheck.count}, primary=${finderResultsCheck.hasPrimary}`);
    }
    console.log(`✓ Finder Results verified: ${finderResultsCheck.count} cards rendered, genuine primary recommendation present.`);

    // 7. Compare (/so-sanh)
    await page.send("Page.navigate", { url: `${baseUrl}/so-sanh` });
    await sleep(1500);
    await assertGlobalPageHealth(page, "Compare (/so-sanh)", 1440);
    const compareCheck = await page.evaluate(`(() => {
      const text = document.body.innerText;
      const matrix = document.querySelector('.compare-table-section, .compare-matrix');
      const hasAmerica = text.includes("Nệm Thăng Long America");
      const hasMemoryFoam = text.includes("Nệm Thăng Long Memory Foam");
      const hasLuxury = text.includes("Nệm Thăng Long Luxury");
      const hasVnd = text.includes("4.900.000 ₫") || text.includes("4.900.000");
      return { hasMatrix: Boolean(matrix), hasAmerica, hasMemoryFoam, hasLuxury, hasVnd };
    })()`);
    if (!compareCheck.hasMatrix || !compareCheck.hasAmerica || !compareCheck.hasMemoryFoam || !compareCheck.hasLuxury || !compareCheck.hasVnd) {
      throw new Error(`ASSERTION FAILED on /so-sanh: matrix=${compareCheck.hasMatrix}, America=${compareCheck.hasAmerica}, MemoryFoam=${compareCheck.hasMemoryFoam}, Luxury=${compareCheck.hasLuxury}`);
    }
    console.log("✓ Compare (/so-sanh) verified: preselected with 3 showcase products, matrix visible with formatted VND prices.");

    // 8. Cart (/gio-hang)
    await page.send("Page.navigate", { url: `${baseUrl}/gio-hang` });
    await sleep(1500);
    await assertGlobalPageHealth(page, "Cart (/gio-hang)", 1440);
    const cartCheck = await page.evaluate(`(() => {
      const items = document.querySelectorAll('.cart-item');
      const text = document.body.innerText;
      const hasLuxury = text.includes("Nệm Thăng Long Luxury");
      const hasClassic = text.includes("Nệm Thăng Long Classic");
      return { count: items.length, hasLuxury, hasClassic };
    })()`);
    if (cartCheck.count !== 2 || !cartCheck.hasLuxury || !cartCheck.hasClassic) {
      throw new Error(`ASSERTION FAILED on /gio-hang: items=${cartCheck.count} (expected 2)`);
    }
    console.log("✓ Cart (/gio-hang) verified: 2 showcase cart line items rendered with working images.");

    // 9. Checkout (/checkout)
    await page.send("Page.navigate", { url: `${baseUrl}/checkout` });
    await sleep(1500);
    await assertGlobalPageHealth(page, "Checkout (/checkout)", 1440);
    const checkoutCheck = await page.evaluate(`(() => {
      const nameInput = document.querySelector('input[name="customerName"]');
      const phoneInput = document.querySelector('input[name="customerPhone"]');
      return { name: nameInput?.value, phone: phoneInput?.value };
    })()`);
    if (!checkoutCheck.name?.includes("Nguyễn Minh Anh") || !checkoutCheck.phone?.includes("0900")) {
      throw new Error(`ASSERTION FAILED on /checkout: prefill customer name=${checkoutCheck.name}, phone=${checkoutCheck.phone}`);
    }
    console.log(`✓ Checkout (/checkout) verified: prefilled customer (${checkoutCheck.name}, ${checkoutCheck.phone}).`);

    // 10. Account (/tai-khoan)
    await page.send("Page.navigate", { url: `${baseUrl}/tai-khoan` });
    await sleep(1500);
    await assertGlobalPageHealth(page, "Account (/tai-khoan)", 1440);
    const accountCheck = await page.evaluate(`document.body.innerText.includes("Nguyễn Minh Anh")`);
    if (!accountCheck) throw new Error("ASSERTION FAILED on /tai-khoan: showcase profile missing");
    console.log("✓ Account (/tai-khoan) verified: showcase customer profile present.");

    const args = process.argv.slice(2);
    const affectedOnly = args.includes("--affected") || args.includes("--affected-only");
    const filterArg = args.find((a) => !a.startsWith("-")) || "";

    const AFFECTED_NAMES = new Set([
      "desktop_1440_catalog",
      "desktop_1440_catalog_filtered",
      "desktop_1440_pdp_america",
      "desktop_1440_finder",
      "desktop_1440_compare",
      "desktop_1440_cart",
      "desktop_1440_checkout",
      "desktop_1440_account",
      "mobile_390_home",
      "mobile_390_catalog",
      "mobile_390_catalog_filters_open",
      "mobile_390_pdp_america",
      "mobile_390_pdp_luxury",
      "mobile_390_finder",
      "mobile_390_compare",
      "mobile_390_cart",
      "mobile_390_checkout",
      "mobile_390_account",
    ]);

    function shouldCapture(name) {
      if (affectedOnly) return AFFECTED_NAMES.has(name);
      if (filterArg) return name.includes(filterArg);
      return true;
    }

    console.log("\n=======================================================");
    console.log("CAPTURING OFFICIAL DESKTOP (1440px) SCREENSHOT SET");
    console.log("=======================================================\n");

    await page.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 900,
      deviceScaleFactor: 2,
      mobile: false,
    });

    // Helper for homepage section captures
    async function captureHomeSection(sectionSelector, screenshotName, expectedText) {
      if (!shouldCapture(screenshotName)) return;
      await page.send("Page.navigate", { url: `${baseUrl}/` });
      await sleep(1200);
      await preparePageForCapture(page);

      if (sectionSelector !== ".home-hero") {
        await page.evaluate(`((sel) => {
          const el = document.querySelector(sel);
          if (el) el.scrollIntoView({ behavior: "instant", block: "start" });
        })('${sectionSelector}')`);
        await sleep(400);
      }

      await assertGlobalPageHealth(page, `Home Section ${screenshotName}`, 1440);

      const sectionInView = await page.evaluate(`((sel, txt) => {
        const el = document.querySelector(sel);
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        const bodyText = el.innerText;
        const intersects = rect.top < window.innerHeight && rect.bottom > 0;
        const hasText = !txt || bodyText.includes(txt);
        return intersects && hasText;
      })('${sectionSelector}', '${expectedText}')`);

      if (!sectionInView) {
        throw new Error(`HOMEPAGE SECTION CAPTURE FAILED: ${sectionSelector} not in view or missing text '${expectedText}'`);
      }

      const shot = await page.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
      saveScreenshot(shot.data, `${screenshotName}.png`);
    }

    // 8 Homepage Sections
    await captureHomeSection(".home-hero", "desktop_1440_home_hero", "Ngủ ngon hơn,");
    await captureHomeSection("#product-range", "desktop_1440_home_collection", "BỘ SƯU TẬP NỆM THĂNG LONG");
    await captureHomeSection("#find-mattress", "desktop_1440_home_finder", "Không cần thử hết mọi tấm nệm");
    await captureHomeSection(".home-luxury-editorial", "desktop_1440_home_latex", "THE THĂNG LONG SIGNATURE");
    await captureHomeSection("#shop-by-need", "desktop_1440_home_needs", "SHOP BY NEED");
    await captureHomeSection("#compare", "desktop_1440_home_compare", "COMPARE");
    await captureHomeSection("#hotel-project", "desktop_1440_home_hotel", "HOTEL & PROJECT");
    await captureHomeSection("#contact", "desktop_1440_home_contact", "TƯ VẤN LỰA CHỌN");

    // Standard Desktop Pages
    const desktopPageViews = [
      { name: "desktop_1440_catalog", path: "/nem" },
      { name: "desktop_1440_catalog_filtered", path: "/nem?line=america" },
      { name: "desktop_1440_pdp_america", path: "/nem/america" },
      { name: "desktop_1440_pdp_luxury", path: "/nem/luxury" },
      { name: "desktop_1440_finder", path: "/tim-nem" },
      { name: "desktop_1440_compare", path: "/so-sanh" },
      { name: "desktop_1440_cart", path: "/gio-hang" },
      { name: "desktop_1440_checkout", path: "/checkout" },
      { name: "desktop_1440_account", path: "/tai-khoan" },
    ];

    for (const view of desktopPageViews) {
      if (!shouldCapture(view.name)) continue;
      await page.send("Page.navigate", { url: `${baseUrl}${view.path}` });
      await sleep(1500);
      await assertGlobalPageHealth(page, view.name, 1440);
      const shot = await page.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
      saveScreenshot(shot.data, `${view.name}.png`);
    }

    // Desktop Finder Results (scrolled to #results)
    if (shouldCapture("desktop_1440_finder_results")) {
      await page.send("Page.navigate", { url: `${baseUrl}/tim-nem?width=160&feel=balanced&priority=support#results` });
      await sleep(1500);
      await page.evaluate(`(() => {
        const res = document.querySelector('#results');
        if (res) res.scrollIntoView({ behavior: 'instant', block: 'start' });
      })()`);
      await sleep(400);
      await assertGlobalPageHealth(page, "desktop_1440_finder_results", 1440);
      const desktopFinderShot = await page.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
      saveScreenshot(desktopFinderShot.data, "desktop_1440_finder_results.png");
    }

    console.log("\n=======================================================");
    console.log("CAPTURING OFFICIAL MOBILE (390px) SCREENSHOT SET");
    console.log("=======================================================\n");

    await page.send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true,
    });

    const mobilePageViews = [
      { name: "mobile_390_home", path: "/" },
      { name: "mobile_390_catalog", path: "/nem" },
      { name: "mobile_390_pdp_america", path: "/nem/america" },
      { name: "mobile_390_pdp_luxury", path: "/nem/luxury" },
      { name: "mobile_390_finder", path: "/tim-nem" },
      { name: "mobile_390_compare", path: "/so-sanh" },
      { name: "mobile_390_cart", path: "/gio-hang" },
      { name: "mobile_390_checkout", path: "/checkout" },
      { name: "mobile_390_account", path: "/tai-khoan" },
    ];

    for (const view of mobilePageViews) {
      if (!shouldCapture(view.name)) continue;
      await page.send("Page.navigate", { url: `${baseUrl}${view.path}` });
      await sleep(1500);
      await assertGlobalPageHealth(page, view.name, 390);
      const shot = await page.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
      saveScreenshot(shot.data, `${view.name}.png`);
    }

    // Mobile Catalog with Filters Open
    if (shouldCapture("mobile_390_catalog_filters_open")) {
      await page.send("Page.navigate", { url: `${baseUrl}/nem` });
      await sleep(1500);
      await page.evaluate(`(() => {
        const toggleBtn = document.querySelector('.catalog-mobile-toggle-btn');
        if (toggleBtn) toggleBtn.click();
      })()`);
      await sleep(400);
      await assertGlobalPageHealth(page, "mobile_390_catalog_filters_open", 390);
      const mobileFiltersOpenShot = await page.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
      saveScreenshot(mobileFiltersOpenShot.data, "mobile_390_catalog_filters_open.png");
    }

    // Mobile Finder Results
    if (shouldCapture("mobile_390_finder_results")) {
      await page.send("Page.navigate", { url: `${baseUrl}/tim-nem?width=160&feel=balanced&priority=support#results` });
      await sleep(1500);
      await page.evaluate(`(() => {
        const res = document.querySelector('#results');
        if (res) res.scrollIntoView({ behavior: 'instant', block: 'start' });
      })()`);
      await sleep(400);
      await assertGlobalPageHealth(page, "mobile_390_finder_results", 390);
      const mobileFinderResultsShot = await page.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
      saveScreenshot(mobileFinderResultsShot.data, "mobile_390_finder_results.png");
    }

    page.close();
    console.log("\n=======================================================");
    console.log("ALL 29 VISUAL QA SCREENSHOTS CAPTURED & VERIFIED!");
    console.log("=======================================================\n");
  } finally {
    chromeProc.kill();
    if (serverProc) serverProc.kill();
  }
}

run().catch((err) => {
  console.error("\n❌ QA RUN FAILED:", err);
  process.exit(1);
});
