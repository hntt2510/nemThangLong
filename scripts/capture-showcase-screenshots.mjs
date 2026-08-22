import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import http from "http";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\LEGION\\.gemini\\antigravity\\brain\\a03cd9b1-9a7c-4dbb-9934-e9b20d6cf5c0\\screenshots";

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
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

  close() {
    if (this.ws) this.ws.close();
  }
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  const remotePort = 9223;
  const chromeProc = spawn(CHROME_PATH, [
    "--headless=new",
    `--remote-debugging-port=${remotePort}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "--disable-background-networking",
  ]);

  await sleep(1500);

  try {
    const versionInfo = await fetchJson(`http://127.0.0.1:${remotePort}/json/version`);
    const cdp = new CdpClient(versionInfo.webSocketDebuggerUrl);
    await cdp.connect();

    const { targetId } = await cdp.send("Target.createTarget", { url: "about:blank" });
    const targets = await fetchJson(`http://127.0.0.1:${remotePort}/json`);
    const target = targets.find((t) => t.id === targetId) || targets[0];
    cdp.close();

    const pageCdp = new CdpClient(target.webSocketDebuggerUrl);
    await pageCdp.connect();

    await pageCdp.send("Page.enable");
    await pageCdp.send("DOM.enable");
    await pageCdp.send("CSS.enable");
    await pageCdp.send("Network.enable");

    const desktopViews = [
      { name: "desktop_1440_home", path: "/" },
      { name: "desktop_1440_catalog", path: "/nem" },
      { name: "desktop_1440_pdp_america", path: "/nem/america" },
      { name: "desktop_1440_pdp_luxury", path: "/nem/luxury" },
      { name: "desktop_1440_finder", path: "/tim-nem" },
      { name: "desktop_1440_finder_results", path: "/tim-nem?feel=balanced&priority=support" },
      { name: "desktop_1440_compare", path: "/so-sanh" },
      { name: "desktop_1440_cart", path: "/gio-hang" },
      { name: "desktop_1440_checkout", path: "/checkout" },
      { name: "desktop_1440_account", path: "/tai-khoan" },
    ];

    const mobileViews = [
      { name: "mobile_390_home", path: "/" },
      { name: "mobile_390_catalog", path: "/nem" },
      { name: "mobile_390_pdp_america", path: "/nem/america" },
      { name: "mobile_390_finder", path: "/tim-nem" },
      { name: "mobile_390_cart", path: "/gio-hang" },
      { name: "mobile_390_checkout", path: "/checkout" },
    ];

    // 1. Desktop captures
    await pageCdp.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 900,
      deviceScaleFactor: 2,
      mobile: false,
    });

    for (const view of desktopViews) {
      console.log(`Navigating to desktop: ${view.path}`);
      await pageCdp.send("Page.navigate", { url: `http://localhost:3333${view.path}` });
      await sleep(1500);

      const shot = await pageCdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
      const outPath = path.join(ARTIFACT_DIR, `${view.name}.png`);
      fs.writeFileSync(outPath, Buffer.from(shot.data, "base64"));
      console.log(`Saved: ${outPath}`);
    }

    // 2. Mobile captures
    await pageCdp.send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true,
    });

    for (const view of mobileViews) {
      console.log(`Navigating to mobile: ${view.path}`);
      await pageCdp.send("Page.navigate", { url: `http://localhost:3333${view.path}` });
      await sleep(1500);

      const shot = await pageCdp.send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
      const outPath = path.join(ARTIFACT_DIR, `${view.name}.png`);
      fs.writeFileSync(outPath, Buffer.from(shot.data, "base64"));
      console.log(`Saved: ${outPath}`);
    }

    pageCdp.close();
    console.log("All showcase screenshots successfully captured!");
  } finally {
    chromeProc.kill();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
