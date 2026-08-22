import { spawn, execSync } from "child_process";
import fs from "fs";
import path from "path";
import http from "http";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\LEGION\\.gemini\\antigravity\\brain\\a03cd9b1-9a7c-4dbb-9934-e9b20d6cf5c0\\screenshots";

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

async function assertImagesLoaded(page, pageName) {
  await page.evaluate(`(async () => {
    const imgs = Array.from(document.querySelectorAll("img"));
    await Promise.all(imgs.map(img => {
      if (img.loading === "lazy") img.loading = "eager";
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return img.decode().catch(() => {});
    }));
  })()`);
  await sleep(1000);

  const imageCheck = await page.evaluate(`(() => {
    const imgs = Array.from(document.querySelectorAll("img"));
    const broken = imgs.filter(img => {
      const src = img.src || img.getAttribute("src");
      if (!src) return false;
      return !img.complete || img.naturalWidth === 0 || img.naturalHeight === 0;
    }).map(img => img.src || img.getAttribute("src"));
    return {
      total: imgs.length,
      broken: broken
    };
  })()`);

  if (imageCheck.broken.length > 0) {
    throw new Error("IMAGE LOAD FAILURE on [" + pageName + "]: Broken images: " + imageCheck.broken.join(", "));
  }
  console.log("  ✓ Image check passed for " + pageName + " (" + imageCheck.total + " images verified with natural dimensions)");
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

function fetchHtml(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve(data));
    }).on("error", () => resolve(""));
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
      throw new Error(`Evaluation failed: ${JSON.stringify(res.exceptionDetails)}`);
    }
    return res.result?.value;
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForFunction(page, fnString, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const result = await page.evaluate(fnString);
      if (result) return result;
    } catch {
      // ignore while page compiles/hydrates
    }
    await sleep(400);
  }
  const bodyText = await page.evaluate(`document.body ? document.body.innerText.substring(0, 300) : "NO BODY"`).catch(() => "EVAL FAILED");
  const currentUrl = await page.evaluate(`window.location.href`).catch(() => "NO URL");
  throw new Error(`Timeout waiting for condition on ${currentUrl} (${fnString}). Body: ${bodyText}`);
}

async function run() {
  const remotePort = 9228;
  const baseUrl = "http://localhost:3388";

  // Check if showcase server is already running, otherwise build and start production server
  let serverProc = null;
  const isUp = await isPortOpen(3388);
  if (!isUp) {
    console.log("Building Next.js production bundle with UI_SHOWCASE_MODE=true APP_ENV=staging...");
    execSync("npm run build", {
      cwd: "D:\\HOCTAP\\latvat\\nemThangLong",
      env: {
        ...process.env,
        UI_SHOWCASE_MODE: "true",
        APP_ENV: "staging",
      },
      stdio: "inherit",
    });

    console.log("Starting Next.js production server on port 3388 (no dev indicator)...");
    serverProc = spawn(process.execPath, ["./node_modules/next/dist/bin/next", "start", "-p", "3388"], {
      cwd: "D:\\HOCTAP\\latvat\\nemThangLong",
      env: {
        ...process.env,
        UI_SHOWCASE_MODE: "true",
        APP_ENV: "staging",
      },
      stdio: "ignore",
    });

    console.log("Waiting for Next.js production server to become ready on http://localhost:3388...");
    const start = Date.now();
    let ready = false;
    while (Date.now() - start < 30000) {
      if (await isPortOpen(3388)) {
        ready = true;
        break;
      }
      await sleep(1000);
    }
    if (!ready) {
      if (serverProc) serverProc.kill();
      throw new Error("Failed to start Next.js showcase production server within 30s");
    }
    console.log("Next.js showcase production server is listening!");
  } else {
    console.log("Next.js showcase server is already running on http://localhost:3388");
  }

  console.log("Pre-warming all storefront routes...");
  const warmupUrls = [
    `${baseUrl}/`,
    `${baseUrl}/nem`,
    `${baseUrl}/nem/america`,
    `${baseUrl}/nem/luxury`,
    `${baseUrl}/tim-nem`,
    `${baseUrl}/so-sanh`,
    `${baseUrl}/gio-hang`,
    `${baseUrl}/checkout`,
    `${baseUrl}/tai-khoan`,
  ];
  for (const u of warmupUrls) {
    const html = await fetchHtml(u);
    console.log(`  Warmed: ${u} (HTML length: ${html.length})`);
  }

  console.log("\nLaunching headless Chrome for visual QA and assertions...");
  const chromeProc = spawn(CHROME_PATH, [
    "--headless=new",
    `--remote-debugging-port=${remotePort}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "--disable-background-networking",
  ]);

  await sleep(2000);

  try {
    const targets = await fetchJson(`http://127.0.0.1:${remotePort}/json`);
    const target = targets.find((t) => t.type === "page") || targets[0];
    const page = new CdpClient(target.webSocketDebuggerUrl);
    await page.connect();

    await page.send("Page.enable");
    await page.send("DOM.enable");
    await page.send("CSS.enable");
    await page.send("Runtime.enable");

    // Force reduced motion for baseline capture
    await page.send("Emulation.setEmulatedMedia", {
      features: [{ name: "prefers-reduced-motion", value: "reduce" }],
    });

    console.log("\n==========================================");
    console.log("RUNNING STRICT SHOWCASE RUNTIME ASSERTIONS");
    console.log("==========================================\n");

    // Assertion 1: Badge check on /
    await page.send("Page.navigate", { url: `${baseUrl}/` });
    await sleep(1500);
    await waitForFunction(page, `Boolean(document.body && (document.body.textContent.includes("Dữ liệu trình diễn") || document.body.innerText.includes("UI Preview")))`);
    await assertImagesLoaded(page, "Homepage");
    console.log("✓ Badge check passed: Showcase indicator is present.");

    // Assertion 2: /nem Catalog populated state
    await page.send("Page.navigate", { url: `${baseUrl}/nem` });
    await sleep(1500);
    await waitForFunction(page, `Boolean(document.querySelectorAll('.catalog-card').length >= 6 && document.body.innerText.includes("4.900.000"))`);
    await assertImagesLoaded(page, "Catalog");
    const catalogCards = await page.evaluate(`document.querySelectorAll('.catalog-card').length`);
    const catalogDemoNote = await page.evaluate(`document.body.innerText.includes("Thông tin giá bán và tình trạng còn hàng đang được cập nhật")`);
    const catalogHasPrice = await page.evaluate(`document.body.innerText.includes("4.900.000")`);
    if (catalogCards < 6 || catalogDemoNote || !catalogHasPrice) {
      throw new Error(`ASSERTION FAILED on /nem: cards=${catalogCards}, demoNote=${catalogDemoNote}, hasPrice=${catalogHasPrice}`);
    }
    console.log(`✓ /nem check passed: ${catalogCards} populated product cards with prices.`);

    // Assertion 3: /nem/america PDP populated state
    await page.send("Page.navigate", { url: `${baseUrl}/nem/america` });
    await sleep(1500);
    await waitForFunction(page, `Boolean(document.querySelectorAll('.pdp-pill').length >= 3 && (document.body.innerText.includes("4.900.000") || document.body.innerText.includes("6.700.000")))`);
    await assertImagesLoaded(page, "America PDP");
    const americaPrice = await page.evaluate(`document.body.innerText.includes("4.900.000") || document.body.innerText.includes("6.700.000")`);
    const americaPills = await page.evaluate(`document.querySelectorAll('.pdp-pill').length`);
    const americaBuyButton = await page.evaluate(`document.body.innerText.toLowerCase().includes("mua ngay") || document.body.innerText.toLowerCase().includes("thêm vào giỏ") || document.body.textContent.includes("Mua ngay")`);
    if (!americaPrice || americaPills < 3 || !americaBuyButton) {
      throw new Error(`ASSERTION FAILED on /nem/america: price=${americaPrice}, pills=${americaPills}, buyButton=${americaBuyButton}`);
    }
    console.log(`✓ /nem/america check passed: price & dimensions (${americaPills} pills) active.`);

    // Assertion 4: /nem/luxury PDP populated state
    await page.send("Page.navigate", { url: `${baseUrl}/nem/luxury` });
    await sleep(1500);
    await waitForFunction(page, `Boolean(document.querySelectorAll('.pdp-pill').length >= 3 && (document.body.innerText.includes("22.900.000") || document.body.innerText.includes("18.900.000") || document.body.innerText.includes("20.900.000")))`);
    await assertImagesLoaded(page, "Luxury PDP");
    const luxuryPrice = await page.evaluate(`document.body.innerText.includes("22.900.000") || document.body.innerText.includes("18.900.000") || document.body.innerText.includes("20.900.000")`);
    const luxuryPills = await page.evaluate(`document.querySelectorAll('.pdp-pill').length`);
    if (!luxuryPrice || luxuryPills < 3) {
      throw new Error(`ASSERTION FAILED on /nem/luxury: price=${luxuryPrice}, pills=${luxuryPills}`);
    }
    console.log(`✓ /nem/luxury check passed: luxury price & dimensions (${luxuryPills} pills) active.`);

    // Assertion 5: /tim-nem Finder options
    await page.send("Page.navigate", { url: `${baseUrl}/tim-nem` });
    await sleep(1500);
    await waitForFunction(page, `Boolean(document.querySelectorAll('.finder-pill-card').length >= 4 && document.body.innerText.includes("160 cm"))`);
    const finderPills = await page.evaluate(`document.querySelectorAll('.finder-pill-card').length`);
    const finderHas160 = await page.evaluate(`document.body.innerText.includes("160 cm")`);
    if (finderPills < 4 || !finderHas160) {
      throw new Error(`ASSERTION FAILED on /tim-nem: finderPills=${finderPills}, has160=${finderHas160}`);
    }
    console.log(`✓ /tim-nem check passed: ${finderPills} dimension options available.`);

    // Assertion 6: /so-sanh Compare preselection & matrix
    await page.send("Page.navigate", { url: `${baseUrl}/so-sanh` });
    await sleep(1500);
    await waitForFunction(page, `Boolean(document.body.innerText.includes("Nệm Thăng Long Luxury") && document.body.innerText.includes("Nệm Thăng Long America"))`);
    await assertImagesLoaded(page, "Compare Matrix");
    const compareMatrix = await page.evaluate(`document.querySelectorAll('.compare-matrix, .compare-table-section').length > 0`);
    const compareHasLuxury = await page.evaluate(`document.body.innerText.includes("Nệm Thăng Long Luxury")`);
    const compareHasAmerica = await page.evaluate(`document.body.innerText.includes("Nệm Thăng Long America")`);
    const compareHasFormattedPrice = await page.evaluate(`document.body.innerText.includes("4.900.000") || document.body.innerText.includes("₫")`);
    if (!compareMatrix || !compareHasLuxury || !compareHasAmerica || !compareHasFormattedPrice) {
      throw new Error(`ASSERTION FAILED on /so-sanh: matrix=${compareMatrix}, hasLuxury=${compareHasLuxury}, hasAmerica=${compareHasAmerica}, formattedPrice=${compareHasFormattedPrice}`);
    }
    console.log("✓ /so-sanh check passed: preselected matrix with formatted VND prices.");

    // Assertion 7: /gio-hang Cart presentation items
    await page.send("Page.navigate", { url: `${baseUrl}/gio-hang` });
    await sleep(1500);
    await waitForFunction(page, `Boolean(document.body.innerText.includes("Nệm Thăng Long Luxury") && document.body.innerText.includes("Nệm Thăng Long Classic"))`);
    await assertImagesLoaded(page, "Cart");
    const cartItems = await page.evaluate(`document.body.innerText.includes("Nệm Thăng Long Luxury") && document.body.innerText.includes("Nệm Thăng Long Classic")`);
    if (!cartItems) {
      throw new Error("ASSERTION FAILED on /gio-hang: showcase cart items missing!");
    }
    console.log("✓ /gio-hang check passed: 2 showcase cart line items present with working images.");

    // Assertion 8: /checkout Populated preview
    await page.send("Page.navigate", { url: `${baseUrl}/checkout` });
    await sleep(1500);
    await waitForFunction(page, `Boolean(document.body.innerText.includes("Nệm Thăng Long Luxury") && document.body.innerText.includes("ĐẶT HÀNG"))`);
    const checkoutCustomer = await page.evaluate(`(() => {
      const nameInput = document.querySelector('input[name="customerName"]');
      const phoneInput = document.querySelector('input[name="customerPhone"]');
      return {
        name: nameInput?.value,
        phone: phoneInput?.value
      };
    })()`);
    if (!checkoutCustomer.name?.includes("Nguyễn Minh Anh") || !checkoutCustomer.phone?.includes("0900")) {
      throw new Error(`ASSERTION FAILED on /checkout: customer name=${checkoutCustomer.name}, phone=${checkoutCustomer.phone}`);
    }
    console.log(`✓ /checkout check passed: prefilled customer (${checkoutCustomer.name}, ${checkoutCustomer.phone}).`);

    // Assertion 9: /tai-khoan Account showcase profile
    await page.send("Page.navigate", { url: `${baseUrl}/tai-khoan` });
    await sleep(1500);
    await waitForFunction(page, `Boolean(document.body.innerText.includes("Nguyễn Minh Anh"))`);
    const accountUser = await page.evaluate(`document.body.innerText.includes("Nguyễn Minh Anh")`);
    if (!accountUser) {
      throw new Error("ASSERTION FAILED on /tai-khoan: showcase account profile missing!");
    }
    console.log("✓ /tai-khoan check passed: showcase account profile present.");

    console.log("\n==========================================");
    console.log("RUNNING 390PX GLOBAL OVERFLOW ASSERTIONS");
    console.log("==========================================\n");

    await page.send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true,
    });

    const routesToCheck = [
      "/",
      "/nem",
      "/nem/america",
      "/nem/luxury",
      "/tim-nem",
      "/so-sanh",
      "/gio-hang",
      "/checkout",
      "/tai-khoan",
    ];

    for (const route of routesToCheck) {
      await page.send("Page.navigate", { url: `${baseUrl}${route}` });
      await sleep(1500);

      const overflowInfo = await page.evaluate(`(() => {
        const docEl = document.documentElement;
        return {
          scrollWidth: docEl.scrollWidth,
          clientWidth: docEl.clientWidth,
          hasOverflow: docEl.scrollWidth > docEl.clientWidth + 1
        };
      })()`);

      if (overflowInfo.hasOverflow) {
        throw new Error(`390PX OVERFLOW FAILED on ${route}: scrollWidth=${overflowInfo.scrollWidth} > clientWidth=${overflowInfo.clientWidth}`);
      }
      console.log(`✓ 390px overflow passed for ${route} (scrollWidth=${overflowInfo.scrollWidth} <= clientWidth=${overflowInfo.clientWidth})`);
    }

    console.log("\n==========================================");
    console.log("CAPTURING OFFICIAL VISUAL QA SCREENSHOTS");
    console.log("==========================================\n");

    // 1. Capture Desktop (1440px)
    await page.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 900,
      deviceScaleFactor: 2,
      mobile: false,
    });

    const standardDesktopViews = [
      { name: "desktop_1440_home", path: "/" },
      { name: "desktop_1440_catalog", path: "/nem" },
      { name: "desktop_1440_pdp_america", path: "/nem/america" },
      { name: "desktop_1440_pdp_luxury", path: "/nem/luxury" },
      { name: "desktop_1440_finder", path: "/tim-nem" },
      { name: "desktop_1440_compare", path: "/so-sanh" },
      { name: "desktop_1440_cart", path: "/gio-hang" },
      { name: "desktop_1440_checkout", path: "/checkout" },
      { name: "desktop_1440_account", path: "/tai-khoan" },
    ];

    for (const view of standardDesktopViews) {
      console.log(`Capturing desktop [1440px]: ${view.path}`);
      await page.send("Page.navigate", { url: `${baseUrl}${view.path}` });
      await sleep(1500);

      const shot = await page.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
      const outPath = path.join(ARTIFACT_DIR, `${view.name}.png`);
      fs.writeFileSync(outPath, Buffer.from(shot.data, "base64"));
      const stat = fs.statSync(outPath);
      console.log(`  -> Saved ${view.name}.png (${stat.size} bytes)`);
    }

    // Capture Desktop Finder Results
    console.log("Capturing desktop [1440px]: Finder Results Flow");
    await page.send("Page.navigate", { url: `${baseUrl}/tim-nem?width=160&feel=balanced&priority=support#results` });
    await sleep(2000);
    await assertImagesLoaded(page, "Finder Results Desktop");

    await waitForFunction(page, `Boolean(document.querySelector('#results') && document.querySelectorAll('.finder-result').length >= 2 && (document.body.innerText.includes("GỢI Ý CHÍNH") || document.body.innerText.includes("Gợi ý chính") || document.body.innerText.includes("Một lựa chọn đáng xem xét")))`);
    await page.evaluate(`(() => {
      const resultsEl = document.querySelector('#results') || document.querySelector('.finder-results');
      if (resultsEl) resultsEl.scrollIntoView({ behavior: 'instant', block: 'start' });
    })()`);
    await sleep(800);

    const desktopFinderShot = await page.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
    const desktopFinderOut = path.join(ARTIFACT_DIR, "desktop_1440_finder_results.png");
    fs.writeFileSync(desktopFinderOut, Buffer.from(desktopFinderShot.data, "base64"));
    console.log(`  -> Saved desktop_1440_finder_results.png (${fs.statSync(desktopFinderOut).size} bytes)`);

    // 2. Capture Mobile (390px)
    await page.send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true,
    });

    const standardMobileViews = [
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

    for (const view of standardMobileViews) {
      console.log(`Capturing mobile [390px]: ${view.path}`);
      await page.send("Page.navigate", { url: `${baseUrl}${view.path}` });
      await sleep(1500);

      const shot = await page.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
      const outPath = path.join(ARTIFACT_DIR, `${view.name}.png`);
      fs.writeFileSync(outPath, Buffer.from(shot.data, "base64"));
      const stat = fs.statSync(outPath);
      console.log(`  -> Saved ${view.name}.png (${stat.size} bytes)`);
    }

    // Capture Mobile Finder Results
    console.log("Capturing mobile [390px]: Finder Results Flow");
    await page.send("Page.navigate", { url: `${baseUrl}/tim-nem?width=160&feel=balanced&priority=support#results` });
    await sleep(2000);
    await assertImagesLoaded(page, "Finder Results Mobile");

    await waitForFunction(page, `Boolean(document.querySelector('#results') && document.querySelectorAll('.finder-result').length >= 2 && (document.body.innerText.includes("GỢI Ý CHÍNH") || document.body.innerText.includes("Gợi ý chính") || document.body.innerText.includes("Một lựa chọn đáng xem xét")))`);
    await page.evaluate(`(() => {
      const resultsEl = document.querySelector('#results') || document.querySelector('.finder-results');
      if (resultsEl) resultsEl.scrollIntoView({ behavior: 'instant', block: 'start' });
    })()`);
    await sleep(800);

    const mobileFinderShot = await page.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
    const mobileFinderOut = path.join(ARTIFACT_DIR, "mobile_390_finder_results.png");
    fs.writeFileSync(mobileFinderOut, Buffer.from(mobileFinderShot.data, "base64"));
    console.log(`  -> Saved mobile_390_finder_results.png (${fs.statSync(mobileFinderOut).size} bytes)`);

    page.close();
    console.log("\n==========================================");
    console.log("SHOWCASE RUNTIME VISUAL QA COMPLETE & VERIFIED!");
    console.log("==========================================\n");
  } finally {
    chromeProc.kill();
    if (serverProc) serverProc.kill();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
